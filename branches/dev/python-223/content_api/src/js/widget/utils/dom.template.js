'use strict';

function getTemplate(templateNode) {
    var clone = templateNode.content.cloneNode(true);
    return clone.children[0].outerHTML;
}

function createTemplate(templateNode, dataSet) {
    var template = getTemplate(templateNode);

    for (var key in dataSet){
        if(dataSet.hasOwnProperty(key) && key !== 'parent'){
            template = template.replace(replacePlaceholder(key), dataSet[key]);
        }
    }

    if (dataSet.parent){
        dataSet.parent.insertAdjacentHTML('beforeend', template);
        template = dataSet.parent.lastChild;
    }

    return template;
}

function replacePlaceholder(value){
    return new RegExp('{{\s*[' + value + ']+\s*}}', 'g');
}

module.exports = {
    create: createTemplate
};
