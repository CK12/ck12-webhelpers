define(['jquery'], function($){
    'use strict';

    /**
     *  Timeout
     *
     *   usage example:
     *     var t = new Timeout();
     *     t.start().done(function(){//timer executed})
     */
    var Timeout = function(timeout, data){
        var _t = null,          //timeout reference
            _d = $.Deferred(),  //deferred
            _p = _d.promise();  //promise
            // _st = 'unstarted';  //timeout state

        /**
         * Timeout.Run
         *   internal timer function invoked on timer completion.
         */
        function run(){
            clearTimeout(_t);
            // _st = 'complete';
            _d.resolve(data);
        }

        /**
         * Starts the timeout
         */
        this.start = function(){
            if ( Number.isNaN(timeout)){
                throw 'Timeout must be number.';
            }
            _t = setTimeout(run, timeout);
            // _st = 'started';
            return _p;
        };

        /**
         *  Cancels the timeout
         */
        this.cancel = function(){
            clearTimeout(_t);
            //_st = 'cancelled';
            _d.reject();
        };
    };

    return {
        'Timeout': Timeout
    };

});
