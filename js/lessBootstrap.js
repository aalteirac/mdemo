var qlik;
var scp;
var icon={"map":"icon-map","combochart":"combo-chart","scatterplot":"scatter-chart","linechart":"line-chart","barchart":"bar-chart-vertical","piechart":"pie-chart","gauge":"gauge-chart","qwidget":"extension"};
var qvobjects={};
//var config = {
//	host: "localhost",
//	prefix: "/",
//	port: "4848",
//	isSecure: false
//};
var config = {
	host: "localhost",
	prefix: "/",
	port: "4848",
	isSecure: false
};
require.config( {
	baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port: "") + config.prefix + "resources"
} );

function pager($scope){
	scp=$scope;
	$scope.curpage="dashboard";
	$scope.curApp={qTitle:"Select an Application..."};
	$scope.showBar=true;
	$scope.selections=false;
	$scope.templates = [
      {name:'Template with Carousel', path:'../template2/template2.html'},
	  {name:'Template with 3 tabs', path:'templateTabs.html'}
    ];
	$scope.curTemplate=$scope.templates[0];
	$scope.getTemplate=function(){
		return $scope.curTemplate.path;
	}
	$scope.ready=function(){
		excludeBS();
		makeDroppy();
	}
	$scope.changeTemplate=function(template){
		$scope.curTemplate=template;
	}
	$scope.changeApp=function(app){
		$scope.curApp=app;
	}
	$scope.save=function(page){
		
		$.post( "//localhost:8185/save", qvobjects)
		  .done(function( data ) {
			alert( "Data Loaded: " + data );
		  });
		// $.ajax({
		  // url:'http://localhost:8185/save',
		  // type:'POST',
		  // data:{'test':'toto'},
		  // contentType:'application/json; charset=utf-8',
		  // dataType:'json',
		  // success: function(){
		  // }
		// })  
	};
	$scope.changePage=function(page){
		$scope.curpage=page;
		scp.qlik.resize();
	};
	$scope.hideBar=function(){
		if($('#sidebar-wrapper').is(":visible")){
			$('#wrapper').css("padding-left","0px");
			$('#sidebar-wrapper').hide();
		}
		else{
			$('#wrapper').css("padding-left","350px");
			setTimeout(function(){$('#sidebar-wrapper').show();},400);
		}
		setTimeout(function(){scp.qlik.resize()},1000);
	};
	$scope.hideSel=function(){
		$scope.selections=!($scope.selections);
	};
	$scope.makeDraggy=function(){
		makeDraggy();
	};
}
function excludeBS(){
	$("#template").find('*').each(function(){
		if(!$(this).hasClass('qvobject'))
			$(this).addClass('qv');
	});
}
function fixSel(){
	$('.list').height('0');
	$('.buttons-end').hide();
}
function makeDraggy(){
	$('.drag').draggable({
		appendTo: 'body',
		helper : "clone",
		scroll: false,
		revert:true,
		zIndex : 1000,
		opacity:0.6,
		drag : function(event, ui) {
			
		}
	});
}	
function makeDroppy(){
	$('.qvplaceholder').droppable({
		hoverClass: ".drop-hover",
		tolerance : "touch",
		drop : function(event, ui) {
			$(this).empty();
			var id=ui.helper.attr('ido');
			var idapp=ui.helper.attr('idapp');
			//$(this).attr('data-qvid',id);
			//$(this).attr('data-qvappid',idapp);
			$(this).removeClass('qv');
			$(this).removeClass('qvtarget');
			//$(this).addClass('qvobject');
			// var app=getApp(idapp);
			var app=scp.qlik.openApp(idapp,config);
			var idOrigin=this.id;
			app.getObject( this, id ).then( function (  ) {
				qvobjects[idOrigin] = id;
				$('[data-qvid='+id+']').mousedown(function(event) {
					if(event.which==3){
						scp.qlik.openApp($(this).attr('data-qvappid'),config).getObject($('#CurrentSelections'),'CurrentSelections').then( function (  ) {
							fixSel();
							scp.qlik.resize();
						});
					}
				});
				app.getObject($('#CurrentSelections'),'CurrentSelections').then( function (  ) {
					fixSel();
				} );
			} );
			
		}
	});
}

function getApp(id){
	for (var curApp in scp.app){
		if(scp.app[curApp].qDocId==id)
			return scp.app[curApp].app;
	}
}

function init(){
	require( ["jquery", "jqueryui"], function ( ) {
		excludeBS();
		require( ["js/qlik"], function ( qlikview ){
			qlikview.getAppList(function(reply) {
				scp.qlik=qlikview;
				scp.app=reply;
				reply.forEach(function(curApp){
					curApp.app=qlikview.openApp( curApp.qDocId, config );
//					curApp.id=curApp.qDocName.replace(/ /g,'').replace('.','');
                    curApp.id=curApp.qDocId;
					curApp.app.getAppObjectList(function (rep){
						curApp.sheets=new Array();
						$.each(rep.qAppObjectList.qItems, function (key, value){
							var id=curApp.sheets.push({id:value.qInfo.qId,title:value.qMeta.title})-1;
							curApp.sheets[id].objs=new Array();
							$.each(value.qData.cells, function(k,v){
								if(v.type!="" && v.type!="text-image")
									curApp.app.getObjectProperties(v.name).then(function(model){
										var ico=(typeof icon[model.properties.visualization] !='undefined'?icon[model.properties.visualization]:model.properties.visualization);
										if(typeof model.properties.title !== 'undefined' )
											if(typeof model.properties.title !== 'object'){
												var title=(model.properties.title==""?"No title ("+model.properties.visualization+')':model.properties.title) 
												curApp.sheets[id].objs.push({appid:curApp.qDocId,id:model.id,title:title,icon:ico});
											}
											else
												curApp.sheets[id].objs.push({appid:curApp.qDocId,id:model.id,title:model.properties.title.qStringExpression.qExpr,icon:ico});
										if(model.layout.title)
											curApp.sheets[id].objs.push({appid:curApp.qDocid,id:model.id,title:model.layout.title,icon:ico});
									})		
							});
							
						});
					})
				});
			},config)
			makeDroppy();
			qlikview.setOnError( function ( error ) {
				alert( error.message );
			} );
			
		});
	} );
}

init();

