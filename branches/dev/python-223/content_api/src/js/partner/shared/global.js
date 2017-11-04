var nodes = require('./dom.nodes.js');

module.exports = {
    host: nodes.partnerScript.src.split('/js')[0],
    data: {
        ck12: true,
        sourceUrl: location.origin + location.pathname
    },
    widgets: []
};