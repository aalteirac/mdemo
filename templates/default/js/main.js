'use strict';

define([
	'js/qlik',
	'jquery',
	'app'
], function(qlik, $, app) {
	
	var views = {
		main: { template: 'views/main/main.html', ctrl: 'views/MainCtrl', ctrlFile: 'extView/main/mainCtrl'  }
	}
	
	app.config(['$routeProvider', function($routeProvider) {
		
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
			apps: [],
			rows: [
				[
					{ title: "First object", id: {}, color: 'default', text: "Edit me!", width: 6, height: 200, selected: false },
					{ title: "Second object", id: {}, color: 'default', text: "Edit me!", width: 6, height: 200, selected: false },
					{ title: "Third object", id: {}, color: 'default', text: "Edit me!", width: 12, height: 200, selected: false },
					{ title: "First object", id: {}, color: 'default', text: "Edit me!", width: 6, height: 200, selected: false },
					{ title: "Second object", id: {}, color: 'default', text: "Edit me!", width: 6, height: 200, selected: false }
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
						
						rows[0].title = result.title;
						
						rows[0].id.app = result.id.app;
						rows[0].id.object = result.id.object;
						rows[0].id.type = result.id.type;
						
						rows[0].color = result.color;
						
						rows[0].text = result.text;
						rows[0].width = result.width;
						rows[0].height = result.height;

					} else {
						
						rows.forEach(function(item) {
							item.color = result.color;
							item.width = result.width;
							item.height = result.height;
						});
						
					}
					
					qlik.resize();
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
			
			removePanel: removePanel,
			removePanels: removePanels,
			
			selectPanel: selectPanel
        };
		
		return self;
    }]);
	
	app.controller('NavCtrl', function ($scope, selfService) {
		
		$scope.clearPanels = selfService.resetSelected;
		$scope.switchEdit = selfService.switchEdit;
		$scope.configPanels = selfService.configPanels;
		$scope.removePanels = selfService.removePanels;
		
		$scope.state = selfService.getState();
		
		$scope.modified = false;
		
		$scope.user = {
			name: 'awesome user'
		};
		
		$scope.navbar = {
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
		};
		
		$scope.modify = function() {
			$scope.modified = true;
		}
		
		$scope.save = function() {
			$scope.modified = false;
		}
		
	});
	
	app.controller('DefaultCtrl', function ($scope, $window) {
		$scope.title = 'Default';
		$scope.description = 'This is a mashup template that works with Anthony Alteirac MDemo\'s mashup and that combines AngularJS, RequireJS and Bootstrap! Enjoy ;)';
		
		$scope.open = function() {
			$window.location.href = 'http://branch.qlik.com/projects/showthread.php?529-Mashup-Builder-for-Demo';
		}
	});
	
	return app;
});

var rootPath=window.location.hostname;
var portUrl="80";
if(window.location.port==""){
    if("https:" == window.location.protocol)
        portUrl="443";
    else{
        portUrl="80";
    }
}
else
    portUrl=window.location.port;

var pathRoot="//localhost:4848/extensions/";
if(portUrl!="4848")
    pathRoot="//"+rootPath+":"+portUrl+"/resources/";

var config = {
    host: window.location.hostname,
    prefix: "/",
    port: window.location.port,
    isSecure: "https:" === window.location.protocol
};

function getURLParameter(a) {
    return (RegExp(a + "=(.+?)(&|$)").exec(location.search) || [null, null])[1]
}

function makeDroppy(qlik) {
    $(".qvplaceholder").on('dragover', function (event) {
        event.preventDefault();
        $(this).addClass("drop-hover");
    }).on('dragleave', function (event) {
        event.preventDefault();
        $(this).removeClass("drop-hover");
    }).on('drop', function (event) {
        var app = qlik.openApp(decodeURI(getURLParameter('app')), config);
        $(this).removeClass("drop-hover");
        event.preventDefault();
        $(this).empty();
		
        var id = event.originalEvent.dataTransfer.getData('text').split("#")[1];
        var type = event.originalEvent.dataTransfer.getData('text').split("#")[0];
        $(this).removeClass('qv');
        $(this).removeClass('qvtarget');
		
        if (type != 'snapshot') {
            qlik.openApp(app.id).getObject($('#CurrentSelections'), 'CurrentSelections');
            localStorage.setItem(this.id + '#' + app.id, id);
            qlik.openApp(app.id).getObject(this, id).then(function (o) {
            });
        }
        else {
            localStorage.setItem(this.id + '#' + app.id, id + '#snap');
            qlik.openApp(app.id).getSnapshot(this, id).then(function () {
            });
        }
    })
}