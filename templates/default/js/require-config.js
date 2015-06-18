'use strict';

var root = 				'/extensions/mdemo/templates/default'
var extRoot = 			root + '/js';
var extBowerRoot =		root + '/bower_components'

require.config({
	baseUrl: '/resources',
	
	paths: {
		extJs : 				extRoot,
		extView : 				root + '/views',
		app:					extRoot + '/app',
		angularRoute:			extBowerRoot + '/angular-route/angular-route-1.2.15',
		angularMocks:			extBowerRoot + '/angular-mocks/angular-mocks',
		angularCssInjector: 	extBowerRoot + '/angular-css-injector/angular-css-injector',
		angularLadda:			extBowerRoot + '/angular-ladda/dist/angular-ladda',
		angularXEditable:		extBowerRoot + '/angular-xeditable/dist/js/xeditable',
		angularUiSortable:		extBowerRoot + '/angular-ui-sortable/sortable',
		angularUiTree:			extBowerRoot + '/angular-ui-tree/angular-ui-tree.min',
		angularBootstrap:		extBowerRoot + '/angular-ui-bootstrap-bower/ui-bootstrap-tpls-0.12.0',
		angularUiNotification:	extBowerRoot + '/angular-ui-notification/angular-ui-notification.min',
		jqueryUI: 				extBowerRoot + '/jquery-ui/jquery-ui.min',
		jquerySortable: 		extBowerRoot + '/jquery-sortable/jquery.sortable',
		ladda:					extBowerRoot + '/ladda/dist/ladda.min',
		spin:					extBowerRoot + '/ladda/dist/spin.min',
		text:					extBowerRoot + '/requirejs-text/text'
	},
	shim: {
		'angularRoute': ['angular'],
		'angularMocks': {
			deps: ['angular'],
			exports: 'angular.mock'
		},
		'angularCssInjector': {
			deps: ['angular'],
            exports: 'angularCssInjector'
        },
		'angularLadda': {
			deps: ['angular', 'ladda', 'spin'],
            exports: 'angularLadda'
        },
		'angularXEditable': {
			deps: ['angular'],
            exports: 'angularXEditable'
        },
		'angularUiSortable': {
			deps: ['angular'],
            exports: 'angularUiSortable'
        },
		'angularUiTree': {
			deps: ['angular'],
            exports: 'angularUiTree'
        },
		'angularBootstrap': {
			deps: ['angular'],
            exports: 'angularBootstrap'
		},
		'angularUiNotification': {
			deps: ['angular'],
            exports: 'angularUiNotification'
		},
		'jqueryUI': {
			deps: ['jquery'],
			exports: 'jqueryUI'
		},
		'jquerySortable': {
			deps: ['jquery'],
			exports: 'jquerySortable'
		},
		'ladda': {
			deps: ['angular'],
            exports: 'ladda'
        },
		'spin': {
			deps: ['angular'],
            exports: 'spin'
        }
	},
	priority: [
		'extJs/main',
		'angular'
	]
});

define("utils", [], function() {

    function a(a) {
        return c[a]
    }

    function b(a, b) {
        c[a] = b
    }
    var c = {};
    function tp(a) {
        switch (a.toLowerCase()) {
            case "barchart":
                return "bar-chart-vertical";
            case "linechart":
                return "line-chart";
            case "table":
                return "table";
            case "pivot-table":
                return "pivot-table";
            case "components":
                return "components";
            case "piechart":
                return "pie-chart";
            case "filterpane":
                return "filterpane";
            case "listbox":
                return "list";
            case "gauge":
                return "gauge-chart";
            case "kpi":
                return "kpi";
            case "scatterplot":
                return "scatter-chart";
            case "text-image":
                return "text-image";
            case "treemap":
                return "treemap";
            case "map":
                return "map";
            case "combochart":
                return "combo-chart";
            default:
                return "extension"
        }
    }

    function getIcon(a) {
        return "" + tp(a)
    }
    return {
        getIcon: getIcon,
        getType: a,
        getRegisteredNames: function() {
            return Object.keys(c)
        },
        getLibraryInfo: function(a) {
            return c[a] ? c[a].getLibraryInfo() : null
        },
        getTemplateIconClassName: function(a) {
            return c[a] ? c[a].getTemplateIconClassName() : null
        },
        getIconChar: function(a) {
            return c[a] ? c[a].getIconChar() : null
        },
        registerType: b
    }
});

require([
	'js/qlik',
	'extJs/main'
	], function(app) {
		angular.element(document).ready(function() {
			angular.bootstrap(document, ['qlik-angular', 'default']);
		});
	}
);