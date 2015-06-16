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
	
	app.controller('NavCtrl', function ($scope, selfService) {
		
		$scope.switchEdit = selfService.switchEdit;
		$scope.configPage = selfService.configPage;
		
		$scope.clearPanels = selfService.resetSelected;
		$scope.configPanels = selfService.configPanels;
		$scope.removePanels = selfService.removePanels;
		
		$scope.state = selfService.getState();
		
		$scope.modified = false;
		
		$scope.navbar = $scope.state.navbar;
		
		$scope.modify = function() {
			$scope.modified = true;
		}
		
		$scope.save = function() {
			$scope.modified = false;
		}
		
	});

	app.controller('views/MainCtrl', function ($scope, $modal, selfService) {

		$scope.open = function() {
			$window.location.href = 'http://branch.qlik.com/projects/showthread.php?529-Mashup-Builder-for-Demo';
		}

		$scope.state = selfService.getState();
		
		$scope.header = $scope.state.header;
		$scope.rows = $scope.state.rows;
		
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
	
	app.controller('views/MainModalConfigPanelCtrl', function ($scope, $modalInstance, panelConfig, selfService, $q, cssInjector) {
		
		cssInjector.add("bower_components/ladda/dist/ladda-themeless.min.css");
		
		$scope.multiple = panelConfig.length > 1;
		
		$scope.config = $.extend({}, panelConfig[0]);
		$scope.config.id = $.extend({}, $scope.config.id);
		
		$scope.state = selfService.getState();
		
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

				$modalInstance.close($scope.config);
				
			} else {
				
				$modalInstance.close({
					color: $scope.config.color,
					width: $scope.config.width,
					height: $scope.config.height,
					showTitle: $scope.config.showTitle
				});
				
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
		
		$scope.navbar = pageConfig.navbar;
		$scope.header = pageConfig.header;
		
		$scope.firstOpen = true;
		
		$scope.remove = function(scope) {
		    scope.remove();
		};

		$scope.toggle = function(scope) {
		    scope.toggle();
		};

		$scope.moveLastToTheBeginning = function() {
		    var a = $scope.data.pop();
		    $scope.data.splice(0, 0, a);
		};

		$scope.newSubItem = function(scope) {
		    var nodeData = scope.$modelValue;
		    nodeData.nodes.push({
		        id: nodeData.id * 10 + nodeData.nodes.length,
		        title: nodeData.title + '.' + (nodeData.nodes.length + 1),
		        nodes: []
		    });
		};

		$scope.collapseAll = function() {
		    $scope.$broadcast('collapseAll');
		};

		$scope.expandAll = function() {
		    $scope.$broadcast('expandAll');
		};

		
		
		$scope.ok = function () {
			$modalInstance.close(true);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		
	});
		
		
		
});