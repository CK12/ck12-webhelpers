define([
    'jquery',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.events',
    'conceptmap/graph/popup/graph.popup.modality',
    'conceptmap/filter'
], function($, elements, config, data, helpers, events, modality, filter){


    var duration = config.duration,
        alreadyDisplayed;


    function setPopupData(popup, d, i, args){
        var parentSubject    = helpers.getTopLevelParent(d.EID),
            parentModalities = helpers.getModalities(parentSubject);

        popup.select('.more-info__arrow-button')
            .attr('href', function(){
                return modality.getURL(d);
            });

        popup.select('.more-info__header__name')
            .attr('href', function(){
                return  modality.getURL(d);
            })
            .text(d.name);

        popup.select('.more-info__header__subject')
            .attr('href', config.modality.host + '/' + d.url.split('/')[1] + config.modality.referrer)
            .attr('target', '_blank')
            .text(helpers.getSubject(d.EID));

        popup.select('.more-info__header__category')
            .attr('disabled', parentModalities.length ? null : 'disabled')
            .style('pointer-events', parentModalities.length ? null : 'none')
            .attr('href', config.modality.host + parentSubject.url + config.modality.referrer)
            .attr('target', '_blank')
            .text(parentSubject.name);

        popup.select('.more-info__header__summary')
            .text(d.description);

        popup.select('.more-info__close-button')
            .on('click', function(){
                hidePopup(d, i, args);
            });

        popup
            .call(helpers.fakeDisplay)
            .style('transform', function(_d){
                if(!alreadyDisplayed){
                    var cRect = this.getBoundingClientRect();
                    _d.height = cRect.height;
                    _d.width  = cRect.width;
                    _d.x = 20;
                    _d.y = config.height - _d.height - 20;
                    alreadyDisplayed = true;
                }
                return 'translate(' + _d.x + 'px, ' + _d.y + 'px)';
            });
    }

    function showPopup(d, i, args) {
        args = args || {};

        var dfd = $.Deferred();
        if( helpers.isPopupOpen() ){ return dfd.reject(); }

        var evts = args.events || events;

        var node = d.elements.nodes,
            link = d.elements.links,
            popup = elements.popup,
            activeNode = d3.select( helpers.getParentGroup(this) );

        var currentTransition    = node.transition().duration(duration),
            linkTransition       = link.transition().duration(duration),
            activeNodeTransition = activeNode.transition('activeNode').duration(duration),
            popupTransition      = popup.transition('popup').duration(duration);

        localStorage.setItem('conceptMapEID', helpers.getCurrentNucleus().EID);
        localStorage.setItem('conceptMapFilter', filter.currentValue());

        popup.call(setPopupData, d, i, args);

        node.call(evts.unbind, function(){
            // Retain popup functionality for current node
            activeNode.selectAll('.popup')
                .call(evts.on.popup);
        });

        activeNodeTransition
            .attr('transform', helpers.changeScale);

        currentTransition
            .select('circle.main')
                .style('fill', function(c) {
                    return c === d ? helpers.lighten(helpers.getColor(c), config.nodes.active.colorLighten) : helpers.inactiveLighten(c);
                });

        currentTransition
            .select('image')
                .style('opacity', function(c) {
                    return helpers.isNucleus(d) && c === d ? 1 : config.nodes.inactive.opacity.image;
                });

        currentTransition
            .select('circle.shadow')
                .style('opacity', config.nodes.active.opacity.shadow);

        currentTransition
            .select('polygon.shadowed')
                .style('fill', function(c) {
                    return c === d ? helpers.getColor(c) : helpers.inactiveLighten(c);
                });

        currentTransition
            .select('g.removeButton circle')
                .attr('fill', function() {
                    return helpers.lighten(config.colors.fucousGray, 0.15);
                });

        currentTransition
            .select('text.main')
                .style('opacity', function(c) {
                    return c === d ? 1 : config.nodes.inactive.opacity.text;
                });

        linkTransition
            .style('stroke-opacity', function(c) {
                return c.target === d ? 1 : config.nodes.inactive.opacity.link;
            });

        activeNode.moveToFront();

        activeNodeTransition
            .select('text.popup')
                .text(config.nodes.text.popup.close);

        activeNodeTransition
            .select('polygon.popup')
                .style('opacity', 1)
                .style('fill', config.colors.robinsEgg)
                .style('cursor', 'default');

        popupTransition.call(helpers.show);

        modality.show(d);

        if (!(d.dataset.nuclei[0] === d || (helpers.isNucleus(d) && d.dataset.nuclei[d.dataset.nuclei.length - 1] !== d))) {
            // Set hide and click below when not the first nucleus and not the last
            // Show details if not a nucleus
            activeNode.select('circle.detail')
                .style('opacity', function(_d){
                    var isEditor = d.editor;
                    return isEditor || helpers.isNucleus(_d) ? 0 : 1;
                })
                .call(evts.on.popupClick);

            activeNode.select('text.detail')
                .style('opacity', function(_d){
                    var isFirstNucleus = _d === d.dataset.nuclei[0],
                        isEditor       = d.editor;

                    return isEditor || isFirstNucleus ? 0 : 1;
                })
                .call(evts.on.popupClick);
        }

        helpers.transitionFinished(popupTransition, dfd.resolve);
        return dfd.promise();
    }

    function hidePopup(d, i, args) {
        args = args || {};
        d    = d || helpers.getCurrentNucleus();

        var dfd = $.Deferred();

        var evts = args.events || events;

        var node  = d.elements.nodes,
            link  = d.elements.links,
            popup = elements.popup;

        var firstTransition = node.transition().duration(duration),
            secondTransition = firstTransition.transition().duration(duration),
            linkSecondTransition = link.transition().duration(duration).transition().duration(duration);

        firstTransition
            .attr('transform', helpers.revertScale);

        firstTransition
            .selectAll('polygon.popup')
                .style('cursor', 'pointer')
                .style('fill', config.colors.persianGreen)
            .transition().duration(duration)
                .style('opacity', 0);

        secondTransition
            .select('text.popup')
                .style('opacity', 0);

        secondTransition
            .select('circle.main')
                .style('transform', 'scale(1)')
                .style('fill', function(_d) {
                    return helpers.isActive(_d) ? helpers.getColor(_d) : helpers.inactiveLighten(_d);
                });

        secondTransition
            .select('image')
                .style('opacity', function(_d) {
                    return helpers.isNucleus(_d) ? 1 : config.nodes.inactive.opacity.image;
                });

        secondTransition
            .select('circle.shadow')
                .style({
                    transform: 'scale(1)',
                    opacity: config.nodes.inactive.opacity.shadow
                });

        secondTransition
            .select('polygon.shadowed')
                .style('fill', function(_d) {
                    return _d ? helpers.getColor(_d) : helpers.inactiveLighten(_d);
                });

        secondTransition
            .select('g.removeButton circle')
                .attr('fill', config.colors.fuscousGray);

        secondTransition
            .select('text.main')
                .style('opacity', function(_d) {
                    return helpers.isActive(_d) ? 1 : config.nodes.inactive.opacity.text;
                });

        secondTransition
            .select('circle.detail')
                .style('opacity', 0);

        secondTransition
            .select('text.detail')
                .style('opacity', 0);

        linkSecondTransition
            .style('stroke-opacity', function(_d) {
                return helpers.isActive(_d.target) ? 1 : config.nodes.inactive.opacity.link;
            });

        popup.transition().duration(duration)
            .style('opacity', 0)
        .transition().duration(duration)
            .style('display', 'none');

        helpers.transitionFinished(linkSecondTransition, function(){
            node.call(evts.bind);

            node.select('text.popup')
                .text(config.nodes.text.popup.open);

            dfd.resolve();
        });

        return dfd.promise();
    }

    return {
        hidePopup: hidePopup,
        showPopup: showPopup
    };
});