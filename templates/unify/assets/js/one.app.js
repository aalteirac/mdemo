/*   
 * Template Name: Unify - Responsive Bootstrap Template
 * Description: Business, Corporate, Portfolio and Blog Theme.
 * Version: 1.6
 * Author: @htmlstream
 * Website: http://htmlstream.com
*/

var App = function () {

    function handleBootstrap() {
        /*Bootstrap Carousel*/
        $('.carousel').carousel({
            interval: 15000,
            pause: 'hover'
        });

        /*Tooltips*/
        $('.tooltips').tooltip();
        $('.tooltips-show').tooltip('show');
        $('.tooltips-hide').tooltip('hide');
        $('.tooltips-toggle').tooltip('toggle');
        $('.tooltips-destroy').tooltip('destroy');

        /*Popovers*/
        $('.popovers').popover();
        $('.popovers-show').popover('show');
        $('.popovers-hide').popover('hide');
        $('.popovers-toggle').popover('toggle');
        $('.popovers-destroy').popover('destroy');
    }

    function handleHeader() {
        //jQuery to collapse the navbar on scroll
        $('#srcEl').scroll(function() {
            if ($('#srcEl').scrollTop() > 150) {
                $(".navbar-fixed-top").addClass("top-nav-collapse");
            } else {
                $(".navbar-fixed-top").removeClass("top-nav-collapse");
            }
        });

        //jQuery for page scrolling feature - requires jQuery Easing plugin
        $(function() {
            $('.page-scroll a').bind('click', function(event) {

                var $anchor = $(this);
                var delta=0;
                if($($anchor.attr('href')).offset().top==0){
                    delta=0;
                }
                    else if($($anchor.attr('href')).offset().top>$('#srcEl').scrollTop()){
                        delta=$($anchor.attr('href')).offset().top+$('#srcEl').scrollTop();
                    }
                    else{
                        delta=$($anchor.attr('href')).offset().top+$('#srcEl').scrollTop();
                    }
                $('#srcEl').stop().animate({
                    scrollTop: delta
                }, 1500, 'easeInOutExpo');
                event.preventDefault();
            });
        });

        //Collapse Navbar When It's Clickicked
        $('.navbar-nav li a, .navbar-brand').click(function() {
            $(".navbar-collapse.in").collapse('hide');
        });
    }

    return {
        init: function () {
            handleHeader();
            handleBootstrap();
        },

        initCounter: function () {
            $('.counter').counterUp({
                delay: 10,
                time: 1000
            });
        },

        initParallaxBg: function () {
            $(window).load(function(){
                $('.parallaxBg').parallax("50%", 0.4);
            });
        },

    };

}();