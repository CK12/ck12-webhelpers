'use strict';

var configuration = require('./config/config'),
    validate      = require('./config/validation'),
    loader        = require('./script/loader'),
    modal         = require('./modal/modal'),
    widget        = require('./widget/iframe');

function init(userConfig) {
    var config;

    if( validate.configuration(userConfig) ){
        config = configuration.extend(userConfig);

        if(userConfig.format === 'json') {
            if ( !loader.hasJSONScript() ) { return loader.createJSONScript(config); }
            window.ck12.content.json(config);
        } else {
            if ( !modal.exist() ) { modal.create(); }
            widget.create(config);
        }
    }
}

window.ck12 = {
    content: {
        modalities: init
    }
};
