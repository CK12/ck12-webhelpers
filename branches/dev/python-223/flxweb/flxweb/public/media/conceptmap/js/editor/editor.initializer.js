define([
    'jquery',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.animation',
    'conceptmap/graph/graph.events',
    'conceptmap/graph/popup/graph.popup',
    'conceptmap/editor/editor.elements',
    'conceptmap/editor/editor.element.stub',
    'conceptmap/editor/editor.data',
    'conceptmap/editor/editor.events',
    'conceptmap/editor/editor.animation',
    'conceptmap/editor/editor.search.widget',
    'conceptmap/editor/editor.state.manager',
    'conceptmap/editor/editor.session.manager',
    'conceptmap/editor/editor.data.reconstructor',
    'conceptmap/editor/editor.helpers',
    'conceptmap/editor/editor.widget',
    'conceptmap/graph/graph.transitions',
    'conceptmap/user/user'
], function($, helpers, config, elements, data, animation, events, popup, editorElements, editorElementsStub, editorData, editorEvents, editorAnimation, editorSearch, editorStateManager, editorSessionManager, editorDataReconstructor, editorHelpers, editorWidget, transition, User){
    'use strict';

    var fadeDuration = 250;

    function init() {
        if(helpers.isPopupOpen()){
            popup.hide()
                .done(startEditorTransition);
        } else {
            startEditorTransition();
        }
    }

    function startEditorTransition(){
        var currentNucleus = helpers.getCurrentNucleus();

        var transitions, expandNodes, nucleus;

        // Load in editor SVG / Hide map SVG
        elements.svg
            .call(animation.effects.fadeOutCompletely, fadeDuration);

        editorElements.svg
            .classed('hide', false)
            .call(animation.effects.fadeInCompletely, fadeDuration);

        elements.$contentWrapper.addClass('editorState');

        // Zoom will now correspond to editor SVG
        events.resetZoom();

        // Reset editor data/elements
        reset();

        // Get nucleus for editor SVG
        $.when(
            editorStateManager.get({
                encodedID: currentNucleus.EID,
                memberID: User.get().userInfoDetail.id
            })
        ).then(function(feedbacks){
            var dataConstructor, eids;

            if(config.urlParams.editor === 'true'){
                editorWidget.setSlide(1);
            }

            if(hasModifiedCurrentGraph(feedbacks)){
                eids = getEIDs(feedbacks);

                dataConstructor = function setupReconstruct(args){
                    return editorDataReconstructor.reconstruct.call(null, currentNucleus.EID, eids, args);
                };
            }

            if(!feedbacks || !dataConstructor){
                nucleus = helpers.getConcept(currentNucleus.EID);
            }

            // Begin animation sequence for loading in editor nucleus and nodes
            transitions = transition.expand(nucleus, 0, helpers.extend(
                {
                    positionType: 'start',
                    force: editorEvents.force,
                    cb: editorEvents.bind,
                    dataType: 'editor',
                    skipShift: true,
                    dataConstructor: dataConstructor
                },
                helpers.getData('editor')
            ));

            // Load in editor specific elements
            expandNodes = helpers.getTransition(transitions, 'expandNodes');
            expandNodes.dfd.progress(function(){
                editorSessionManager.begin();

                // When we start stageering in nodes, add in remove buttons and stagger them in as well
                editorElementsStub.addRemoveButton()
                    .call(animation.effects.fadeInScale, helpers.stagger);

                var addButton = editorElementsStub.createAddButton();

                editorAnimation.expandInAddButton().done(function(){
                    addButton.filter(helpers.isNode)
                        .call(animation.position.text);

                    addButton.selectAll('.addButtonText')
                        .call(animation.effects.fadeIn);

                    editorWidget.setComments();
                    editorWidget.autosave();
                });

                if(eids){
                    var addedEids = eids
                        .filter(editorHelpers.isAdded)
                            .map(editorHelpers.getUnmodifiedEid);

                    editorElements.nodes.filter(function(d){
                        return d.stateType === 'added';
                    })
                    .call(editorElementsStub.createAddLabel);
                }
            });
        });
    }


    function exit(cb){
        var exitTransition = editorElements.svg
            .transition('exit').duration(fadeDuration)
                .call(animation.effects.fadeOutCompletely, fadeDuration),
            transform;

        helpers.transitionHandler(exitTransition, {
            onStart: function(){
                editorSearch.close();
            },
            onEnd: function(){
                elements.svg
                    .call(animation.effects.fadeInCompletely, fadeDuration);

                if(typeof cb === 'function'){ cb(); }
            }
        });

        elements.$contentWrapper.removeClass('editorState');

        // Get current transform on graph container to retain where user was
        transform = helpers.getTransform(elements.container);
        events.resetZoom(transform.translate, transform.scale[0]);
    }

    function reset(isSameNucleus) {
        editorData.nuclei = [];
        editorData.graph = {
            nodes: [],
            links: []
        };
        editorData.connectionStrength = {};
        editorData.groups = [];

        if(!isSameNucleus){
            editorElements.container.selectAll('*').remove();
        } else {
            editorElements.links.exit().remove();
            editorElements.nodes.exit().remove();
        }

        editorElements.links = editorElements.container.selectAll('.link');
        editorElements.nodes = editorElements.container.selectAll('.node');
        editorElements.groups = [];
    }

    function hasModifiedCurrentGraph(feedbacks){
        return feedbacks instanceof Array && feedbacks.length;
    }

    function getEIDs(feedbacks) {
        if(!(feedbacks instanceof Array) || !feedbacks.length ){ return false; }
        return feedbacks.map(function(item){
            if(typeof item === 'string'){
                return item;
            } else if (typeof item === 'object' && item.suggestion){
                return item.suggestion;
            } else {
                console.error(item, 'is invalid');
            }
        });
    }


    return {
        init: init,
        exit: exit
    };
});