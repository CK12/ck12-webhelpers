var _root    = __dirname + '/../',
    dist     = _root + 'dist',
    builds   = _root + 'builds',
    src      = _root + 'src',
    testDir  = _root + 'test',
    gulpDir  = _root + 'gulp',
    bowerDir = _root,
    npmDir   = _root;

module.exports = {
    root: {
        path: _root
    },
    builds: {
        path: builds
    },
    dist: {
        path: dist,
        js: dist + '/js/',
        images: dist + '/images/',
        styles: dist + '/styles/'
    },
    src: {
        path: src,
        js: src + '/js/',
        images: src + '/images/',
        styles: src + '/styles/'
    },
    test: {
        path: testDir
    },
    gulp: {
        path: gulpDir
    },
    bower: {
        path: bowerDir
    },
    npm: {
        path: npmDir
    }
};