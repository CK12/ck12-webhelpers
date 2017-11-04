'use strict';

var classie = require('../utils/classie.js'),
    globals = require('../shared/global.js'),
    nodes   = require('../shared/dom.nodes');

var modalId           = 'ck12-modal',
    modalContentClass = 'ck12-md-content',
    modalCloseClass   = 'ck12-md-close',
    modalOverlayClass = 'ck12-md-overlay',
    showClass         = 'ck12-md-show',
    modalEl,
    modalContentEl,
    closeButton,
    overlay;


function modalExists () {
    return !!document.getElementById(modalId);
}

function containsModality(){
    return modalContentEl.lastChild && modalContentEl.lastChild.nodeName === 'IFRAME';
}

function shareModalNodes(){
    modalContentEl = modalEl.querySelector('.' + modalContentClass);

    nodes.modal = {
        el: modalEl,
        contentEl: modalContentEl,
        closeButton: closeButton,
        overlay: overlay
    };
}

/**
 * Creates the modal stylesheet
 * @return {} [description]
 */
function createStylesheet(){
    var stylesheet = document.createElement('link');
    stylesheet.type = 'text/css';
    stylesheet.href = globals.host + '/styles/modal.css';
    stylesheet.rel  = 'stylesheet';

    document.head.appendChild(stylesheet);
}

/**
 * Creates the modal that is appended to partners page
 * @return {undefined}
 */
function createModal() {
    var fragment = document.createDocumentFragment(),
        modal = fragment.appendChild(document.createElement('div')),
        overlay = fragment.appendChild(document.createElement('div'));

    modal.id        = modalId;
    modal.className = 'ck12-md-modal ck12-md-slideInFromBottom';
    modal.innerHTML = '<div class="' + modalContentClass + '">' +
                          '<button class="' + modalCloseClass + '">&times;</button>' +
                      '</div>';

    overlay.className = modalOverlayClass;
    document.body.appendChild(fragment);

    modalEl = document.getElementById(modalId);
}

/**
 * Bind closing of modal
 * @return {undefined}
 */
function bindEvents(){
    closeButton = modalEl.querySelector('.' + modalCloseClass);
    overlay     = document.querySelector('.' + modalOverlayClass);

    var close = function(){
        classie.removeClass(modalEl, showClass);
    };

    overlay.addEventListener('click', close);
    closeButton.addEventListener('click', close);
}

function triggerModal() {
    classie.addClass(modalEl, showClass);
}

function init(){
    createStylesheet();
    setTimeout(function () {
        // Give time for stylesheet to load to avoid modal showing prematurely
        createModal();
        bindEvents();
        shareModalNodes();
    }, 1000);
}

module.exports = {
    create: init,
    exist: modalExists,
    containsModality: containsModality,
    trigger: triggerModal
};