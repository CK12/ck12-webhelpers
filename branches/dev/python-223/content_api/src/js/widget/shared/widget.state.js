'use strict';

var classie    = require('classie'),
    nodes      = require('../shared/dom.nodes'),
    message    = require('../shared/message'),
    widgetData = require('../shared/widget.data');

function restartRequest(e) {
    e.preventDefault();
    classie.add(nodes.error, 'hidden');
    classie.add(nodes.modalityTitle, 'hidden');
    classie.remove(nodes.loader, 'hidden');

    message.sendResize();

    // Avoid circular dependency
    if(widgetData.userConfig.conceptName) {
        require('../api/recommendationWrapper').get();
    } else {
        require('../api/eidWrapper').post();
    }

}

function showError(){
    classie.add(nodes.content, 'hidden');
    classie.remove(nodes.error, 'hidden');
    classie.add(nodes.loader, 'hidden');

    message.sendResize();

    nodes.retry.removeEventListener('click', restartRequest);
    nodes.retry.addEventListener('click', restartRequest);
}

function setText(node, text){
    if(node.firstChild && node.firstChild.nodeType === 3) {
        node.firstChild.nodeValue = text;
    } else {
        node.innerText = text;
    }
}

function showRetry() {
    showError();
    setText(nodes.error, 'An error occured. ');
    setText(nodes.retry, 'Retry?');
}

function noRecommendations(){
    showError();
    setText(nodes.modalityTitle, 'No results found :(');
    setText(nodes.error, 'Would you like to ');
    setText(nodes.retry, 'try again?');
}

function createTitle(name){
    var currentTitle = nodes.modalityTitle.innerText;

    if(currentTitle !== name){
        setText(nodes.modalityTitle, name);
    }

    classie.add(nodes.modalityTitle, 'fadeIn');
    classie.remove(nodes.modalityTitle, 'hidden');
    message.sendResize();
}

module.exports = {
    retry: showRetry,
    createTitle: createTitle,
    noResults: noRecommendations
};