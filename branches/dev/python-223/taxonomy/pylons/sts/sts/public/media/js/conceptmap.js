
function pageScroll() {
    var width = $(document).width();
    var viewWidth = $(window).width();
    // alert('scroll: ' + width + ', ' + viewWidth);
    if (viewWidth < width) {
        var diff = parseInt(width, 10) - parseInt(viewWidth, 10);
        diff = diff / 2;
        if (width - viewWidth > 500) {
            diff += 200;
        }
        // alert("Scroll by: " + diff);
        window.scrollBy(diff, 150);
    }
}

$(document).ready(function() { 
    // setTimeout('scroll()', 3000);
    setTimeout('pageScroll()', 500);
});

