(function ($) {

    $.fn.fixedHeaderScroll = function (options) {

        var settings = $.extend({
            'headerSelector': 'header', // You need to designate the header element in your website.
            'offset': 0, // You can offset the scroll position.
            'smooth': true, // You can choose if you use smooth scroll or not.
            'smoothDuration': 500, // Scroll speed. (in ms)
            'smoothEasing': 'linear', // Scroll easing.
        }, options);

        function fixScroll(targetSlector) {
            if (settings.headerSelector == false) {
                var h = 0;
            } else {
                var headerEl = $(settings.headerSelector);
                var h = headerEl.outerHeight();
            }

            var targetEl = $(targetSlector);
            if (targetEl.length < 1) {
                return false;
            }
            var t = targetEl.offset().top;
            var s = t - 160;

            if (settings.smooth) {
                $("html, body").stop(true, false).animate({
                    scrollTop: s
                }, settings.smoothDuration, settings.smoothEasing);
            } else {
                $("html, body").scrollTop(s);
            }
            return $(this);
        }

        this.unbind("click.fixedHeaderScroll");
        this.bind("click.fixedHeaderScroll", function () {
            fixScroll($(this).attr("href"));
        });

        $(window).on('load', function () {
            if (location.hash) {
                fixScroll(location.hash);
                return false;
            }
        });

    };
})(jQuery);