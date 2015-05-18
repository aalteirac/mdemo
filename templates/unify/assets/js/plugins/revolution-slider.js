var RevolutionSlider = function () {

    return {
        
        //Revolution Slider - Full Screen
        initRSfullScreen: function () {
		    var revapi;
	        jQuery(document).ready(function() {
                $('#menMain').show();
	           revapi = jQuery('.fullscreenbanner').revolution(
	            {
	                delay:15000,
	                startwidth:1170,
	                startheight:300,
	                hideThumbs:10,
	                fullWidth:"on",
	                fullScreen:"off",
	                hideCaptionAtLimit: "",
	                dottedOverlay:"twoxtwo",
	                navigationStyle:"preview4",
	                fullScreenOffsetContainer: ""
	            });

	        });
        }
        
    };
}();        