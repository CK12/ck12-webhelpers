module.exports = {
    production: {
        modality: {
            src: '//www.ck12.org'
        },
        api: {
            eid: '//qaapi.ck12.org/2.0/dexter/detect/eids',
            recommendation: '//gamma.ck12.org/tyk_api/get/recommendations'
        }
    },
    development: {
        modality: {
            src: '//gamma.ck12.org'
        },
        api: {
            eid: '//chaplin.ck12.org/dexter/detect/eids',
            recommendation: '//gamma.ck12.org/flx/get/recommendations'
        }
    }
};
