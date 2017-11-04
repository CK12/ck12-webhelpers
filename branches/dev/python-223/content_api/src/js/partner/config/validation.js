'use strict';

var difficulty = require('../../sharedGlobal/difficulty/level'),
    error      = require('../../sharedGlobal/utils/error');

function validateConfig(config){
    if (!config || typeof config !== 'object' || config.length ){ error.throw('Invalid config'); }

    if (!config.apiKey) {
        error.throw('No API Key');
    } else {
        if (typeof config.apiKey !== 'string'){ error.throw('Invalid API Key'); }
    }

    // if (!config.partnerId){
    //     error.throw('No Partner ID');
    // } else {
    //     if (typeof config.partnerId !== 'string'){ error.throw('Invalid Partner ID'); }
    // }

    if(config.difficultyLevel && Object.keys(difficulty).indexOf(config.difficultyLevel) === -1){
        error.throw('Invalid difficulty level');
    }

    // Remove after auto mode is done
    if(!config.conceptName){
        error.throw('A concept name is required.');
    }

    if (config.mode && config.mode === 'specified' && !config.conceptName){
        error.throw('Invalid config: In specified mode but no conceptName to search for');
    }

    if(config.format === 'json'){
        if(typeof config.callback !== 'function'){
            error.throw('A callback function is required when using JSON format');
        }
    }

    return true;
}

module.exports = {
    configuration: validateConfig
};
