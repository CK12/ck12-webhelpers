define(['jquery'], function($){
    var dfd     = $.Deferred(),
        timeout = setTimeout(dfd.resolve, 10000); // In the odd chance that the queue event is fired too fast

    $(document).one('beginMathJaxRenderQueue', function(evt, data){
        clearTimeout(timeout);
        if(data.count === 0){ return dfd.resolve(); } // No queue then resolve.

        MathJax.Hub.Register.StartupHook('End', function () {
            MathJax.Hub.Queue(dfd.resolve); // Add to end of queue
        });
    });

    return dfd.promise();
});