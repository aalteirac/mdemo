var qlik;
var curApp;

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
require.config( {
    waitSeconds:0,
    baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + ( config.port ? ":" + config.port : "" ) + config.prefix + "resources",
    paths: {
        //jquery: "assets/external/jquery/jquery",
        //"jquery": pathRoot +'mdemo/templates/mosaic/js/jquery-2.1.1.min',
        jquery: pathRoot +'mdemo/templates/admin/js/libs/jquery-2.1.1.min',
        "ascens":pathRoot +'mdemo/templates/mosaic/js/jquery.ascensor'
        //"demo":   pathRoot +'mdemo/templates/mosaic/js/'
    },
    shim: {
        'ascens': {
            deps: ['jquery'],
            exports: 'appl'
        }
    }
} )( ["js/qlik","jquery","ascens"], function ( qlikview,$ ){

    qlik=qlikview;
    var app;
    if(getURLParameter('app')!='undefined'){
        console.log("app in : " +getURLParameter('app'));
        app = qlikview.openApp(decodeURI(getURLParameter('app')), config);
        curApp=app;
        qlikview.setOnError( function ( error ) {
            alert( error.message );
        } );
    }
    restoreObj();
});

function makeDroppy() {
    $(".qvplaceholder").on('dragover', function (event) {
        event.preventDefault();
        $(this).addClass("drop-hover");
    }).on('dragleave', function (event) {
        event.preventDefault();
        $(this).removeClass("drop-hover");
    }).on('drop', function (event) {
        var app = curApp;
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

function setAscensor(){
    var ascensor = $('#ascensorBuilding').ascensor({jump: true, direction: [[0,0],[1,1],[0,1],[1,0],[2,0]],time:1000});
    var ascensorInstance = $('#ascensorBuilding').data('ascensor');
    $(".prev").click(function() {
        ascensorInstance.prev();
    });

    $(".next").click(function() {
        ascensorInstance.next();
    });

    $(".direction").click(function() {
        ascensorInstance.scrollToDirection($(this).data("direction"));
    });
}
function restoreObj(){
    setTimeout(function(){
        makeDroppy();
        setAscensor();
        excludeBS();
        if(qlik && getURLParameter('app')!='undefined') {
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
            })
        }
    },100);
}

function getURLParameter(a) {
    return (RegExp(a + "=(.+?)(&|$)").exec(location.search) || [null, null])[1]
}

function excludeBS(){
    $("#main").find('*').each(function(){
        if(!$(this).hasClass('qvobject'))
            $(this).addClass('qv');
    });
}
