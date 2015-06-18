'use strict';

define([
	'js/qlik',
	'jquery',
	'app',
	'extView/main/mainCtrl',
	'extView/mashups/mashupsCtrl'
], function(qlik, $, app) {

	app.service('dataService', ['$route', '$routeParams', function($route, $routeParams) {
		
		var state = {
			edit: false,
			multiselect: false,
			modified: false,
			route: $routeParams,
		}
		
		var cache = {
			apps: [],
			themes: [
				'cerulean',
				'cosmo',
				'cyborg',
				'darkly',
				'default',
				'flatly',
				'journal',
				'lumen',
				'paper',
				'readable',
				'sandstone',
				'simplex',
				'slate',
				'spacelab',
				'superhero',
				'united',
				'yeti'
			]
		}
		
		var navBar = {
			brand: 'Qlik',
			left: [
				{ id: 1, type: 'link', title: 'Default', page: '1', items: [] }
			],
			theme: 'default'
		}
		
        var store = {
			mashups: {
				'default': {
					name: "Default Mashup",
					title: 'default',
					color: 'default',
					navbar: navBar,
					pages: {
						'1': {
							navbar: navBar,
							header: {
								show: true,
								title: 'Default',
								description: 'Welcome to the default mashup!'
							},
							rows: [
								[

								]
							]
						}
					}
				}
			}
		};
		
		qlik.getAppList(function(b) {
			b.forEach(function(a) {
				cache.apps.push({
					id: a.qDocId,
					type: a.qDocName
				})
			})
		});
		
		
		var getMashup = function() {
			
			if(typeof store.mashups[$routeParams.mashupId] === 'undefined') {
				
				store.mashups[$routeParams.mashupId] = {
					name: "New mashup",
					title: $routeParams.mashupId,
					color: 'default',
					navbar: {
						brand: 'Company',
						left: [
							{ id: 1, type: 'link', title: 'Main', page: '1', items: [] }
						],
						theme: 'default'
					},
					pages: { }
				}
				
			}
			
			return store.mashups[$routeParams.mashupId];
		}
		
		var getPage = function() {

			var mashup = getMashup();

			if(typeof mashup.pages[$routeParams.pageId] === 'undefined') {
				mashup.pages[$routeParams.pageId] = {
					navbar: mashup.navbar,
					header: {
						show: true,
						title: 'Page ' + $routeParams.pageId,
						description: 'This is page ' + $routeParams.pageId
					},
					rows: [
						[

						]
					]
				}
			}
			
			return mashup.pages[$routeParams.pageId];
		}
		
		var getStore = function() {
			if($route.current.$$route.originalPath == '/mashups')
				return store;
			
			return getPage();
		}
		
		var resetSelected = function() {
			var page = getPage();
			page.rows.forEach(function(row) {
				row.forEach(function(item) {
					item.selected = false;
				});
			});
			state.multiselect = false;
		};
		
		var recalcMultiselect = function() {
			var page = getPage();
			var retVal = 0;
			page.rows.forEach(function(row) {
				row.forEach(function(item) {
					if(item.selected) retVal++;
				});
			});
			state.multiselect = (retVal > 0);
		};
		
		var add = function(row) {
			var page = getPage();
			page.rows[0].push(row);
		}
		
		var remove = function(selected, index) {
			var page = getPage();
			if(!selected) {	
				page.rows[0].splice(index, 1);
			} else {
				page.rows[0].removeIf(function(item) {
					return item.selected;
				})
			}
		}
		
		var self = {
			
			getState: function () {
                return state;
            },
			getCache: function () {
                return cache;
            },
			getStore: function () {
                return getStore();
            },
			getMashup: function () {
                return getMashup();
            },
            
			resetSelected: resetSelected,
			recalcMultiselect: recalcMultiselect,
			add: add,
			remove: remove
        };
		
		return self;
		
		
	}]);
	
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
						return $.extend(
							{},
							dataService.getCache(),
							dataService.getStore(),
							{ mashup: dataService.getMashup() }
						);
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
		
		var state = dataService.getState();
		
		var switchEdit = function() {
			state.edit = !state.edit;
			dataService.resetSelected();
		}
		
		var configPanel = function(index) {
			var store = dataService.getStore();
			modalService.config([ store.rows[0][index] ]);
		}
		
		var configPanels = function() {
			var store = dataService.getStore();
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
			var store = dataService.getStore();
			store.rows[0][index].selected = !store.rows[0][index].selected;
			dataService.recalcMultiselect();
		}

        var self = {
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
