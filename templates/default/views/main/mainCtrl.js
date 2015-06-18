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

	
	//app_cached_providers
	//.$controllerProvider
	
	app.controller('NavCtrl', function ($scope, dataService, selfService) {
		
		$scope.switchEdit = selfService.switchEdit;
		$scope.configPage = selfService.configPage;
		
		$scope.clearPanels = selfService.resetSelected;
		$scope.configPanels = selfService.configPanels;
		$scope.removePanels = selfService.removePanels;
	
		$scope.state = dataService.getState();
		$scope.store = dataService.getStore();
		
		$scope.navbar = $scope.store.navbar;
		

		
	});

	app.controller('views/MainCtrl', function ($scope, $modal, dataService, selfService, cssInjector) {

		$scope.open = function() {
			$window.location.href = 'http://branch.qlik.com/projects/showthread.php?529-Mashup-Builder-for-Demo';
		}

		$scope.state = dataService.getState();
		$scope.store = dataService.getStore();
		
		$scope.$watch(function(){
			return dataService.getStore();
		}, function (newValue, oldValue) {
			if(oldValue != newValue) $scope.state.modified = true;
		}, true);
		
		$scope.header = $scope.store.header;
		$scope.rows = $scope.store.rows;
		
		cssInjector.removeAll();
		cssInjector.add("css/" + $scope.store.navbar.theme + "/bootstrap.min.css");

		$scope.sortableOptions = {
			handle: '.dragHandle',
			'ui-floating': true
		}
		
		$scope.addPanel = function() {
			selfService.addPanel({
				title: "New object",
				showTitle: true,
				id: {},
				color: 'default',
				text: "This item is empty!",
				width: 4,
				height: 200
			});
		}
		
		$scope.selectPanel = selfService.selectPanel;
		$scope.configPanel = selfService.configPanel;
		$scope.deletePanel = selfService.removePanel;
	});
	
	app.controller('views/MainModalConfigPanelCtrl', function ($scope, $modalInstance, panelConfig, dataService, selfService, $q, cssInjector) {

		cssInjector.add("bower_components/ladda/dist/ladda-themeless.min.css");
		
		$scope.config = $.extend(true, {}, panelConfig[0]);
		
		$scope.state = dataService.getState();
		$scope.cache = dataService.getCache();
		
		$scope.multiple = panelConfig.length > 1;

		$scope.appChanged = function(selectedApp) {
			
			$scope.appLoading = true;
			
			$scope.selectedApp = selectedApp; 
			$scope.app = qlik.openApp(selectedApp.id, config);
			
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
						
						masterObjects.items.push(e)
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
					
					c.qData.cells.forEach(function(c) {
                        var g = c;
						
                        g.id = c.name;
						g.appid = $scope.app.id
						newSheet.items.push(g);
						
						$scope.app.getObjectProperties(g.id).then(function(b) {
                            var c = b.properties;
                            var h = util.getIcon(c.qInfo.qType);
							
                            g.icon = h ? g.icon = h : g.icon = "toolbar-help";
							
							g.type = c.qInfo.qType;
							
							c.title && c.title.trim && c.title.trim().length > 0
							? g.title = c.title
							: c.markdown && c.markdown.trim && c.markdown.trim().length > 0
							? $scope.app.getObject(g.id).then(function(b) {})
							: "object" == typeof c.title
							? $scope.app.getObject(g.id).then(function(a) {
                                g.title = a.layout.title
                            })
							:
							c.title
							? g.title = "[no title]"
							: $scope.app.getObject(g.id).then(function(a) {
                                !a.layout.title || a.layout.title && "" === a.layout.title.trim()
								? g.title = "[no title]"
								: g.title = a.layout.title
                            })
                        })
                    })
					
					$scope.objects.push(newSheet);

                })
				
				sheetDef.resolve();
			});
			
			$q.all([masterObjectDef.promise, sheetDef.promise]).then(function() {
				$scope.appLoading = false;
			})
			
			
		}
		
		$scope.setObject = function(item) {
			$scope.config.id.app = item.appid;
			$scope.config.id.object = item.id;
			$scope.config.id.type = item.type;
		}
		
		$scope.ok = function () {
			
			if(!$scope.multiple) {

				$.extend(true, panelConfig[0], $scope.config);
				$modalInstance.close(true);
				
			} else {
				
				panelConfig.forEach(function(item) {
					item.showTitle = $scope.config.showTitle;
					item.color = $scope.config.color;
					item.width = $scope.config.width;
					item.height = $scope.config.height;
				});
				
				$modalInstance.close(true);
				
			}
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		
	});
	
	app.controller('views/MainModalDeletePanelCtrl', function ($scope, $modalInstance) {

		$scope.ok = function () {
			$modalInstance.close(true);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		
	});
	
	app.controller('views/MainModalConfigPageCtrl', function ($scope, $modalInstance, pageConfig, cssInjector) {
		
		cssInjector.add("bower_components/angular-ui-tree/angular-ui-tree.min.css");
		
		$scope.mashup = $.extend(true, {}, pageConfig.mashup);
		$scope.themes = pageConfig.themes;
		$scope.navbar = $.extend(true, {}, pageConfig.navbar);
		$scope.header = $.extend(true, {}, pageConfig.header);
		
		$scope.theme = $scope.navbar.theme;
		
		$scope.firstOpen = true;
		
		$scope.remove = function(scope) {
		    scope.remove();
		};

		$scope.toggle = function(scope) {
		    scope.toggle();
		};
		
		$scope.addPage = function() {
			$scope.navbar.left.push({
		        id: $scope.navbar.left.length,
		        title: 'Page ' + ($scope.navbar.left.length + 1),
				page: ($scope.navbar.left.length + 1),
				type: 'link',
		        items: []
		    })
		};

		$scope.moveLastToTheBeginning = function() {
		    var a = $scope.data.pop();
		    $scope.data.splice(0, 0, a);
		};

		$scope.newSubItem = function(scope) {
		    var nodeData = scope.$modelValue;
					
		    nodeData.items.push({
		        id: nodeData.id * 10 + nodeData.items.length,
		        title: nodeData.title + '.' + (nodeData.items.length + 1),
				page: '1',
				type: 'link',
		        items: []
		    });
		};

		$scope.collapseAll = function() {
		    $scope.$broadcast('collapseAll');
		};

		$scope.expandAll = function() {
		    $scope.$broadcast('expandAll');
		};

		$scope.ok = function () {
			
			if($scope.navbar.theme != pageConfig.navbar.theme) {
				cssInjector.add("css/" + $scope.navbar.theme + "/bootstrap.min.css");
				cssInjector.remove("css/" + pageConfig.navbar.theme + "/bootstrap.min.css");
			}
			
			pageConfig.mashup.color = $scope.mashup.color;
			pageConfig.mashup.name = $scope.mashup.name;

			pageConfig.navbar.theme = $scope.navbar.theme;
			pageConfig.navbar.brand = $scope.navbar.brand;
			pageConfig.navbar.left = $scope.navbar.left;
			
			$.extend(true, pageConfig.header, $scope.header);
			
			$modalInstance.close(true);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		
	});
		
		
		
});