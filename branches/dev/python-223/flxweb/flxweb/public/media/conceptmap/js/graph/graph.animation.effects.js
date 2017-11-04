define([
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.helpers'
], function(config, helpers){
    'use strict';

    var setContext = function _setContext(fn){
        return function(){
            var args = Array.prototype.slice.apply(arguments),
                node = this instanceof Array ? this : args.shift(); // With D3 the first argument will always be the node or this

            if(node === args[0]) {
                args = args.slice(1);
            }

            // Set duration if none
            args[0] = typeof args[0] === 'number' || typeof args[0] === 'function' ? args[0] : config.duration;
            return fn.apply(node, args);
        };
    };

    function fadeIn(duration){
        return this.style('opacity', 0)
            .transition('fadeIn').duration(duration)
            .style('opacity', 1);
    }

    function fadeOut(duration, startOpacity){
        return this.style('opacity', startOpacity || 1)
            .transition('fadeOut').duration(duration)
            .style('opacity', 0);
    }

    function fadeInCompletely(duration){
        var trans = fadeIn.call(this, duration);

        helpers.transitionHandler(trans, {
            onStart: function(){
                d3.select( trans.node() )
                    .classed('hide', false);
            }
        });

        return trans;
    }

    function fadeOutCompletely(duration, startOpacity){
        var trans = fadeOut.call(this, duration, startOpacity);

        helpers.transitionHandler(trans, {
            onEnd: function(){
                d3.select( trans.node() )
                    .classed('hide', true);
            }
        });

        return trans;
    }

    function fadeInScale(duration) {
        var transform = helpers.getTransform(this);

        this.style('opacity', 0)
            .attr('transform', 'translate(' + transform.translate.join(' ') + ')scale(0)')
        .transition('fadeInScale').duration(duration)
            .style('opacity', 1)
            .attr('transform', 'translate(' + transform.translate.join(' ') + ')scale(1)');
    }

    function growInCircle(duration){
        this.attr('r', 0)
            .transition().duration(duration)
            .attr('r', helpers.radius);
    }

    function growInImage(duration){
        this.attr('width', 0)
            .attr('height', 0)
            .attr('x', 0)
            .attr('y', 0)
            .transition().duration(duration)
            .attr('x', function(d){ return -d.radius; })
            .attr('y', function(d){ return -d.radius; })
            .attr('width', function(d){ return d.radius * 2; })
            .attr('height', function(d){ return d.radius * 2; });
    }

    function growPolygonImage(duration){
        this.attr('width', 0)
            .attr('height', 0)
            .attr('x', 0)
            .attr('y', 0)
            .transition().duration(duration)
            .transition().duration(duration)
            .attr('x', -34)
            .attr('y', -60)
            .attr('height', 120)
            .attr('width', 120);
    }

    function growPolygon(duration){
        this.attr('points', '0,0 0,0 0,0 0,0 0,0 0,0')
            .transition().duration(duration)
            .transition().duration(duration)
            .attr('points', '30,-52 -30,-52 -60,0 -30,52 30,52 60,0'); //regular hexagon centered about (0,0)
    }

    function shrinkCircle(duration){
        this.transition().duration(duration)
            .attr('r', 0);
    }

    function shrinkImage(duration){
        this.transition().duration(duration)
            .attr('width', 0)
            .attr('height', 0)
            .attr('x', 0)
            .attr('y', 0);
    }

    function shrinkNodeToCenter(duration, transform) {
        this.selectAll('circle')
            .call(function(){
                shrinkCircle.call(this, duration);
            });

        this.select('image')
            .call(function(){
                shrinkImage.call(this, duration);
            });

        this.select('text.detail')
            .call(helpers.hide);

        this.select('circle.detail')
            .style('opacity', 0.2);

        this.selectAll('text:not(.detail)')
            .call(function(){
                fadeOut.call(this, duration);
            });

        this.transition().duration(duration / 1.25)
            .attr('transform', transform);
    }

    function scaleDownNode(duration){
        this.selectAll('circle.shadow, circle.main')
            .transition('removeMouseEventScalingEffect').duration(duration)
                .style('transform', 'scale(1)');
    }

    return {
        fadeIn: setContext(fadeIn),
        fadeOut: setContext(fadeOut),
        fadeInCompletely: setContext(fadeInCompletely),
        fadeOutCompletely: setContext(fadeOutCompletely),
        fadeInScale: setContext(fadeInScale),

        shrinkCircle: setContext(shrinkCircle),
        shrinkImage: setContext(shrinkImage),
        shrinkNodeToCenter: setContext(shrinkNodeToCenter),
        growPolygon: setContext(growPolygon),
        growPolygonImage: setContext(growPolygonImage),
        growInCircle: setContext(growInCircle),
        growInImage: setContext(growInImage),
        scaleDownNode: setContext(scaleDownNode)
    };
});
