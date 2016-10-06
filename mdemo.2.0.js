
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
if(portUrl!="4848"){
    if(portUrl!="443" && portUrl!="80" )
        pathRoot="//"+rootPath+":"+portUrl+"/resources/";
    else
        pathRoot="//"+rootPath+"/resources/";

}

var config = {
    host: window.location.hostname,
    prefix: "/",
    port: window.location.port,
    isSecure: window.location.protocol === "https:"
};
require.config( {
    waitSeconds:0,
    baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + ( config.port ? ":" + config.port : "" ) + config.prefix + "resources",
    paths: {
        text:pathRoot +'mdemo/js/text',
        jquery: pathRoot +'mdemo/js/jquery.min',
        boot:   pathRoot +'mdemo/js/bootstrap.min',
        fileS:  pathRoot +'mdemo/js/FileSaver',
        fileS:  pathRoot +'mdemo/js/FileSaver'
    }
} )( ["text!"+pathRoot+"mdemo/selectorBox.html","js/qlik","jquery","utils","boot","fileS"], function (elem,qlik,$,util ) {

    function makeDraggy(el){
        $(el).attr("draggable","true");
        $("[draggable]").on('dragstart', function(e){
            e.originalEvent.dataTransfer.setData('text',$(this).attr('data-type')+"#"+ $(this).attr('data-id'));
        });
    }
    function getViz(f) {
        var b = [];
        f.getAppObjectList("masterobject", function(a) {
            a.qAppObjectList.qItems.forEach(function(a) {
                var c = b.filter(function(b) {
                    return a.qInfo.qId === b.id
                });
                if (!(c.length > 0)) {
                    var e = a;
                    e.type = a.qData.visualization, e.id = a.qInfo.qId, e.title = a.qMeta && a.qMeta.title ? a.qMeta.title : "[no title]", e.tags = a.qData.tags, e.appid = f.id;
                    var g = util.getIcon(a.qData.visualization);
                    e.icon = g ? g : "toolbar-help", b.unshift(e)
                }
            })
        }),
        f.getAppObjectList("sheet", function(c) {
                var h = c.qAppObjectList.qItems.sort(function(a, b) {
                    return a.qData.rank - b.qData.rank
                });
                h.forEach(function(c) {
                    b.push({
                        id: c.qInfo.qId,
                        title: c.qData.title,
                        type: "sheet"
                    }), c.qData.cells.forEach(function(c) {
                        var g = c;
                        g.id = c.name, g.appid = f.id, b.push(g), f.getObjectProperties(g.id).then(function(b) {
                            var c = b.properties,
                                h = util.getIcon(c.qInfo.qType);
                            g.icon = h ? g.icon = h : g.icon = "toolbar-help", c.title && c.title.trim && c.title.trim().length > 0 ? g.title = c.title : c.markdown && c.markdown.trim && c.markdown.trim().length > 0 ? f.getObject(g.id).then(function(b) {
                                //g.title = a("<div>" + e.toHTML(b.layout.markdown, b.layout) + "</div>").text()
                            }) : "object" == typeof c.title ? f.getObject(g.id).then(function(a) {
                                g.title = a.layout.title
                            }) : c.title ? g.title = "[no title]" : f.getObject(g.id).then(function(a) {
                                !a.layout.title || a.layout.title && "" === a.layout.title.trim() ? g.title = "[no title]" : g.title = a.layout.title
                            })
                        })
                    })
                })
            })
        return b;
    }

    function getSnap(a) {
        var b = [];
        a.getList("SnapshotList", function(c) {
            c.qBookmarkList.qItems.forEach(function(c) {
                var e = {};
                e.id = c.qInfo.qId, e.title = c.qData.libraryTitle || c.qData.title, e.timestamp = c.qData.timestamp, e.appid = a.id;
                var f = util.getIcon(c.qData.visualizationType);
                f && (e.icon = f), b.push(e)
            })
        })
        return b;
    }



      var  confInt = {
            host: window.location.hostname,
            prefix: "/",
            port: window.location.port,
            isSecure: "https:" === window.location.protocol
          },
        n = {
            template: elem,
            controller: ["$scope", "$element","$timeout", function(scope, element,$timeout) {
                scope.encodeID='',
                scope.sideCollapsed=false,
                scope.curTemplate='Select a Template',
                scope.curTemplateName='Select a Template',
                //list based on files
                scope.templates = [
                    {name:' SmartBoard', path:'templates/admin/ifr.html'},
                    {name:' MashBoard', path:'templates/startapp/ifr.html'},
                    {name:' LightBoard', path:'templates/lightboard/ifr.html'},
                    {name:' Elegant', path:'templates/unify/ifr.html'},
                    {name:' Mosaic', path:'templates/mosaic/ifr.html'},
                    {name:' Rotating', path:'templates/rotating/ifr.html'},
                    {name:' Carousel', path:'templates/carousel/ifr.html'},
                    {name:' DAR', path:'templates/tabsDAR/ifr.html'},
                    {name:' Funny', path:'templates/funny/ifr.html'},

                ];
                scope.curApp='Select Application...';
                scope.embed = !1, scope.host = document.location.protocol + "//" + document.location.host, scope.nointeraction = !0, scope.clearall = !0, scope.selections = [], scope.lang = !1, scope.bookmark = !1,
                scope.hideBar =function(){
                        if($('#sidebar-wrapper').css("margin-left")=="-350px"){
                            $('#wrapper').css("padding-left","0px");
                            $('#sidebar-wrapper').css("margin-left","-700px");
                            sideCollapsed=true;
                        }
                        else{
                            $('#wrapper').css("padding-left","350px");
                            $('#sidebar-wrapper').css("margin-left","-350px");
                            sideCollapsed=false;
                        }

                    };
                scope.init = function() {
                    jQuery.event.props.push('dataTransfer');
                    qlik.getAppList(function(b) {
                        var c = [];
                        b.forEach(function(a) {
                            c.push({
                                id: a.qDocId,
                                type: a.qDocName
                            })
                        }), scope.apps = c, scope.appId && populateAll()
                    }, confInt)
                    var dropZone = document.getElementById('drop_zone');
                    dropZone.addEventListener('dragover', handleDragOver, false);
                    dropZone.addEventListener('drop', handleFileSelect, false);
                    dropZone.addEventListener('dragleave', handleDragOut, false);
                };
                var d = {
                        visualizations: {
                            available: !0,
                            active: !0,
                            name: "visualizations"
                        },
                        snapshots: {
                            available: !0,
                            active: !1,
                            name: "snapshots"
                        }
                    },
                    e = {
                        buttons: d
                    },
                    getUrl = function() {
                        scope.validateURLLength();
                        var b = {};
                        scope.appId && (b.appid = scope.appId), scope.obj && (b.obj = scope.obj), scope.sheet && (b.sheet = scope.sheet), scope.snapshot && (b.snapshot = scope.snapshot), scope.identity && (b.identity = scope.identity), scope.callback && (b.callback = scope.callback), scope.lang && scope.lang !== !1 && "false" !== scope.lang && (b.lang = scope.lang), scope.bookmark && scope.bookmark !== !1 && "false" !== scope.bookmark && (b.bookmark = scope.bookmark), (scope.currsel || scope.debug || scope.animate || scope.nointeraction) && (b.opt || (b.opt = ""), scope.currsel && (b.opt += "currsel,"), scope.debug && (b.opt += "debug,"), scope.animate && (b.opt += "noanimate,"), scope.nointeraction && (b.opt += "nointeraction,"), b.opt = b.opt.slice(0, -1));
                        var c = $.param(b).replace(/\+/g, "%20");
                        return scope.selections && scope.selections.forEach(function(a) {
                            c += "&select=" + Object.keys(a)[0], a[Object.keys(a)[0]].length > 0 && (c += "," + a[Object.keys(a)[0]].join(","))
                        }), c
                    };
                $.extend(scope, e);
                var handleFileSelect=function (evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    var files = evt.dataTransfer.files; // FileList object.
                    for (var i = 0, f; f = files[i]; i++) {
                        var fr=new FileReader();
                        fr.onload = function(e) {
                            try {
                                var storage = JSON.parse(e.target.result);
                            }catch(err){
                                alert("File content is wrong...");
                                $('#drop_zone').css('border', '2px dashed #bbb')
                                return;
                            }
                            localStorage.clear();
                            for (var name in storage) {
                                localStorage.setItem(name, storage[name] );
                            }
                            scope.reset(false);
                        };
                        fr.readAsText(f);
                        $('#drop_zone').css('border', '2px dashed #bbb')
                    }
                };
                scope.expandSettings=function(){
                    if($('.setMenu').css('height')!="30px") {
                        $('.setMenu').css('height', '30px');
                        $('.setMenu').css('opacity', '0');
                    }else{
                        $('.setMenu').css('height', '145px');
                        $('.setMenu').css('opacity', '1');
                    }
                },
                scope.reset=function(del){
                    if(del==true)
                        localStorage.clear();
                    var tp= scope.curTemplate;
                    scope.encodeID= tp.substr(0,tp.lastIndexOf('/')+1)+"index.html?tms="+new Date().getTime()+"&app="+encodeURI(scope.appId);
                    try{scope.$digest()()}catch(er){};
                }
                var handleDragOver=function (evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    evt.dataTransfer.dropEffect = 'copy';
                    $('#drop_zone').css('border', '4px dashed #FFFFFF');
                };
                var handleDragOut=function (evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    $('#drop_zone').css('border', '2px dashed #bbb');
                };
                var populateAll = function() {
                    scope.apps.forEach(function(b, d) {
                        b.id === scope.appId && (scope.apps[d].app ? scope.app = scope.apps[d].app : scope.app = scope.apps[d].app = qlik.openApp(scope.appId, config),
                            scope.app && (scope.obj = scope.sheet = scope.snapshot = null,
                            scope.app.objects ? (scope.objects = scope.app.objects, scope.snapshots = scope.app.snapshots,
                            scope.bookmarks = scope.app.bookmarks) : (
                                scope.objects = scope.apps[d].objects = getViz(scope.app),
                               scope.snapshots = scope.apps[d].snapshots =getSnap(scope.app)
                            )))
                    })
                };
                scope.saveIt=function(){
                    var text=JSON.stringify(localStorage);
                    //alert(text);
                    var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
                    saveAs(blob, "myConfig.txt");
                }
                scope.selectTemplate=function(b){
                    var tp=b.currentTarget.getAttribute("data-id");
                    scope.encodeID= tp.substr(0,tp.lastIndexOf('/')+1)+"index.html?app="+encodeURI(scope.appId),
                    scope.curTemplate=b.currentTarget.getAttribute("data-id");
                    scope.curTemplateName=b.currentTarget.getAttribute("data-type");

                }
                scope.selectApp = function(c) {
                    if (c.currentTarget.hasAttribute("data-id") && c.currentTarget.getAttribute("data-id") !== scope.appId) {
                        var d = c.currentTarget.getAttribute("data-id");
                        var e = c.currentTarget.getAttribute("data-type");
                        scope.curApp=e;
                        if (d && ($(c.currentTarget).addClass("active"), scope.appId = d, scope.appId)) {
                            populateAll();
                            var tp= scope.curTemplate;
                            scope.encodeID= tp.substr(0,tp.lastIndexOf('/')+1)+"index.html?tms="+new Date().getTime()+"&app="+encodeURI(scope.appId);
                        }
                    }
                }, scope.selectObject = function(b) {
                    if (b.currentTarget.hasAttribute("data-id") && scope.app) {
                        var c = b.currentTarget.getAttribute("data-id"),
                            d = b.currentTarget.getAttribute("data-type");
                        if(!b.currentTarget.hasAttribute("draggy")){
                            makeDraggy(b.currentTarget);
                            b.currentTarget.setAttribute("draggy",'yep');
                        }
                       // "sheet" === d ? (scope.sheet = c, scope.obj = null, scope.snapshot = null) : (scope.sheet = null, scope.obj = c, scope.snapshot = null), scope.url = document.location.pathname + "?" + n()
                    }
                }, scope.selectSnapshot = function(b) {
                    if (b.currentTarget.hasAttribute("data-id") && scope.app) {
                        var c = b.currentTarget.getAttribute("data-id");
                        //scope.sheet = null, scope.obj = null, scope.snapshot = c, scope.url = document.location.pathname + "?" + n()
                    }
                }, scope.toggle = function(a) {
                    for (var b in d) d[b] !== a && (d[b].active = !1);
                    a.active = !0
                }, scope.formatDate = function(a) {
                    var options = {
                        hour: "2-digit", minute: "2-digit"
                    };
                    return new Date(a).toLocaleDateString("en-US",options);
                }, scope.open = function() {
                    var b = window.open(scope.url, "_blank");
                    b.focus()
                }, scope.ctrlCopy = function() {
                    navigator.userAgent.match(/msie|trident/i) ? window.clipboardData.setData("Text", scope.host + scope.url) : delayedModal.open({
                        title: "Copy to clipboard: Ctrl+C ",
                        html: '<br/><input style="width:100%;" type="text" name="txt_copy" id="txt_copy" value="' + scope.host + scope.url + "\"/><script>$('#txt_copy').focus( function () { $( this ).select(); } );$( 'txt_copy' ).focus();</script>",
                        buttons: [{
                            name: "Common.OK"
                        }]
                    })
                }
            }]
        };
    $("#selector").showComponent({controller: n.controller,
    template: n.template},elem)
});


