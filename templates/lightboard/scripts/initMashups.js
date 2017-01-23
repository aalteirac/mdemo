var qlik;
var curApp;

var rootPath = window.location.hostname;
var portUrl = "80";
if (window.location.port == "") {
    if ("https:" == window.location.protocol)
        portUrl = "443";
    else {
        portUrl = "80";
    }
}
else
    portUrl = window.location.port;
var pathRoot = "//localhost:4848/extensions/";
if (portUrl != "4848")
    pathRoot = "//" + rootPath + ":" + portUrl + "/resources/";

var config = {
    host: window.location.hostname,
    prefix: "/",
    port: window.location.port,
    isSecure: "https:" === window.location.protocol
};
require.config({
    waitSeconds: 0,
    baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + ( config.port ? ":" + config.port : "" ) + config.prefix + "resources",
    paths: {
        jquery: pathRoot + 'mdemo/templates/lightboard/vendor/jquery/dist/jquery.min',
        jqueryui: pathRoot + 'mdemo/templates/lightboard/vendor/jquery-ui/jquery-ui.min',
        "edit": pathRoot + 'mdemo/templates/lightboard/scripts/editable',
        "homer": pathRoot + 'mdemo/templates/lightboard/scripts/homer',
        "metis": pathRoot + 'mdemo/templates/lightboard/vendor/metisMenu/dist/metisMenu.min',
        "icheck": pathRoot + 'mdemo/templates/lightboard/vendor/iCheck/icheck.min',
        "boot": pathRoot + 'mdemo/templates/lightboard/vendor/bootstrap/dist/js/bootstrap.min'
    },
    shim: {
        'jquery': {
            exports: 'jquery'
        },
        'jqueryui': {
            exports: 'jqueryui'
        },
        'edit': {
            deps: ['jquery'],
            exports: 'appl'
        },
        'homer': {
            deps: ['jquery', 'jqueryui', 'metis', 'icheck', 'boot'],
            exports: 'homer'
        },
        'icheck': {
            deps: ['jquery'],
            exports: 'icheck'
        }
    }
})(["js/qlik", "jquery", "jqueryui", "edit", "homer", "metis", "icheck"], function (qlikview, $) {
    angular.bootstrap(document, ["app", "qlik-angular"]);
    qlik = qlikview;
    var app;
    if (getURLParameter('app') != 'undefined') {
        console.log("app in : " + getURLParameter('app'));
        app = qlikview.openApp(decodeURI(getURLParameter('app')), config);
        curApp = app;
        qlikview.setOnError(function (error) {
            alert(error.message);
        });
    }

    restoreObj(app);
});
angular.module('app', [])
    .controller('pager', ['$scope', function pager($scope) {
        $scope.page = "pages/dashboard.html";

        $scope.init = function () {
            initTheme();
        };
        $scope.back = function () {
            curApp.back();
        };
        $scope.next = function () {
            curApp.forward();
        };
        $scope.clear = function () {
            curApp.clearAll();
        };
        $scope.getSelCount = function () {
            try {
                return $scope.$$nextSibling.$$childHead.nbrSelections;
            }
            catch (e) {
                return 0;
            }
        }
        $scope.openMenu = function (e) {
            $scope.$$nextSibling.$$childHead.toggleGlobalSelection(e);
            //$('#right-sidebar').toggleClass('sidebar-open');

        };
        $scope.menu = function (pg) {
            if (pg != $scope.page) {
                $scope.page = pg;
                restoreObj(curApp);
                initTheme();
            }
        };
    }]);
function pager($scope) {

}

function makeDroppy() {
    $(".qvplaceholder").on('dragover', function (event) {
        event.preventDefault();
        $(this).addClass("drop-hover");
    }).on('dragleave', function (event) {
        event.preventDefault();
        $(this).removeClass("drop-hover");
    }).on('drop', function (event) {
        var app =curApp;
        $(this).removeClass("drop-hover");
        event.preventDefault();
        $(this).empty();
        var id = event.originalEvent.dataTransfer.getData('text').split("#")[1];
        var type = event.originalEvent.dataTransfer.getData('text').split("#")[0];
        $(this).removeClass('qv');
        $(this).removeClass('qvtarget');
        if (type != 'snapshot') {
            curApp.getObject($('#CurrentSelections'), 'CurrentSelections');
            localStorage.setItem(this.id + '#' + app.id, id);
            curApp.getObject(this, id).then(function (o) {
            });
        }
        else {
            localStorage.setItem(this.id + '#' + app.id, id + '#snap');
            curApp.getSnapshot(this, id).then(function () {
            });
        }
    })
}

function restoreObj() {
    setTimeout(function () {
        makeDroppy();
        makeEdit();
        if (qlik && getURLParameter('app') != 'undefined') {
            var appId = decodeURI(getURLParameter('app'));
            $('#CurrentSelections').empty();
            curApp.getObject($('#CurrentSelections'), 'CurrentSelections');
            $('.qvplaceholder').each(function (index) {
                if (appId && localStorage.getItem(this.id + '#' + appId) && localStorage.getItem(this.id + '#' + appId).split('#').length == 1) {
                    $(this).empty();
                    $(this).removeClass('qv');
                    $(this).removeClass('qvtarget');
                    curApp.getObject(this, localStorage.getItem(this.id + '#' + appId));
                } else if (appId && localStorage.getItem(this.id + '#' + appId) && localStorage.getItem(this.id + '#' + appId).split('#').length > 1) {

                    $(this).empty();
                    $(this).removeClass('qv');
                    $(this).removeClass('qvtarget');
                    curApp.getSnapshot(this, localStorage.getItem(this.id + '#' + appId).split('#')[0]);
                }
                else {
                    $(this).empty();
                    $(this).addClass('qv');
                    $(this).addClass('qvtarget');
                }
            });

            $('.splash').css('display', 'none')
        }
    }, 100);
}

function getURLParameter(a) {
    return (RegExp(a + "=(.+?)(&|$)").exec(location.search) || [null, null])[1]
}

