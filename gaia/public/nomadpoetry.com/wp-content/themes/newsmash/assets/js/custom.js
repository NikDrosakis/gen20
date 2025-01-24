/*=========================================================================
            Home Slider
=========================================================================*/
jQuery(document).ready(function($) {
    "use strict";
	
	// popular-categories-carousel
    $('.popular-categories-carousel').slick({
        dots: true,
        arrows: false,
        slidesToShow: 5,
        slidesToScroll: 3,
		autoplay: true,
		autoplaySpeed: 5000,
        responsive: [
            {
                breakpoint: 1440,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4,
                    dots: true,
                    arrows: false,
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    dots: true,
                    arrows: false,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    dots: true,
                    arrows: false,
                }
            }
            ,
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true,
                    arrows: false,
                }
            }
        ]
    });
	
    // post carousel lg
    $('.post-carousel-mainfeatured').slick({
        dots: !$('.post-carousel-mainfeatured').hasClass('post-carousel-column1') ? false:true,
        arrows: true,
        adaptiveHeight: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        fade: !$('.post-carousel-mainfeatured').hasClass('post-carousel-column1') ? false:true,
        cssEase: 'linear',
		autoplay: true,
		autoplaySpeed: 3000,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              dots: true,
              arrows: false,
            }
          }
        ]
    });
	
	// post-carousel-missed
    $('.post-carousel-missed').slick({
        dots: false,
        arrows: false,
		autoplay: true,
        slidesToShow: 4,
        slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 4000,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    dots: false,
                    arrows: false,
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false,
                    arrows: false,
                }
            }
        ]
    });
    // Custom carousel nav
    $('.carousel-missed-prev').click(function(){ 
        $('.post-carousel-missed').slick('slickPrev');
    } );
    $('.carousel-missed-next').click(function(){ 
        $('.post-carousel-missed').slick('slickNext');
    } );
	

    // post gallery
    $('.post-gallery').slick({
        dots: false,
        arrows: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true,
        cssEase: 'linear',
        adaptiveHeight: false,
        responsive: [{
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                dots: false,
                arrows: true,
            }
        }]
    });
      

    // post-carousel-widget
    $('.post-carousel-widget').slick({
        dots: false,
        arrows: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [
            {
            breakpoint: 991,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
            }
            },
            {
            breakpoint: 576,
            settings: {
                slidesToShow: 1,
                centerMode: true,
                slidesToScroll: 1,
            }
            }
        ]
    });
    // Custom carousel nav
    $('.carousel-botNav-prev').click(function(){ 
        $('.post-carousel-widget').slick('slickPrev');
    } );
    $('.carousel-botNav-next').click(function(){ 
        $('.post-carousel-widget').slick('slickNext');
    } );
	
	$('.page-template-frontpage .dt-posts-module .dt-posts').btnloadmore();
});

( function( $ ) {
    'use strict';

    //set animation timing
    var animationDelay = 2500,
        //loading bar effect
        barAnimationDelay = 3800,
        barWaiting = barAnimationDelay - 3000, //3000 is the duration of the transition on the loading bar - set in the scss/css file
        //letters effect
        lettersDelay = 50,
        //type effect
        typeLettersDelay = 150,
        selectionDuration = 500,
        typeAnimationDelay = selectionDuration + 800,
        //clip effect 
        revealDuration = 600,
        revealAnimationDelay = 1500;

    function initHeadline() {
        //insert <i> element for each letter of a changing word
        singleLetters($('.dt_heading.dt_heading_2').find('b'));
        singleLetters($('.dt_heading.dt_heading_3').find('b'));
        singleLetters($('.dt_heading.dt_heading_8').find('b'));
        singleLetters($('.dt_heading.dt_heading_9').find('b'));
        //initialise headline animation
        animateHeadline($('.dt_heading'));
    }

    function singleLetters($words) {
        $words.each(function() {
            var word = $(this),
                letters = word.text().split(''),
                selected = word.hasClass('is_on');
            for (var i in letters) {
                if (word.parents('.dt_heading_3').length > 0) letters[i] = '<em>' + letters[i] + '</em>';
                letters[i] = (selected) ? '<i class="in">' + letters[i] + '</i>' : '<i>' + letters[i] + '</i>';
            }
            var newLetters = letters.join('');
            word.html(newLetters).css('opacity', 1);
        });
    }

    function animateHeadline($headlines) {
        var duration = animationDelay;
        $headlines.each(function() {
            var headline = $(this);

            if (headline.hasClass('dt_heading_4')) {
                duration = barAnimationDelay;
                setTimeout(function() {
                    headline.find('.dt_heading_inner').addClass('is-loading')
                }, barWaiting);
            } else if (headline.hasClass('dt_heading_6')) {
                var spanWrapper = headline.find('.dt_heading_inner'),
                    newWidth = spanWrapper.width() + 10
                spanWrapper.css('width', newWidth);
            } else if (!headline.hasClass('dt_heading_2')) {
                //assign to .dt_heading_inner the width of its longest word
                var words = headline.find('.dt_heading_inner b'),
                    width = 0;
                words.each(function() {
                    var wordWidth = $(this).width();
                    if (wordWidth > width) width = wordWidth;
                });
                headline.find('.dt_heading_inner').css('width', width);
            };

            //trigger animation
            setTimeout(function() {
                hideWord(headline.find('.is_on').eq(0))
            }, duration);
        });
    }

    function hideWord($word) {
        var nextWord = takeNext($word);

        if ($word.parents('.dt_heading').hasClass('dt_heading_2')) {
            var parentSpan = $word.parent('.dt_heading_inner');
            parentSpan.addClass('selected').removeClass('waiting');
            setTimeout(function() {
                parentSpan.removeClass('selected');
                $word.removeClass('is_on').addClass('is_off').children('i').removeClass('in').addClass('out');
            }, selectionDuration);
            setTimeout(function() {
                showWord(nextWord, typeLettersDelay)
            }, typeAnimationDelay);

        } else if ($word.parents('.dt_heading').hasClass('dt_heading_2') || $word.parents('.dt_heading').hasClass('dt_heading_3') || $word.parents('.dt_heading').hasClass('dt_heading_8') || $word.parents('.dt_heading').hasClass('dt_heading_9')) {
            var bool = ($word.children('i').length >= nextWord.children('i').length) ? true : false;
            hideLetter($word.find('i').eq(0), $word, bool, lettersDelay);
            showLetter(nextWord.find('i').eq(0), nextWord, bool, lettersDelay);

        } else if ($word.parents('.dt_heading').hasClass('dt_heading_6')) {
            $word.parents('.dt_heading_inner').animate({
                width: '2px'
            }, revealDuration, function() {
                switchWord($word, nextWord);
                showWord(nextWord);
            });

        } else if ($word.parents('.dt_heading').hasClass('dt_heading_4')) {
            $word.parents('.dt_heading_inner').removeClass('is-loading');
            switchWord($word, nextWord);
            setTimeout(function() {
                hideWord(nextWord)
            }, barAnimationDelay);
            setTimeout(function() {
                $word.parents('.dt_heading_inner').addClass('is-loading')
            }, barWaiting);

        } else {
            switchWord($word, nextWord);
            setTimeout(function() {
                hideWord(nextWord)
            }, animationDelay);
        }
    }

    function showWord($word, $duration) {
        if ($word.parents('.dt_heading').hasClass('dt_heading_2')) {
            showLetter($word.find('i').eq(0), $word, false, $duration);
            $word.addClass('is_on').removeClass('is_off');

        } else if ($word.parents('.dt_heading').hasClass('dt_heading_6')) {
            $word.parents('.dt_heading_inner').animate({
                'width': $word.width() + 10
            }, revealDuration, function() {
                setTimeout(function() {
                    hideWord($word)
                }, revealAnimationDelay);
            });
        }
    }

    function hideLetter($letter, $word, $bool, $duration) {
        $letter.removeClass('in').addClass('out');

        if (!$letter.is(':last-child')) {
            setTimeout(function() {
                hideLetter($letter.next(), $word, $bool, $duration);
            }, $duration);
        } else if ($bool) {
            setTimeout(function() {
                hideWord(takeNext($word))
            }, animationDelay);
        }

        if ($letter.is(':last-child') && $('html').hasClass('no-csstransitions')) {
            var nextWord = takeNext($word);
            switchWord($word, nextWord);
        }
    }

    function showLetter($letter, $word, $bool, $duration) {
        $letter.addClass('in').removeClass('out');

        if (!$letter.is(':last-child')) {
            setTimeout(function() {
                showLetter($letter.next(), $word, $bool, $duration);
            }, $duration);
        } else {
            if ($word.parents('.dt_heading').hasClass('dt_heading_2')) {
                setTimeout(function() {
                    $word.parents('.dt_heading_inner').addClass('waiting');
                }, 200);
            }
            if (!$bool) {
                setTimeout(function() {
                    hideWord($word)
                }, animationDelay)
            }
        }
    }

    function takeNext($word) {
        return (!$word.is(':last-child')) ? $word.next() : $word.parent().children().eq(0);
    }

    function switchWord($oldWord, $newWord) {
        $oldWord.removeClass('is_on').addClass('is_off');
        $newWord.removeClass('is_off').addClass('is_on');
    }

    // Cookie Storage
    var cookieStorage = {
        setCookie: function setCookie(key, value, time, path) {
            var expires = new Date();
            expires.setTime(expires.getTime() + time);
            var pathValue = '';
            if (typeof path !== 'undefined') {
                pathValue = 'path=' + path + ';'
            }
            document.cookie = key + '=' + value + ';' + pathValue + 'expires=' + expires.toUTCString()
        },
        getCookie: function getCookie(key) {
            var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
            return keyValue ? keyValue[2] : null
        },
        removeCookie: function removeCookie(key) {
            document.cookie = key + '=; Max-Age=0; path=/'
        }
    };

    $('.dt_switcherdarkbtn').click(function() {
        $('.dt_switcherdarkbtn').toggleClass('active');
        if ($('.dt_switcherdarkbtn').hasClass('active')) {
            $('body').addClass('dark');
            cookieStorage.setCookie('yonkovNightMode', 'true', 2628000000, '/');
        } else {
            $('body').removeClass('dark');
            setTimeout(function() {
                cookieStorage.removeCookie('yonkovNightMode');
            }, 100)
        }
    });
    if (cookieStorage.getCookie('yonkovNightMode')) {
        $('body').addClass('dark');
        $('.dt_switcherdarkbtn').addClass('active');
    }

    // Social share toggle
    $('.post button.toggle-button').each( function() {
        $(this).on( 'click', function(e) {
            $(this).next('.social-share:not(.single-post-share) .icons').toggleClass("visible");
            $(this).toggleClass('fa-close').toggleClass('fa-share-nodes');
        });
    });

    // Spacer with Data Attribute
    let spacer = document.getElementsByClassName('spacer');
    for (let i = 0; i < spacer.length; i++) {
      let spacerHeight = spacer[i].getAttribute('data-height');
      spacer[i].style.height = "" + spacerHeight + "px";
    }

    // Background Image with Data Attribute
    let bgimageset = document.getElementsByClassName('data-bg-image');
    for (let i = 0; i < bgimageset.length; i++) {
        let bgimage = bgimageset[i].getAttribute('data-bg-image');
        bgimageset[i].style.backgroundImage = "url('" + bgimage + "')"
    }

    // Tab Content
    $(".dt_tabs").each(function() {
        var myTabs = $(this);
        myTabs.find(".tabs li button").click(function () {
            var tab_id = $(this).attr("data-tab");
            myTabs.find(".tabs li button").removeClass("active");
            myTabs.find(".tab-content .tab-pane").removeClass("active").removeClass("show");
            $(this).addClass("active");
            $("#" + tab_id).addClass("active").addClass("show").addClass("loading");

            $('.lds-dual-ring').addClass("loading");
            setTimeout(function() {
                $("#" + tab_id).removeClass("loading");
                $('.lds-dual-ring').removeClass("loading")
            }, 500);

            return false;
        });
    });

    /* ==========================================================================
    When document is loaded, do
    ========================================================================== */

    $( window ).scroll( () => {
        let docHeight = $(".site-wrapper").height();
        let winHeight = $( window ).height();
        let viewport = docHeight - winHeight;
        let scrollPos = $( window ).scrollTop();
        let scrollPercent = ( scrollPos / viewport ) * 100;
        $( ".dt_readingbar" ).css( "width", scrollPercent + "%" )
    });

    //Hide PreLoading
	function site_preloader() {
		if($('.dt_preloader').length){
			$('.dt_preloader').delay(1000).fadeOut(500);
		}
	}
    if ($(".dt_preloader-close").length) {
        $(".dt_preloader-close").on("click", function(){
            $('.dt_preloader').delay(200).fadeOut(500);
        });
    }
	
	$(window).on('load', function() {
		site_preloader();
        initHeadline();
	});

})( jQuery );