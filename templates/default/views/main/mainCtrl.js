Array.prototype.removeIf = function(callback) {
    var i = this.length;
    while (i--) {
        if (callback(this[i], i)) {
            this.splice(i, 1);
        }
    }
};

define([
	'js/qlik',
	'app',
	'jquery',
	'utils'
], function (qlik, app, $, util) {

	
	app_cached_providers
	.$controllerProvider
	.register('views/MainCtrl', function ($scope, $modal, selfService) {

		$scope.state = selfService.getState();
		$scope.rows = $scope.state.rows;
		
		$scope.sortableOptions = {
			handle: '.dragHandle',
			'ui-floating': true
		}
		
		$scope.addPanel = function() {
			selfService.addPanel({ title: "New object", id: {}, color: 'default', text: "This item is empty!", width: 4, height: 200 });
		}
		
		$scope.selectPanel = selfService.selectPanel;
		$scope.configPanel = selfService.configPanel;
		$scope.deletePanel = selfService.removePanel;
	});
	
	app_cached_providers
	.$controllerProvider
	.register('views/MainModalConfigPanelCtrl', function ($scope, $modalInstance, panelConfig, selfService, $q, cssInjector) {
		
		cssInjector.add("bower_components/ladda/dist/ladda-themeless.min.css");
		
		$scope.multiple = panelConfig.length > 1;
		
		if(!$scope.multiple) {
			
			$scope.title = panelConfig[0].title;
			
			$scope.id = {
				app: panelConfig[0].id.app,
				object: panelConfig[0].id.object,
				type: panelConfig[0].id.type
			};
			
			$scope.color = panelConfig[0].color;

			$scope.text = panelConfig[0].text;
			$scope.width = panelConfig[0].width;
			$scope.height = panelConfig[0].height;
			
		} else {
			
			$scope.color = panelConfig[0].color;
			$scope.width = panelConfig[0].width;
			$scope.height = panelConfig[0].height;
			
		}
		
		$scope.state = selfService.getState();
		
		$scope.currentPage = 1;
		$scope.maxSize = 5;
		
		$scope.pageSize = 5;
		$scope.totalItems = 0;
		
		$scope.buttons = {
			visualizations: {
				available: !0,
				active: !0,
				name: "visualizations"
			},
			snapshots: {
				available: !0,
				active: !1,
				name: "snapshots"
			}
		};
		
		$scope.toggle = function(a) {
			for (var type in $scope.buttons)
				$scope.buttons[type] !== a && ($scope.buttons[type].active = !1);
			
			a.active = !0;
		};

		$scope.appChanged = function(newApp) {
			$scope.appLoading = true;
			
			$scope.app = qlik.openApp(newApp.id, config);
			
			$scope.objects = [];
			
			var masterObjects = {
				title: 'Master Objects',
				type: 'masterobject',
				items: []
			}
			
			var masterObjectDef = $q.defer();
			$scope.app.getAppObjectList("masterobject", function(a) {
				a.qAppObjectList.qItems.forEach(function(a) {
					var c = $scope.objects.filter(function(b) {
						return a.qInfo.qId === b.id
					});
					if (!(c.length > 0)) {
						var e = a;
						e.type = a.qData.visualization
						e.id = a.qInfo.qId
						e.title = a.qMeta && a.qMeta.title ? a.qMeta.title : "[no title]"
						e.tags = a.qData.tags
						e.appid = $scope.app.id;
						var g = util.getIcon(a.qData.visualization);
						e.icon = g ? g : "toolbar-help"
						masterObjects.items.unshift(e)
					}
				})
				
				masterObjectDef.resolve();
				$scope.totalItems = $scope.objects.length;
			})
			
			$scope.objects.push(masterObjects);
			
			var sheetDef = $q.defer();
			$scope.app.getAppObjectList("sheet", function(c) {
                var h = c.qAppObjectList.qItems.sort(function(a, b) {
                    return a.qData.rank - b.qData.rank
                });
				
				h.forEach(function(c) {
					
					var newSheet = {
						id: c.qInfo.qId,
                        title: c.qData.title,
                        type: 'sheet',
						items: []
					}
					
					$scope.objects.push(newSheet);

					
					/*
					c.qData.cells.forEach(function(c) {
                        var g = c;
                        g.id = c.name, g.appid = f.id, b.push(g), f.getObjectProperties(g.id).then(function(b) {
                            var c = b.properties,
                                h = util.getIcon(c.qInfo.qType);
                            g.icon = h ? g.icon = h : g.icon = "toolbar-help", c.title && c.title.trim && c.title.trim().length > 0 ? g.title = c.title : c.markdown && c.markdown.trim && c.markdown.trim().length > 0 ? f.getObject(g.id).then(function(b) {
                                //g.title = a("<div>" + e.toHTML(b.layout.markdown, b.layout) + "</div>").text()
                            }) : "object" == typeof c.title ? f.getObject(g.id).then(function(a) {
                                g.title = a.layout.title
                            }) : c.title ? g.title = "[no title]" : f.getObject(g.id).then(function(a) {
                                !a.layout.title || a.layout.title && "" === a.layout.title.trim() ? g.title = "[no title]" : g.title = a.layout.title
                            })
                        })
                    })
					*/
                })
				
				sheetDef.resolve();
			});
			
			$q.all([masterObjectDef.promise, sheetDef.promise]).then(function() {
				$scope.appLoading = false;
			})
			
			
		}
		
		$scope.ok = function () {
			
			if(!$scope.multiple) {

				$modalInstance.close({
					title: $scope.title,
					
					id: $scope.id,
					color: $scope.color,

					text: $scope.text,
					width: $scope.width,
					height: $scope.height
				});
				
			} else {
				
				$modalInstance.close({
					color: $scope.color,
					width: $scope.width,
					height: $scope.height
				});
				
			}
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		
	});
	
	app_cached_providers
	.$controllerProvider
	.register('views/MainModalDeletePanelCtrl', function ($scope, $modalInstance) {
		
		$scope.ok = function () {
			$modalInstance.close(true);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		
	});
});