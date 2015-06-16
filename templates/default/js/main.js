'use strict';

define([
	'js/qlik',
	'jquery',
	'app',
	'extView/main/mainCtrl'
], function(qlik, $, app) {
	
	var views = {
		/* main: { template: 'views/main/main.html', ctrl: 'views/MainCtrl', ctrlFile: 'extView/main/mainCtrl'  } */
	}
	
	app.config(['$routeProvider', function($routeProvider) {
		
		$routeProvider.when('/main', {
			templateUrl: 'views/main/main.html',
			controller: 'views/MainCtrl'
		});
		
		$.each(views, function(k, v) {
			$routeProvider.when('/' + k, {
				templateUrl: v.template,
				controller: v.ctrl,
				resolve: {
					loadMainCtrl: ["$q", function($q) { 
						var deferred = $q.defer();
						require([v.ctrlFile], function() { deferred.resolve(); });
						return deferred.promise;
					}],
				},
			});
		})
		
		$routeProvider.otherwise({redirectTo: '/main'});
	}]);
	
	app.service('dataService', function() {
		
        var store = {
			edit: false,
			multiselect: false,
			modified: false,
			navbar: {
				brand: 'Qlik',
				left: [
					{ type: 'link', title: 'Link' },
					{ type: 'link', title: 'Link' },
					{
						type: 'dropdown',
						title: 'Dropdown',
						items: [
							{ type: 'link', title: 'Action' },
							{ type: 'link', title: 'Another action' },
							{ type: 'link', title: 'Something else here' },
							{ type: 'sep' },
							{ type: 'link', title: 'Separated link' },
							{ type: 'sep' },
							{ type: 'link', title: 'One more separated link' }
						]
					}
				]
			},
			header: {
				show: true,
				title: 'Default',
				description: 'This is a mashup template that works with Anthony Alteirac MDemo\'s mashup and that combines AngularJS, RequireJS and Bootstrap! Enjoy ;)'
			},
			apps: [],
			rows: [
				[

				]
			]
		};
		
		qlik.getAppList(function(b) {
			b.forEach(function(a) {
				store.apps.push({
					id: a.qDocId,
					type: a.qDocName
				})
			})
		});
		
		var resetSelected = function() {
			store.rows.forEach(function(row) {
				row.forEach(function(item) {
					item.selected = false;
				});
			});
			store.multiselect = false;
		};
		
		var recalcMultiselect = function() {
			var retVal = 0;
			store.rows.forEach(function(row) {
				row.forEach(function(item) {
					if(item.selected) retVal++;
				});
			});
			store.multiselect = (retVal > 0);
		};
		
		var add = function(row) {
			store.rows[0].push(row);
		}
		
		var remove = function(selected, index) {
			if(!selected) {	
				store.rows[0].splice(index, 1);
			} else {
				store.rows[0].removeIf(function(item) {
					return item.selected;
				})
			}
		}
		
		var self = {
			
            getStore: function () {
                return store;
            },
            
			resetSelected: resetSelected,
			recalcMultiselect: recalcMultiselect,
			add: add,
			remove: remove
        };
		
		return self;
		
		
	});
	
	app.service('modalService',  ['$modal', 'dataService', function ($modal, dataService) {
		
		var config = function(rows) {
			
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'views/main/main.modal.configPanel.html',
				controller: 'views/MainModalConfigPanelCtrl',
				size: 'lg',
				resolve: {
					panelConfig: function () {
						return rows;
					}
				}
			});

			modalInstance.result.then(function (result) {
				if(result) {
					
					if(rows.length == 1) {
						
						$.extend(rows[0], result);

					} else {
						
						rows.forEach(function(item) {
							item.showTitle = result.showTitle;
							item.color = result.color;
							item.width = result.width;
							item.height = result.height;
						});
						
					}
					
					qlik.resize();
				}
			});
			
		}
		
		var configPage = function() {
			
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'views/main/main.modal.configPage.html',
				controller: 'views/MainModalConfigPageCtrl',
				size: 'lg',
				resolve: {
					pageConfig: function () {
						return dataService.getStore();
					}
				}
			});
			
		}
		
		var remove = function(selected, index) {
			
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'views/main/main.modal.deletePanel.html',
				controller: 'views/MainModalDeletePanelCtrl'
			});

			modalInstance.result.then(function (result) {
				if(result) {
					dataService.remove(selected, index);
					qlik.resize();
				}
			});
			
		}
		
		var modal = {
			config: config,
			configPage: configPage,
			remove: remove
		};
		
		return modal;
	}])
	
	app.service('selfService', [ 'modalService', 'dataService', function (modalService, dataService) {
		
		var store = dataService.getStore();
		
		var switchEdit = function() {
			store.edit = !store.edit;
			dataService.resetSelected();
		}
		
		var configPanel = function(index) {
			modalService.config([ store.rows[0][index] ]);
		}
		
		var configPanels = function() {
			modalService.config(store.rows[0].filter(function(item) {
				return item.selected;
			}));
		}
		
		var configPage = function() {
			modalService.configPage();
		}

		var removePanel = function(index) {
			modalService.remove(false, index);
		}
		
		var removePanels = function() {
			modalService.remove(true);
		}
		
		var selectPanel = function(index) {
			store.rows[0][index].selected = !store.rows[0][index].selected;
			dataService.recalcMultiselect();
		}

        var self = {
            getState: function () {
                return store;
            },
            switchEdit: switchEdit,
			resetSelected: dataService.resetSelected,
			
			addPanel: dataService.add,
			
			configPanel: configPanel,
			configPanels: configPanels,
			configPage: configPage,
			
			removePanel: removePanel,
			removePanels: removePanels,
			
			selectPanel: selectPanel
        };
		
		return self;
    }]);
	
	
	
	return app;
});
