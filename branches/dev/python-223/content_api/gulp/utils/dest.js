var config = require('../config');

function getVersion(){
    return process.env.contentApiVersion;
}

function isBuild(){
    return !!getVersion();
}

function getDest(type) {
    var dest;

    if( isBuild() ){
        dest = config.builds.path + '/' + getVersion() + '/';
        if(type){ dest += type + '/';}
    } else {
        dest = type ? config.dist[type] : config.dist.path + '/';
    }

    return dest;
}


module.exports = {
    isBuild: isBuild,
    get: getDest
};