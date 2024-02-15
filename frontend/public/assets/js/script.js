document.addEventListener("DOMContentLoaded", function () {
  $(".navbar-toggler").click(function () {
    $(this).toggleClass("menu-opened");
    $("#header .collapse:not(.show)").toggleClass("menu-show");
    $("body").toggleClass("scroll-off");
    // $(".overlay").fadeToggle();
    $(".menuoverlay").fadeToggle();
  });
  return false;
  var mySwiper = new Swiper(".swiper-container", {
    // Optional parameters
    direction: "horizontal",
    loop: true,

    centeredSlides: true,
    speed: 2000,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    breakpoints: {
      640: {
        slidesPerView: 1.8,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 3.2,
        spaceBetween: 40,
      },
      1024: {
        slidesPerView: 5,
        spaceBetween: 50,
      },
    },
    // If we need pagination
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    // Navigation arrows
    // navigation: {
    //   nextEl: '.swiper-button-next',
    //   prevEl: '.swiper-button-prev',
    // },

    on: {
      slideChange: function () {
        // Pause the video in the previous slide
        var previousSlide = this.slides[this.previousIndex];
        var previousVideo = previousSlide.querySelector(".swiper-video");
        if (previousVideo) {
          previousVideo.pause();
        }

        // Play the video in the active slide
        var activeSlide = this.slides[this.activeIndex];
        var activeVideo = activeSlide.querySelector(".swiper-video");
        if (activeVideo) {
          activeVideo.play();
        }
      },
      slideClick: function () {
        // Pause the video in the previous slide
        var previousSlide = this.slides[this.previousIndex];
        var previousVideo = previousSlide.querySelector(".swiper-video");
        previousVideo.pause();
      },
    },
  });
});

window.onload = function () {
  if (true && window && window.jQuery) {
    var HeadH = $("#header").outerHeight();
    //$('body').css('padding-top', HeadH);

    var scrollWindow = function () {
      $(window).on("load scroll", function () {
        var navbar = $("#header");

        if ($(this).scrollTop() > 150) {
          if (!navbar.hasClass("is-sticky")) {
            navbar.addClass("is-sticky");
            $("body").css("padding-top", HeadH);
          }
        }
        if ($(this).scrollTop() < 150) {
          if (navbar.hasClass("is-sticky")) {
            navbar.removeClass("is-sticky");
            $("body").css("padding-top", 0);
          }
        }
        if ($(this).scrollTop() > 150) {
          if (!navbar.hasClass("awake")) {
            navbar.addClass("awake");
          }
        }
        if ($(this).scrollTop() < 150) {
          if (navbar.hasClass("awake")) {
            navbar.removeClass("awake");
          }
        }
      });
    };
    scrollWindow();

    let btn = $("#top-button");

    $(window).scroll(function () {
      btn = $("#top-button");
      if ($(window).scrollTop() > 300) {
        btn.addClass("show");
      } else {
        btn.removeClass("show");
      }
    });

    // btn.on("click", function (e) {
    //   e.preventDefault();
    //   $("html, body").animate({ scrollTop: 0 }, "300");
    // });

    $(".navbar-toggler").click(function () {
      $(this).toggleClass("menu-opened");
      $("#header .collapse:not(.show)").toggleClass("menu-show");
      $("body").toggleClass("scroll-off");
      // $(".overlay").fadeToggle();
      $(".menuoverlay").fadeToggle();
    });

    // $(".overlay").click(function () {
    //     $(this).fadeToggle();
    //     $("#header .collapse:not(.show)").toggleClass("menu-show");
    //     $("body").toggleClass("scroll-off");
    //     $(".navbar-toggler").toggleClass("menu-opened");
    //     $(".menuoverlay").fadeOut();
    // });
    $(".menuoverlay").click(function () {
      $(this).fadeOut();
      $("#header .collapse:not(.show)").toggleClass("menu-show");
      $("body").toggleClass("scroll-off");
      $(".navbar-toggler").toggleClass("menu-opened");
      // $(".overlay").fadeToggle();
    });
    $(".dashboardoverlay").click(function () {
      $(this).fadeToggle();
      $("body").removeClass("scroll-off");
      $(".dashboardSideBar").removeClass("mobile-show");
    });

    $(".menu-toggle").click(function () {
      $(".dashboardSideBar").addClass("mobile-show");
      $("body").toggleClass("scroll-off");
      $(".dashboardoverlay").fadeToggle();
    });
    $(".dashboard-nav-list a").click(function () {
      $("body").toggleClass("scroll-off");
      $(".dashboardoverlay").hide();
      $(".dashboardSideBar").removeClass("mobile-show");
    });

    $(window).on("resize", function (e) {
      checkScreenSize();
    });
    var logo = $(".navbar-brand img").attr("src");

    checkScreenSize();
    function checkScreenSize() {
      var newWindowWidth = $(window).width();
      if (newWindowWidth <= 991) {
        $("#header .collapse:not(.show)").find(".mobile_logo").remove();
        $("#header .collapse:not(.show)").append(
          "<div class='mobile_logo'>" +
            "<img src='/assets/img/logo.png' alt=''>" +
            "</div>"
        );
      }
    }
    $(document).ready(function () {
      $(".vindorList .vindorCard").matchHeight();
      $(".featured-text").matchHeight();
      $(".proTitle").matchHeight();
      $(".newlyItemCard").matchHeight();
    });
    var swiper = new Swiper(".offerSliderCart", {
      spaceBetween: 15,
      centeredSlides: true,
      loop: true,
      speed: 800,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      navigation: {
        nextEl: ".offerActionBtn .swiper-button-next",
        prevEl: ".offerActionBtn .swiper-button-prev",
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        575: {
          slidesPerView: 1.1,
          spaceBetween: 5,
        },
        767: {
          slidesPerView: 1.1,
          spaceBetween: 5,
        },
        991: {
          slidesPerView: 1.2,
        },
        1200: {
          slidesPerView: 1.3,
        },
      },
    });

    //Dashboard Menu
    $(function () {
      var $nav = $("nav.greedy");
      var $btn = $("nav.greedy button");
      var $vlinks = $("nav.greedy .links");
      var $hlinks = $("nav.greedy .hidden-links");

      var numOfItems = 0;
      var totalSpace = 0;
      var breakWidths = [];

      // Get initial state
      $vlinks.children().outerWidth(function (i, w) {
        totalSpace += w;
        numOfItems += 1;
        breakWidths.push(totalSpace);
      });

      var availableSpace, numOfVisibleItems, requiredSpace;

      function check() {
        // Get instant state
        availableSpace = $vlinks.width() - 10;
        numOfVisibleItems = $vlinks.children().length;
        requiredSpace = breakWidths[numOfVisibleItems - 1];

        // There is not enought space
        if (requiredSpace > availableSpace) {
          $vlinks.children().last().prependTo($hlinks);
          numOfVisibleItems -= 1;
          check();
          // There is more than enough space
        } else if (availableSpace > breakWidths[numOfVisibleItems]) {
          $hlinks.children().first().appendTo($vlinks);
          numOfVisibleItems += 1;
        }
        // Update the button accordingly
        $btn.attr("count", numOfItems - numOfVisibleItems);
        if (numOfVisibleItems === numOfItems) {
          $btn.addClass("hidden");
        } else $btn.removeClass("hidden");
      }

      // Window listeners
      $(window).resize(function () {
        check();
      });

      $btn.on("click", function () {
        $hlinks.toggleClass("hidden");
      });

      check();
    });

    // $('.box-loader').fadeOut('slow');

    // var Wheight = $(window).height();
    // var Hheight = $('#header').outerHeight();
    // var Fheight = $('.footer_wrapper').outerHeight();

    // var Innheight = Wheight - (Fheight + Hheight);

    // $('.cms_section').css('min-height', Innheight);
  } else {
  }
};

$(document).on("click" , ".menu-items button span" , function(){
    $(this).closest(".dropdown").addClass("show")
})

