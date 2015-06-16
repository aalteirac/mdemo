var app_cached_providers = {};

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

define([
	'js/qlik',
	'angular',
	'angularRoute',
	'angularBootstrap',
	'angularUiSortable',
	'angularUiTree',
	'angularCssInjector',
	'angularLadda'
], function(qlik, angular) {
	
	var app = angular.module('default', [
		'ngRoute',
		'ui.bootstrap',
		'ui.sortable',
		'ui.tree',
		'angular.css.injector',
		'angular-ladda'
	]);
	
	app.config(['$controllerProvider', '$compileProvider',
		function(controllerProvider, compileProvider) {
			app_cached_providers.$controllerProvider = controllerProvider;
			app_cached_providers.$compileProvider = compileProvider;
		}
	]);
	
	app.filter('startFrom', function() {
		return function(input, start) {
			start = +start; //parse to int
			return (input) ? input.slice(start) : [];
		}
	});
	
	app.directive("qvPlaceholder", function() {
		return {
			restrict: "A",
			
			scope: {
				qvPlaceholder : '='
			},
			
			link: function(scope, elem, attrs) {

				scope.$watchCollection('[qvPlaceholder.app, qvPlaceholder.object, qvPlaceholder.type]', function(newValue, oldValue, scope) {

					if (typeof scope.qvPlaceholder.type !== 'undefined') {
						$(elem).empty();
					
						$(elem).removeClass('qv');
						$(elem).removeClass('qvtarget');
					
						if (scope.qvPlaceholder.type != "snapshot") {
							qlik.openApp(scope.qvPlaceholder.app).getObject(elem, scope.qvPlaceholder.object).then(function (o) {
								scope.qvPlaceholder.objectRef = o;
							});
							
							qlik.openApp(scope.qvPlaceholder.app).getObject($('#CurrentSelections'), 'CurrentSelections');
						} else {
							qlik.openApp(scope.qvPlaceholder.app).getSnapshot(elem, scope.qvPlaceholder.object).then(function () {});
						}
					}
					
				});
				
				$(elem).on('dragover', function (event) {
					
					event.preventDefault();
					$(this).addClass("drop-hover");
					
				}).on('dragleave', function (event) {
					
					event.preventDefault();
					$(this).removeClass("drop-hover");
					
				}).on('drop', function (event) {
					
					event.preventDefault();
					$(this).removeClass("drop-hover");
					
					var id = event.originalEvent.dataTransfer.getData('text').split("#")[1];
					var type = event.originalEvent.dataTransfer.getData('text').split("#")[0];
					
					var app = qlik.openApp(decodeURI(getURLParameter('app')), config);
					
					scope.$apply(function(){
						scope.qvPlaceholder.app = app.id;
						scope.qvPlaceholder.object = id;
						scope.qvPlaceholder.type = type;
					});
					
				});
			}
		}
	});
	

	return app;
});