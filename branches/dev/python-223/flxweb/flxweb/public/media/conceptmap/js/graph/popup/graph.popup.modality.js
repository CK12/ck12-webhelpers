define([
    'd3',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.helpers'
], function(d3, config, helpers){
    'use strict';

    var modalityNodes    = d3.selectAll('.modality'),
        $modalityMessage = $('.more-info__message'),
        $modalities      = $('.modalities');

    function getURL(d, path){
        path = typeof path === 'string' ? path : '';
        return config.modality.host + d.url + path + config.modality.referrer;
    }

    function getModalityURL(d, modalityURL) {
        return getURL(d, modalityURL);
    }

    function setThumbnail(node, modality, icon){
        var thumbnailClass     = 'modality__thumbnail__image',
            thumbnailIconClass = 'modality__thumbnail__icon',
            thumbnail          = this.select('.' + thumbnailClass),
            thumbnailIcon      = this.select('.' + thumbnailIconClass);

        if(modality.image){
            thumbnail.style('background-image', 'url(' + modality.image + ')');
            thumbnailIcon
                .attr('class', thumbnailIconClass);
        } else {
            thumbnail.style('background-image', null);
            thumbnailIcon
                .attr('class', thumbnailIconClass + ' icon-' + icon.className);
        }

    }

    function truncate(string, maxChar){
        if(string.length <= maxChar) { return string; }
        return string.substr(0, maxChar - 3).trim() + '...';
    }

    function getIcon(modalityType) {
        var className,
            name;
        switch (modalityType) {
            case 'lesson':
            case 'concept':
            case 'section':
                className = 'read';
                name = 'Read';
                break;
            case 'plix':
                className = 'interactive_practice';
                name = 'PLIX';
                break;
            case 'enrichment':
            case 'lecture':
            case 'audio':
                className = 'video';
                name = 'Video';
                break;
            case 'activity':
            case 'cthink':
                className = 'activity';
                name = 'Activity';
                break;
            case 'flashcard':
            case 'studyguide':
                className = 'studyaid';
                name = 'Study Aid';
                break;
            case 'asmtpractice':
            case 'asmtquiz':
            case 'quiz':
                className = 'exercise';
                name = 'Assessment';
                break;
            case 'web':
                className = 'links';
                name = 'Web Links';
                break;
            case 'conceptmap':
                className = 'mindmap';
                name = 'Concepts Map';
                break;
            case 'rwa':
            case 'rwaans':
                className = 'rwa';
                name = 'Real World';
                break;
            case 'simulation':
            case 'simulationint':
                className = 'simulations';
                name = 'Simulation';
                break;
            case 'image':
            case 'interactive':
                className = 'images';
                name = 'Image';
                break;
            default:
                className = 'read';
                name = 'Read';
        }

        return {
            className: className,
            name: name
        };
    }

    function showModalities(d) {
        var currentModalities = helpers.getModalities(d),
            usableNodes;

        // Hide all nodes
        modalityNodes.style('visibility', 'hidden');

        if (!currentModalities.length) {
            return showModalityMessage();
        } else {
            hideModalityMessage();
        }

        // Sort and get the first two modalities
        currentModalities = currentModalities.sort(function(a) {
            var isRead = ['lesson', 'read'].indexOf(a.type) > -1;
            return isRead ? -1 : 1;
        }).slice(0, 2);

        // We should only show the amount of modalities we have
        usableNodes = modalityNodes.filter(function(_d, i){
            return i < currentModalities.length;
        });

        usableNodes.each(function(_d, i){
            var modality     = d3.select(this),
                modalityData = currentModalities[i],
                icon         = getIcon(modalityData.type),
                title        = modalityData.title,
                url          = getModalityURL(d, modalityData.url);

            modality.select('.modality__info__type i')
                .attr('class', 'icon-' + icon.className);

            modality.select('.modality__info__type__label')
                .text(icon.name);

            modality
                .call(setThumbnail, modalityData, icon);

            modality.select('.modality__info__title')
                .attr('title', title)
                .text(function(){
                    return truncate(title, config.modality.maxTitleChars);
                })
                .attr('target', '_blank')
                .attr('href', url);

            modality.select('.modality__thumbnail__link')
                .attr('title', title)
                .attr('target', '_blank')
                .attr('href', url);

            modality.style('visibility', 'visible');
        });
    }

    function showModalityMessage(){
        $modalityMessage.removeClass('hide');
        $modalities.addClass('hide');
    }
    function hideModalityMessage(){
        $modalityMessage.addClass('hide');
        $modalities.removeClass('hide');
    }

    return {
        show: showModalities,
        getURL: getURL,
        getModalityURL: getModalityURL
    };
});