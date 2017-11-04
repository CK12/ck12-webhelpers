define('__main', [
    'jquery',
    'common/controllers/navigation',
    'common/views/login.popup.view',
    'common/utils/utils',
    'softRegistration/index',
    'aes',
    'common/utils/url',
    'cache/cache_ajax',
    'cache/ajax_prefilter',
    'cache/ajax_complete',
    'fn/vendor/custom.modernizr',
    'fn/foundation.min',
    'fn/foundation/foundation.dropdown',
    'fn/foundation/foundation.topbar',
    'fn/foundation/foundation.magellan'
], function ($, navigation, signin, Utils, SoftRegistration) {
    'use strict';
    // This is a common main that loads all the common dependencies needed on all pages


    //make sure the cookies are supported
    if (!window.navigator.cookieEnabled && window.location.pathname.indexOf('nocookies') === -1) {
        window.location.href = '/nocookies';
    }

    function initLogin() {
        signin.showLoginDialogue({
            'returnTo': ($('.js-sign-in').attr('data-return') || '')
        });
    }

    // initialize foundation framework and any its plugins
    $(document).foundation();
    // initialize the search bar component
    navigation.init();

    // init signin
    $('.js-sign-in').off('click.sign-in').on('click.sign-in', function () {
        if ($('body').hasClass('side-bar-active')) {
            $('#side-reveal-icon').trigger('click');
            window.setTimeout(initLogin, 500);
        } else {
            initLogin();
        }
    });

    //Soft Registration watcher
     SoftRegistration.initialize();

     //
     SoftRegistration.triggerSoftRegistration();

    $('footer').show();

    // Dispatch a global event so 3rd party code (e.g. optimizely) can bind to it.
    var evt = document.createEvent('Event');
    evt.initEvent('mainReady', true, false);
    document.dispatchEvent(evt);

    // Get the optimizely state and set it to all dexter events for this page
    var optimizelyState = Utils.deepLookup('optimizely.data.state.variationNamesMap',window);
    if (optimizelyState){
        window.dexterjs.set( 'config',{mixins: {optimizelyState: Utils.optimizelyStateToDexterString(optimizelyState)}});
    }

});

define('main', ['require.config'], function () {
    'use strict';
    require(['__main']);
});
