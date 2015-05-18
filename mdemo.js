var portUrl=window.location.port;
var pathRoot="text!/extensions/mdemo/configurator.ng.html";
if(portUrl!="4848")
    pathRoot="text!/resources/mdemo/configurator.ng.html";

const pathNG=pathRoot;
function getURLParameter(a) {
    return (RegExp(a + "=(.+?)(&|$)").exec(location.search) || [null, null])[1]
}

function getURLParameters(a) {
    for (var b, c = new RegExp(a + "=(.+?)(&|$)", "g"), d = []; b = c.exec(location.search);) d.push(decodeURIComponent(b[1]));
    return d
}
define("workbench.utils/object-lister", ["jquery", "core.utils/deferred", "objects.utils/type-loader", "general.utils/visualizations", "general.services/media-tool/media-tool-service"],
    function(a, b, c, d, e) {
        function f(f) {
            var g = new b;
            return c.load().then(function() {
                var b = [];
                f.getAppObjectList("masterobject", function(a) {
                    a.qAppObjectList.qItems.forEach(function(a) {
                        var c = a;
                        c.type = a.qData.visualization, c.id = a.qInfo.qId, c.title = a.qData.name, c.tags = a.qData.tags, c.appid = f.id;
                        var e = d.getLibraryInfo(a.qData.visualization);
                        e && (c.icon = e.icon), b.unshift(c)
                    })
                }), f.getAppObjectList("sheet", function(c) {
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
                            g.id = c.name, g.appid = f.id, d.getLibraryInfo(g.type) && b.push(g), f.getObjectProperties(g.id).then(function(b) {
                                var c = b.properties,
                                    h = d.getLibraryInfo(c.qInfo.qType);
                                h && (g.icon = h.icon), c.title && c.title.trim && c.title.trim().length > 0 ? g.title = c.title : c.markdown && c.markdown.trim && c.markdown.trim().length > 0 ? f.getObject(g.id).then(function(b) {
                                    g.title = a("<div>" + e.toHTML(b.layout.markdown, b.layout) + "</div>").text()
                                }) : "object" == typeof c.title ? f.getObject(g.id).then(function(a) {
                                    g.title = a.layout.title
                                }) : c.title ? g.title = "[no title]" : f.getObject(g.id).then(function(a) {
                                    g.title = !a.layout.title || a.layout.title && "" === a.layout.title.trim() ? "[no title]" : a.layout.title
                                })
                            })
                        })
                    }), g.resolve(b)
                })
            }), g.promise
        }

        function g(a) {
            var e = new b;
            return c.load().then(function() {
                var b = [];
                a.getList("SnapshotList", function(c) {
                    c.qBookmarkList.qItems.forEach(function(c) {
                        var e = {};
                        e.id = c.qInfo.qId, e.title = c.qData.libraryTitle || c.qData.title, e.timestamp = c.qData.timestamp, e.appid = a.id;
                        var f = d.getLibraryInfo(c.qData.visualizationType);
                        f && (e.icon = f.icon), b.push(e)
                    }), e.resolve(b)
                })
            }), e.promise
        }
        return {
            listVisualizations: f,
            listSnapshots: g
        }
    }),

    define("text!workbench/components/scrollbar/scroll.ng.html", [], function() {
        return "<div class='qw-scroll-resizable'>\n	<div class='qw-scroll-cnt' ng-transclude></div> \n	<div class='qw-scroll-scrlb-cnt'>\n		<!--<ul>\n			<li ng-repeat=\"d in data\">{{d.capital}}</li>\n		</ul>-->\n		<div class='qw-scroll-scrlb'></div>\n	</div>\n</div>"
    }),
    define("text!workbench/components/scrollbar/scroll.css", [], function() {
        return ".qw-scroll-resizable {\n  " +
            "position: relative;\n  width: 100%;\n  " +
            "height: 100%;\n  overflow: hidden;\n  " +
            "display: inline-block;\n" +
            "}\n" +
            ".qw-scroll-resizable .qw-scroll-cnt {\n" +
            "  width: 100%;\n" +
            "  height: 100%;\n}\n" +
            ".qw-scroll-resizable .qw-scroll-cnt ul {\n" +
            "  margin-right: 1px;\n" +
            "  margin-top: 10px;}\n" +
            ".qw-scroll-resizable .qw-scroll-scrlb-cnt {\n" +
            "  width: 12px;\n  right: 0px;\n  top: 0px;\n  height: 100%;\n" +
            "  position: absolute;\n  transition: background 0.3 ease-in-out;\n" +
            "  border-radius: 6px;\n}\n" +
            ".qw-scroll-resizable .qw-scroll-scrlb-cnt .qw-scroll-scrlb {\n" +
            "  position: absolute;\n  cursor: default;\n  border-radius: 3px;\n  width: 6px;\n  background: #b3b3b3;\n  right: 3px;\n  top: 3px;\n  opacity: 0;\n}\n"
    }),
    define("workbench/components/scrollbar/scrollbar", ["qvangular", "angular", "jquery", "text!./scroll.ng.html", "text!./scroll.css"], function(a, b, c, d, e) {
        c("<style>").html(e).appendTo("head");
        var f = function() {
            return {
                restrict: "EA",
                transclude: !0,
                replace: !0,
                scope: {
                    data: "="
                },
                template: d,
                link: function(a, c) {
                    function d(a) {
                        var b = (parseInt(h.css("margin-top") || 0) + a);
                        e(b)
                    }

                    function e(a) {
                        var b = Math.min(0, Math.max(a, -l + k-10)),
                            c = -b / l;
//                    console.log((-l+k)+' '+ b)
//                    if((-l+k)==b)
//                        b=b-10;
                        h.css("margin-top", b + "px"), j.css("top", c * k + "3px");
                    }
                    var f, g = {
                            dragSpeedModifier: 1
                        },
                        h = b.element(c[0].querySelector(".qw-scroll-cnt")),
                        i = b.element(c[0].querySelector(".qw-scroll-scrlb-cnt")),
                        j = b.element(i.children()[0]),
                        k = c[0].offsetHeight,
                        l = 0,
                        m = function() {
                            h.css("height", "auto"), l = h[0].scrollHeight || 0, g.dragSpeedModifier = Math.max(1, 1 / (f / k)), h.css("height", l + "px"), k > l && (l = k), f = k / l * k - 6, j.css("height", f + "px"), j.css("transition", "opacity .3s ease-in-out, border-radius .1s linear, width .1s linear, right .1s linear"), d(0)
                        };
                    h.on("DOMNodeInserted", m), h.on("DOMNodeRemoved", m), h.on("mousewheel", function(a) {
                        a.preventDefault(), void 0 !== a.originalEvent && (a = a.originalEvent);
                        var b = a.wheelDeltaY || a.wheelDelta;
                        d(b)
                    }), window.navigator.userAgent.toLowerCase().indexOf("firefox") >= 0 && h.on("wheel", function(a) {
                        a.preventDefault(), void 0 !== a.originalEvent && (a = a.originalEvent);
                        var b = a.deltaY;
                        return d(40 * -b), !1
                    });
                    var n, o;
                    j.on("mousedown", function(a) {
                        return a.preventDefault(), n = !0, b.element(document).on("mouseup", function() {
                            n = !1
                        }), o = a.screenY, !1
                    }), b.element(document).on("mousemove", function(a) {
                        if (n) {
                            a.preventDefault();
                            var b = a.screenY - o;
                            b *= g.dragSpeedModifier, o += b * (f / k), d(-b)
                        }
                    }), c.on("mouseenter", function() {
                        if (h.height()> c.height())
                            k = c[0].offsetHeight, m(), j.css("opacity", 1)
                    }), i.on("mouseenter", function() {
                        j.css("opacity", 1)
                    }), c.on("mouseleave", function() {
                        n || j.css("opacity", 0)
                    }), i.on("mouseenter", function() {
                        j.css("width", "6px"), j.css("right", "3px"), j.css("border-radius", "3px")
                    }), i.on("mouseleave", function() {
                        j.css("width", "6px"), j.css("right", "3px"), j.css("border-radius", "3px")
                    }), m()
                }
            }
        };
        a.directive("qScroll", f)
    }),
    define("workbench/single/components/configurator", [pathNG, "qlik", "workbench.utils/object-lister", "core.utils/deferred", "general.utils/qv-moment", "qlikui/components", "workbench/components/scrollbar/scrollbar"], function(a, b, c, d, f) {
        function g(a) {
            var b = new d;
            return c.listVisualizations(a).then(function(a) {
                b.resolve(a)
            }), b.promise
        }
        function animateShow(toShow) {
            var $elem = toShow;
            toShow.show();
            b.resize();
            $({deg: 90}).animate({deg: 0}, {
                duration: 500,
                step: function(now) {
                    $elem.css({
                        transform: 'rotateY(' + now + 'deg)'
                    });
                    if(now==0)b.resize();
                }
            });
        }
        function animateHide(toHide,toShow) {
            var $elem = toHide;
            $({deg: 0}).animate({deg: 90}, {
                duration: 500,
                step: function(now) {
                    $elem.css({
                        transform: 'rotateY(' + now + 'deg)'
                    });
                    if(now==90){
                        toHide.hide();
                        animateShow(toShow)
                    }
                }
            });
        }
        function h(a) {
            var b = new d;
            return c.listSnapshots(a).then(function(a) {
                b.resolve(a)
            }), b.promise
        }
        function makeDroppy(){
            $(".qvplaceholder").on('dragover', function(event) {
                event.preventDefault();
                $(this).addClass("drop-hover");
            }).on('dragleave', function(event) {
                event.preventDefault();
                $(this).removeClass("drop-hover");
            }).on('drop', function(event) {
                $(this).removeClass("drop-hover");
                $(this).empty();
                var id = event.originalEvent.dataTransfer.getData('text').split("#")[1];
                var type = event.originalEvent.dataTransfer.getData('text').split("#")[0];
                $(this).removeClass('qv');
                $(this).removeClass('qvtarget');
                var cur =  b.appActive;
                if (type != 'snapshot') {
                    b.openApp(b.appActive.id).getObject($('#CurrentSelections'),'CurrentSelections');
                    localStorage.setItem(this.id+'#'+cur.id, id);
                    b.openApp(b.appActive.id).getObject(this, id).then(function (o) {
                    });
                }
                else{
                    localStorage.setItem(this.id+'#'+cur.id, id+'#snap');
                    b.openApp(b.appActive.id).getSnapshot(this, id).then(function () {
                    });
                }
            })
        }
        function makeDraggy(el){
            $(el).attr("draggable","true");

            $("[draggable]").on('dragstart', function(e){
                    //e.preventDefault();
                    //e.originalEvent.dataTransfer={toto:'yes'}
                    e.originalEvent.dataTransfer.setData('text',$(this).attr('data-type')+"#"+ $(this).attr('data-id'));
                    console.log(e.originalEvent.dataTransfer);
                });

//            $(el).draggable({
//                iframeOffset: $("#unify").offset(),
//                iframeFix: true,
//                appendTo: 'body',
//                helper : "clone",
//                scroll: false,
//                revert:'invalid',
//                zIndex : 1000,
//                opacity:0.6
//            });
        }
        function excludeBS(){
            $("#template").find('*').each(function(){
                if(!$(this).hasClass('qvobject'))
                    $(this).addClass('qv');
            });
        }
        function hideBar (){
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
        function i(a) {
            return (RegExp(a + "=(.+?)(&|$)").exec(location.search) || [null, null])[1]
        }

        var j = {
                host: window.location.hostname,
                prefix: "/",
                port: window.location.port,
                isSecure: "https:" === window.location.protocol
            },
            k = {
                template: a,
                controller: ["$scope","$timeout", function(a,$timeout) {
                    a.encodeID='';
                    a.selections=true;
                    a.curpage="dashboard";
                    a.curTemplate='Select a Template',
                    a.startAppPage='dashboard.html' ,
                    a.curTemplateName='Select a Template',
                    //list based on files 
                    a.templates = [
                        {name:' SmartBoard', path:'templates/admin/ifr.html'},
                        {name:' Elegant', path:'templates/unify/ifr.html'},
                        {name:' Carousel', path:'templates/carousel/index.html'},
                        {name:' Rotating', path:'templates/rotating/index.html'},
                        {name:' DAR', path:'templates/tabsDAR/index.html'},
                        {name:' Mosaic', path:'templates/ascensor/index.html'},
                        {name:' Funny', path:'templates/funny/index.html'}

                    ];
                    a.curApp='Select Application...';
                    a.host = document.location.protocol + "//" + document.location.host,
                        a.getStartAppPage=function() {

                            return "templates/startapp/"+a.startAppPage;
                        }
                        a.readyStartApp=function(){
                            panelize("#template");
                            excludeBS();
                            makeDroppy();
                            a.restoreObj();
                        },
                        a.setStartAppPage=function(p){
                            a.startAppPage=p;
                        },
                        a.restoreObj=function(){
                            $timeout(function(){
                                if(b.appActive) {
                                    $('#CurrentSelections').empty();
                                    b.openApp(b.appActive.id).getObject($('#CurrentSelections'), 'CurrentSelections');
                                }
                                $('.qvplaceholder').each(function( index ) {
                                    if(b.appActive && localStorage.getItem(this.id+'#'+ b.appActive.id) && localStorage.getItem(this.id+'#'+ b.appActive.id).split('#').length==1 ){
                                        $(this).empty();
                                        $(this).removeClass('qv');
                                        $(this).removeClass('qvtarget');
                                        b.openApp(b.appActive.id).getObject(this, localStorage.getItem(this.id+'#'+ b.appActive.id)).then(function () {
                                        });
                                    }else if(b.appActive && localStorage.getItem(this.id+'#'+ b.appActive.id) && localStorage.getItem(this.id+'#'+ b.appActive.id).split('#').length>1){

                                        $(this).empty();
                                        $(this).removeClass('qv');
                                        $(this).removeClass('qvtarget');
                                        b.openApp(b.appActive.id).getSnapshot(this, localStorage.getItem(this.id+'#'+ b.appActive.id).split('#')[0]).then(function () {
                                        });
                                    }
                                    else{
                                        $(this).empty();
                                        $(this).addClass('qv');
                                        $(this).addClass('qvtarget');
                                    }
                                })
                            },100);
                        },
                        a.back=function(detail){
                            animateHide($('#'+detail),$('#sum'));
                        },
                        a.showDetails=function(detail){
                            animateHide($('#sum'),$('#'+detail));
                        },
                        a.toggleSel=function(){
                            a.selections=!(a.selections);
                        },
                        a.hideBar=function(){
                            hideBar();
                        },
                        a.changePage=function(page){
                            a.curpage=page;
                            b.resize();
                        },
                        a.ready=function(){
                            excludeBS();
                            a.restoreObj();
                        },
                        a.init = function() {
                            jQuery.event.props.push('dataTransfer');
                            b.getAppList(function(b) {
                                var c = [];
                                b.forEach(function(a) {
                                    c.push({
                                        id: a.qDocId,
                                        type: a.qDocName
                                    })
                                }), a.apps = c, a.appId && k()
                            }, j);
                            if(appName){
                                a.initApp();
                            }
                        };
                    var c = {
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
                        d = {
                            appId: null !== i("appid") ? decodeURIComponent(i("appid")) : null,
                            opt: i("opt"),
                            obj: i("obj"),
                            sheet: i("sheet"),
                            snapshot: i("snapshot"),
                            identity: i("identity"),
                            callback: i("callback"),
                            url: null,
                            apps: [],
                            objects: [],
                            sheets: [],
                            buttons: c
                        },
                        e = function() {
                            var b = {};
                            return a.appId && (b.appid = a.appId), a.obj && (b.obj = a.obj), a.sheet && (b.sheet = a.sheet), a.snapshot && (b.snapshot = a.snapshot), a.identity && (b.identity = a.identity), a.callback && (b.callback = a.callback), a.bookmark && (b.bookmark = a.bookmark), (a.currsel || a.debug || a.animate || a.nointeraction) && (b.opt || (b.opt = ""), a.currsel && (b.opt += "currsel,"), a.debug && (b.opt += "debug,"), a.animate && (b.opt += "noanimate,"), a.nointeraction && (b.opt += "nointeraction,"), b.opt = b.opt.slice(0, -1)), $.param(b).replace(/\+/g, "%20")
                        };
                    $.extend(a, d);
                    var k = function() {
                        a.apps.forEach(function(c, d) {
                            if(c.id === a.appId) {
                                a.app=b.openApp(c.id,j);
                                b.appActive=c;
                                b.currApp(c);
                                g(a.app).then(function(b) {
                                    a.objects = a.apps[d].objects = b
                                });
                                h(a.app).then(function(b) {
                                    a.snapshots = a.apps[d].snapshots = b
                                });
                                a.app.getList("BookmarkList", function(b) {
                                    a.bookmarks = a.apps[d].bookmarks = b.qBookmarkList.qItems
                                });
                            }
                        })
                        $timeout(function() {
                            makeDraggy();
                        }, 1000);

                    };
                    a.selectTemplate=function(b){
                        var tp=b.currentTarget.getAttribute("data-id");
                        a.encodeID= tp.substr(0,tp.lastIndexOf('/')+1)+"index.html?app="+encodeURI(a.appId),
                        a.curTemplate=b.currentTarget.getAttribute("data-id");
                        a.curTemplateName=b.currentTarget.getAttribute("data-type");
                        $timeout(function() {
                            makeDroppy();
                        }, 1000);
                    },
                        a.initApp=function(){
                            var c = decodeURI(appName);
                            $timeout(function(){if(tpl){
                                a.curTemplate=decodeURI(tpl)
                                a.curTemplateName=decodeURI(tplName);
                                $timeout(function() {
                                    makeDroppy();
                                }, 1000);
                            }},2000);
                            c && (//$('[data-type='+typeElement+']').addClass("active"),
                                a.curApp=decodeURI(typeElement),
                                    a.appId = c,
                                    a.appId && k())
                        }  ,
                        a.selectApp = function(el) {
                            if (false && appName!=null && el.currentTarget.hasAttribute("data-id") && el.currentTarget.getAttribute("data-id") !== a.appId) {
                                var curURL=  [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
                                window.location=curURL+"?app="+el.currentTarget.getAttribute("data-id")+"&type="+el.currentTarget.getAttribute("data-type")+"&tpl="+a.curTemplate+"&tplName="+a.curTemplateName;
                            }
                            else{
                                var c = el.currentTarget.getAttribute("data-id");
                                appName=c;
                                c && ($(el.currentTarget).addClass("active"),
                                    a.curApp=el.currentTarget.getAttribute("data-type"),
                                    a.appId = c,
                                    a.appId && k(), a.restoreObj());
                                var tp= a.curTemplate;
                                a.encodeID= tp.substr(0,tp.lastIndexOf('/')+1)+"index.html?app="+encodeURI(a.appId);
                            }
                        }, a.selectObject = function(b) {
                        if(!b.currentTarget.hasAttribute("draggy")){
                            makeDraggy(b.currentTarget);
                            b.currentTarget.setAttribute("draggy",'yep');
                        }


                        //alert( b.currentTarget.getAttribute("data-id") +' '+b.currentTarget.getAttribute("data-type"))
                        // if (b.currentTarget.hasAttribute("data-id") && a.app) {
                        // var c = b.currentTarget.getAttribute("data-id"),
                        // d = b.currentTarget.getAttribute("data-type");
                        // "sheet" === d ? (a.sheet = c, a.obj = null, a.snapshot = null) : (a.sheet = null, a.obj = c, a.snapshot = null), a.url = document.location.pathname + "?" + e()
                        // }
                    }, a.selectSnapshot = function(b) {
                        if (b.currentTarget.hasAttribute("data-id") && a.app) {
                            var c = b.currentTarget.getAttribute("data-id");
                            a.sheet = null, a.obj = null, a.snapshot = c, a.url = document.location.pathname + "?" + e()
                        }
                    }, a.toggle = function(a) {
                        for (var b in c) c[b] !== a && (c[b].active = !1);
                        a.active = !0;
                    }, a.formatDate = function(a) {
                        return f.formatDate(a)
                    }, a.change = function() {
                        a.url = document.location.pathname + "?" + e()
                    }, a.open = function() {
                        var b = window.open(a.url, "_blank");
                        b.focus()
                    }, a.ctrlCopy = function() {
                        navigator.userAgent.match(/msie|trident/i) ? window.clipboardData.setData("Text", a.host + a.url) : window.prompt("Copy to clipboard: Ctrl+C", a.host + a.url), $("#txt_url").focus(function() {
                            $(this).select()
                        }), $("#txt_url").focus()
                    }, a.$watchCollection("[currsel, animate, nointeraction, bookmark]", function(b, c) {
                        b !== c && (a.url = document.location.pathname + "?" + e())
                    })
                }]
            };
        return k
    });
var appName = getURLParameter("app"),
    typeElement = getURLParameter("type"),
    tpl = getURLParameter("tpl"),
    tplName = getURLParameter("tplName"),
    appId = getURLParameter("appid"),
    opt = getURLParameter("opt"),
    obj = getURLParameter("obj"),
    sheet = getURLParameter("sheet"),
    snapshot = getURLParameter("snapshot"),
    identity = getURLParameter("identity"),
    callback = getURLParameter("callback"),
    bookmark = getURLParameter("bookmark"),
    select = getURLParameters("select"),
    sideCollapsed=false,
    app;
opt && opt.indexOf("debug") > -1;
var config = {
    host: window.location.hostname,
    prefix: "/",
    port: window.location.port,
    isSecure: "https:" === window.location.protocol
};
require.config({
    baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port: "") + config.prefix + "resources"
}),
    require(["js/qlik"], function(a) {
        a.setOnError(function(a) {
            callback && window[callback].onError ? window[callback].onError(a.code, a.message) : alert(a.message + " (" + appName + ")")
        }),
            require(["jquery", "ng!$timeout", "qvangular", "workbench.utils/object-lister", "workbench/single/components/configurator"], function(b, c, d, e, f) {
                function g(a) {
                    d.$rootScope.$apply(), c(function() {
                        document.getElementById("content").offsetHeight, window[callback].onRendered(a.id)
                    }, 1e3)
                }

                function h(a, b) {
                    a.getSnapshot(document.getElementById("content"), b).then(function(a) {
                        window.visualization = a;
                        var b = a;
                        callback && window[callback].onValid && (a.isValid && window[callback].onValid(b.id), a.Validated.bind(function() {
                            window[callback].onValid(b.id)
                        })), callback && window[callback].onRendered && (a.isValid && g(b), a.Validated.bind(function() {
                            g(b)
                        }))
                    })
                }

                function i(a, c) {
                    a.getAppObjectList(function(d) {
                        d.qAppObjectList.qItems.forEach(function(d) {
                            if (d.qInfo.qId === c) {
                                var e = '<div style="position:relative;width:100%;height:100%" class="qvt-sheet">',
                                    f = 0,
                                    g = 0;
                                return d.qData.cells.forEach(function(a) {
                                    f = Math.max(f, a.col + a.colspan), g = Math.max(g, a.row + a.rowspan)
                                }), d.qData.cells.forEach(function(a) {
                                    var b = "position:absolute;padding:10px;";
                                    b += "left:" + 100 * a.col / f + "%;", b += "top:" + 100 * a.row / g + "%;", b += "width:" + 100 * a.colspan / f + "%;", b += "height:" + 100 * a.rowspan / g + "%;", e += '<div style="' + b + '" data-qid="' + a.name + '"></div>'
                                }), e += "</div>", b("#content").html(e).find("div").each(function() {
                                    var c = b(this).data("qid");
                                    c && a.getObject(this, c, j() ? {
                                        noInteraction: !0
                                    } : void 0)
                                }), !1
                            }
                        })
                    })
                }

                function j() {
                    return opt && opt.indexOf("nointeraction") > -1
                }

                function k(a, b) {
                    a.getObject(document.getElementById("content"), b, j() ? {
                        noInteraction: !0
                    } : void 0).then(function(a) {
                        window.visualization = a;
                        var b = a;
                        callback && window[callback].onValid && (a.isValid && window[callback].onValid(b.id), a.Validated.bind(function() {
                            window[callback].onValid(b.id)
                        })), callback && window[callback].onRendered && (a.isValid && g(b), a.Validated.bind(function() {
                            g(b)
                        }))
                    })
                }
                if (identity && (config.identity = decodeURIComponent(identity)), appId && (obj || sheet || snapshot))
                    if (app = a.openApp(decodeURIComponent(appId), config)) {
                        if (bookmark ? app.bookmark.apply(bookmark) : select && select.length > 0 && select.forEach(function(a, b) {
                            var c = a.split(",");
                            if (c.length > 1) {
                                var d = c.slice(1);
                                d.forEach(function(a, b) {
                                    isNaN(a) || (d[b] = +a)
                                }), app.field(c[0]).selectValues(d, b > 0, !0)
                            }
                        }), obj || sheet || snapshot) {
                            if (opt && opt.indexOf("noanimate") > -1) {
                                b("body").addClass("noanimate");
                                var l = d.getService("$animate");
                                l.enabled(!1)
                            }
                            if (opt && opt.indexOf("currsel") > -1) {
                                var m = b("#CURRSELPANEL").show();
                                app.getObject(m[0], "CurrentSelections", j() ? {
                                    noInteraction: !0
                                } : void 0)
                            }
                            obj ? k(app, obj) : sheet ? i(app, sheet) : snapshot && h(app, snapshot)
                        }
                    } else b("#content").html("Can not open App " + appId);
                else b("#configurator").showComponent(f, {
                    parent: this,
                    app: app
                })
            })
    })