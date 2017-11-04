'use strict';

var classie       = require('classie'),
    modalities    = require('../../sharedGlobal/modalitites/modalities'),
    endpoint      = require('./modality.endpoint'),
    nodes         = require('../shared/dom.nodes'),
    message       = require('../shared/message'),
    widgetData    = require('../shared/widget.data'),
    template      = require('../utils/dom.template');

function createTitle(name) {
    return name.split('-').join(' ');
}

function createURL(modality) {
    // var partnerId = widgetData.userConfig.partnerId;

    return  endpoint + '/embed/#module=modality' +
            '&handle=' + modality.handle + '&mtype=' + modality.mtype +
            '&branch=' + modality.branch + '&context=' + modality.context +
            '&utm_medium=content-api' +
            '&app_context=content-api' +
            '&view_mode=embed&nochrome=true';
}

function createModalities(args){
    var delay = 1;
    args.sortedTypes.forEach(function(modalityType){
        var modalityObj = args.modalities[modalityType],
            delayTime = delay * 0.2 + 's',
            el;

        el = template.create(nodes.templates.modality, {
            title: createTitle(modalityType),
            type: modalityType,
            parent: nodes['modality-types']
        });
        el.setAttribute('data-modality-url', createURL(modalityObj) );
        el.addEventListener('click', modalityClick, false);
        el.style.animationDelay = delayTime;
        el.style.webkitAnimationDelay = delayTime;

        classie.add(el, 'fadeIn');
        classie.remove(el, 'hidden');

        delay++;
    });
}

function modalityClick(e){
    e.stopPropagation();
    message.sendModality.call(this);
}

function removeModalities () {
    while (nodes['modality-types'].firstChild) {
        nodes['modality-types'].removeChild(nodes['modality-types'].firstChild);
    }
}

function handler (data) {
    if (!data || !data.response || !data.response.modalities || data.response.message) { return false; }
    createModalities( modalities.parseData(data, widgetData) );
}

module.exports =  {
    create: handler,
    remove: removeModalities
};
