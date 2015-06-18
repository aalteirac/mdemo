'use strict';

define([
	'js/qlik',
	'jquery',
	'app',
	'extView/main/mainCtrl',
	'extView/mashups/mashupsCtrl'
], function(qlik, $, app) {

	app.service('dataService', ['$route', '$routeParams', 'Notification', function($route, $routeParams, Notification) {
		
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
			
		Notification.info('<span class="glyphicon glyphicon-info-sign"></span> Using local repo!');
		
		var store = null;
		try {
			store = JSON.parse(localStorage.getItem('mdemo#default#store'))
		} catch(e) {
			localStorage.removeItem('mdemo#default#store')
		}
	
		if(store == null) {
			Notification.info('<span class="glyphicon glyphicon-info-sign"></span> Creating local repo!');
			
			var newStore = {
				mashups: {
					'default': {
						name: "Default Mashup",
						title: 'default',
						color: 'default',
						theme: 'default',
						navbar: {
							brand: 'Qlik',
							left: [
								{ id: 1, type: 'link', title: 'Default', page: '1', items: [] }
							]
						},
						pages: {
							'1': {
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
			
			localStorage.setItem('mdemo#default#store', JSON.stringify(newStore));
			
			store = newStore;
		
		}

		var getStore = function() {
			return store;
		}
		
		var setStore = function() {
			state.modified = false;
			
			localStorage.setItem('mdemo#default#store', JSON.stringify(store));
			
			Notification.success('<span class="glyphicon glyphicon-ok-sign"></span> Saved successfully!');
		}
		
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
		
		var getConfig = function() {
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
			
			Notification.success('<span class="glyphicon glyphicon-ok-sign"></span> Panel removed successfully!');
		}
		
		var self = {
			
			getState: function () {
                return state;
            },
			getCache: function () {
                return cache;
            },
			
			getStore: getStore,
			setStore: setStore,
			getMashup: getMashup,
			getConfig: getConfig,
            
			resetSelected: resetSelected,
			recalcMultiselect: recalcMultiselect,
			
			add: add,
			remove: remove
        };
		
		qlik.getAppList(function(b) {
			b.forEach(function(a) {
				cache.apps.push({
					id: a.qDocId,
					type: a.qDocName
				})
			})
		});
		
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
					rows: function () {
						return rows;
					}
				}
			});
			
		}
		
		var configPage = function() {
			
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'views/main/main.modal.configPage.html',
				controller: 'views/MainModalConfigPageCtrl',
				size: 'lg'
			});
			
		}
		
		var remove = function(selected, index) {
			
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'views/main/main.modal.deletePanel.html',
				controller: 'views/MainModalDeletePanelCtrl',
				resolve: {
					selected: function () {
						return selected;
					},
					index: function() {
						return index;
					}
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
		
		var modified = function() {
			state.modified = true;
		}
		
		var save = function() {
			dataService.setStore();
		}
		
		var configPanel = function(index) {
			var config = dataService.getConfig();
			modalService.config([ config.rows[0][index] ]);
		}
		
		var configPanels = function() {
			var config = dataService.getConfig();
			modalService.config(config.rows[0].filter(function(item) {
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
			var config = dataService.getConfig();
			config.rows[0][index].selected = !config.rows[0][index].selected;
			dataService.recalcMultiselect();
		}

        var self = {
            switchEdit: switchEdit,
			modified: modified,
			save: save,
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
