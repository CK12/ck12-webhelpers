define([
    'd3',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.config'
], function(d3, helpers, config){

    function create(args){
        args = args || {};

        var force = d3.layout.force();

        helpers.extend(force, {
            instanceData: args.instanceData || helpers.getData(),
            sync: sync,
            setFixedState: setFixedState,
            cooldown: cooldown
        });

        var linkDistance = args.linkDistance || config.nodes.linkLength - 100;

        force
            .linkDistance(linkDistance)
            .charge(-20000)
            .gravity(0)
            .friction(0.3)
            .size([config.width, config.height]);

        return force;
    }

    function sync(){
        this
            .nodes(this.instanceData.dataset.graph.nodes)
            .links(this.instanceData.dataset.graph.links)
            .start()
            .stop();

        return this;
    }

    function setFixedState(arg){
        var cb = typeof arg === 'function' ? arg : function(d){
            d.fixed = arg;
        };
        this.nodes().forEach(cb);
        return this;
    }

    function cooldown(steps) {
        var i = 0,
            n = typeof steps === 'number' ? steps : 5;

        this.resume();
        for (var i = 0; i < n; i++) {
            requestAnimationFrame(this.tick);
        }
        this.stop();
        return this;
    }

    return {
        create: create
    };
});