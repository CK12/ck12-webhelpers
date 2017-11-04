define('load_wait', ['jquery'], function () {
    
    var load = 0,
        loader = $('#loader'),
        loadLine = loader.find('.loading-line'),
        loadValue = loader.find('.loading-percent'),
        wait = $('#wait'),
        timer;
    
    Wait = {},
    
    Wait.show = function () {
        wait.removeClass('hide');
    },
    
    Wait.hide = function () {
        wait.addClass('hide');
        clearTimeout(timer);
    },
    
    Wait.defer = function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
            Wait.show();
        }, 1000);
    },
    
    Loader = {},
    
    Loader.get = function () {
        return load;
    },
    
    Loader.set = function (val) {
        if (val <= load) return 0;
        load = val;
        if (load == 100) {
            done();
        } else {
            update();
        }
        return 1;
    },
    
    Loader.add = function (val) {
        return Loader.set(load + val);
    },
    
    Loader.gradually = function (val, time) {
        var interval;
        time *= 1000; // time in seconds
        if (val > load) {
            time /= (val - load);
            interval = setInterval(function () {
                if (load >= val) {
                    clearInterval(interval);
                } else {
                    Loader.add(1);
                }
            }, time);
        }
    };
    
    function done () {
        loader.hide();
    }
    
    function update () {
        loadLine.width(load + '%');
        loadValue.text(load + '%');
    }
    
});