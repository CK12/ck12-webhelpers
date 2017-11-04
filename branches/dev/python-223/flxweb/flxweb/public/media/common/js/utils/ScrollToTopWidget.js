define(['jquery'], function($) {

    var _widgetEl;
    /**
     * @constructor
     * Places a scroll to top widget on the page. If the widget is already on the page, then it will return the API of
     * the existing widget.
     * @params {Number} minScrollTop - The minimum value that the user must scroll down before the icon appears.
     * @returns {Object} - API to the widget.
     */
    function ScrollToTopWidget(minScrollTop) {
        var widgetHTML = '<div class="icon-wrapper"><span class="icon-arrow3-up"></span></div><div class="goto-top">TOP</div>';
        var $widget;

        _widgetEl = document.getElementsByClassName('scroll-to-top-widget')[0];
        if (_widgetEl !== undefined) {
            // the widget already exists... just return this API to control it.
            return this;
        }
        else {
            _widgetEl = document.createElement('div');
            _widgetEl.setAttribute('class', 'scroll-to-top-widget');
            _widgetEl.innerHTML = widgetHTML;
            $widget = $(_widgetEl);
            this.setMinScrollTop(minScrollTop);
            $(document.body).append($widget);
            // listener to window scroll
            $(window).scroll(function () {
                if ($(this).scrollTop() > _widgetEl._minScrollTop) {
                    $widget.fadeIn();
                }
                else {
                    $widget.fadeOut();
                }
            });
            $widget.click(function () {
                $('html, body').animate({
                    scrollTop: 0
                }, 600);
                return false;
            });
        }
        return this;
    }

    /**
     * @method - Set the minimum amount that a user must scroll before the widget
     *           is displayed.
     */
    ScrollToTopWidget.prototype.setMinScrollTop = function(minScrollTop) {
        if (typeof minScrollTop === 'number' && minScrollTop >= 0) {
            _widgetEl._minScrollTop = minScrollTop;
        }
        else {
            _widgetEl._minScrollTop = 0;
        }
        return null;
    };

    /**
     * @method - Returns the current minScrollTop value.
     */
    ScrollToTopWidget.prototype.getMinScrollTop = function() {
        return _widgetEl._minScrollTop;
    };

    return ScrollToTopWidget;
});
