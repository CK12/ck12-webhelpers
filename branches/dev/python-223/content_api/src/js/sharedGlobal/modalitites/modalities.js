'use strict';

var typeGroups    = require('./types'),
    groupsDefault = require('./groups.default'),
    sort          = require('../utils/sort');

function getModalityGroup(name){
    for (var group in typeGroups) {
        if(typeGroups.hasOwnProperty(group)){
            if(typeGroups[group].indexOf(name) > -1){ return group; }
        }
    }
}

function getModalityTypes(mainData) {
    var modalityGroups,
        modalityTypes;

    if(mainData.userConfig.modalityTypes){
        modalityGroups = mainData.userConfig.modalityTypes;
    } else {
        modalityGroups = groupsDefault;
    }

    modalityTypes = convertModalityGroupsToSubTypes(modalityGroups);
    return modalityTypes;
}

function convertModalityGroupsToSubTypes(modalityGroups){
    var modalityTypes = '';

    modalityGroups = convertStringToArray(modalityGroups);

    for (var group in typeGroups){
        if( typeGroups.hasOwnProperty(group) ){
            if(modalityGroups.indexOf(group) > -1) {
                modalityTypes += typeGroups[group].join(',') + ',';
            }
        }
    }
    // Take off trailing comma
    return modalityTypes.substr(0, modalityTypes.length - 1);
}

function convertStringToArray (string) {
    if(typeof string !== 'string'){ return string; }

    string = string.replace(/\s/g, '');
    string = string.split(',');
    return string;
}


function parseData(data, mainData){
    var modalities = {},
        modalityGroup;

    data.response.modalities.forEach(function(modality){
        modalityGroup = getModalityGroup(modality.artifactType);

        // Don't allow same modality types to be added (i.e. two 'read' type)
        if(modalities.hasOwnProperty(modalityGroup)){ return; }

        modalities[ modalityGroup ] = {
            handle: modality.handle,
            mtype: modality.artifactType,
            branch: modality.domain.branchInfo.handle,
            context: modality.domain.handle
        };
    });

    return {
        modalities: modalities,
        sortedTypes: sortModalities(modalities, mainData)
    };
}

function sortModalities(modalities, mainData){
    var keys = Object.keys(modalities),
        order = mainData.userConfig.modalityTypes ? convertStringToArray(mainData.userConfig.modalityTypes) : groupsDefault,
        modalityOrder = sort.byOrder(keys, order),
        maxModalities;

    if (mainData.userConfig.maxModalities && mainData.userConfig.maxModalities <= 5){
        maxModalities = mainData.userConfig.maxModalities;
        modalityOrder.splice(maxModalities, modalityOrder.length);
    }

    // Until we use more modalities, ensure only groupsDefaults items are being used.
    modalityOrder = modalityOrder.filter(function(item){
        return groupsDefault.indexOf(item) > -1;
    });

    return modalityOrder;
}

module.exports = {
    parseData: parseData,
    getTypes: getModalityTypes
};