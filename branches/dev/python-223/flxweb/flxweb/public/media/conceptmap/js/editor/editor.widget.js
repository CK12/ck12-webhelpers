define([
    'require',
    'exports',
    'jquery',
    'conceptmap/user/user',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.helpers',
    'conceptmap/editor/editor.elements',
    'conceptmap/editor/editor.state.manager',
    'conceptmap/editor/editor.session.manager',
    'common/views/login.popup.view',
    'conceptmap/editor/editor.modal'
], function(require, exports,  $, User, config, helpers, editorElements, editorStateManager, editorSessionManager, loginPopup, editorModal){
    'use strict';

    var $widget  = editorElements.$widget,
        $slides  = $widget.find('.slide');

    var $slide1       = $slides.eq(0),
        $slide1Button = $slide1.find('button.turquoise'),

        $slide2       = $slides.eq(1),
        $slide2Button = $slide2.find('button.tangerine'),

        $slide3       = $slides.eq(2),
        form          = $slide3.find('form')[0],
        $textarea     = $slide3.find('textarea'),
        $slide3Close  = $slide3.find('i.conceptmap__close-button'),

        $slide4       = $slides.eq(3),
        $slide4Close  = $slide4.find('i.icon-close2');

    var activeClass   = 'is-active',
        expandedClass = 'is-expanded';

///////////
// State //
///////////

    $slide2Button.parent().on('editorIsDirty', enable);
    $slide2Button.parent().on('editorIsClean', disable);

    function broadcast(type){
        var evt = new CustomEvent(type);
        $slide2Button.parent()[0].dispatchEvent(evt);
    }

    var sessionIsDirty;

    function enable(e){
        if(e.type === 'editorIsDirty'){
            sessionIsDirty = true;
        }

        $slide2Button
            .attr('disabled', null);
    }

    function disable(e){
        if(e.type === 'editorIsClean'){
            sessionIsDirty = false;
        }

        if(!sessionIsDirty){
            $slide2Button
                .attr('disabled', 'disabled');
        }
    }

    function disableEditor(){
        $slide1Button
            .attr('disabled', 'disabled');
    }

    function enableEditor(){
        $slide1Button
            .attr('disabled', null);
    }

/////////////
// Display //
/////////////

    function show(){
        $widget.removeClass('hide');
    }

    function hide(){
        $widget.addClass('hide');
    }

////////////
// Slides //
////////////

    function slideHandler(slide) {
        if(slide === 1){
            require('conceptmap/editor/editor.initializer').init();
            return checkIfSeenTutorialSlide();

        } else if (slide === 2){
            if( !User.get().isLoggedIn() ){
                $slide3.addClass('is--anon');
            }
            setSlide(slide);
            editorElements.$widget.css('z-index', 51);
            return helpers.showOverlay();
        }
        setSlide(slide);
    }

    function setSlide(slide) {
        $slides.removeClass(activeClass);
        $slides.eq(slide).addClass(activeClass);
        helpers.hideOverlay();
        editorElements.$widget.css('z-index', null);
    }

    var changeSlide = helpers.debounce(function changeSlide(){
        var slide = +$(this).attr('data-slide');
        slide = slide === $slides.length ? 1 : slide;
        slideHandler(slide);
    }, 500);

//////////////
// Bindings //
//////////////

    $slides.find('button:not([type=submit], .anon-button)').on('click', changeSlide);

    form.addEventListener('submit', function(e){
        e.preventDefault();

        syncData();

        onCancel();
        setSlide(3);
    });

    $slides.first().find('.slide-1__top-row').on('click', function firstSlideArrowToggle(){
        $slides.first().toggleClass(expandedClass);
    });

    $slide3Close.on('click', function(){
        setSlide(1);
    });

    $slide4Close.on('click', function(){
        setSlide(0);
    });


    ///////////////////
    // Cancel / Exit //
    ///////////////////

    $('#cancelEditor').on('click', function cancelEditor(e){
        e.preventDefault();
        if(sessionIsDirty){
            editorModal.confirm(
                onCancel,
                'You have not submitted your edit yet. <br>Do you want to leave without submitting?'
            );
        } else {
            onCancel();
        }
    });

    function onCancel(){
        require('conceptmap/editor/editor.initializer').exit(function(){
            // After exit perform cleanup
            form.reset();
            sessionIsDirty = false;
            editorSessionManager.clear();
            $slide2Button.attr('disabled', 'disabled');
        });

        setSlide(0);
    }

    ////////////////////
    // Login Handlers //
    ////////////////////

    function showLogin(){
        var returnTo = getReturnURL();

        saveLocally();

        $('.js-sign-in').attr('data-return', returnTo);
        loginPopup.showLoginDialogue({
            returnTo: returnTo
        });
    }

    function saveLocally(){
        var group  = helpers.getCurrentGroup(helpers.getData('editor'));
        editorStateManager.saveLocally(group, {persist: true});
    }

    function getReturnURL(){
        var comments = getComments(),
            search   = '';

        if(comments){
            comments = '&comments=' + comments;
        }

        if(/view=\w[^&]*/.test(location.search)){
            search = '&' + location.search.match(/view=\w[^&]*/);
        }

        return encodeURIComponent(
            location.origin + location.pathname + '?editor=true&eid=' + helpers.getCurrentNucleus(helpers.getData('editor')).EID + comments + '&autosave=true' + search
        );
    }

    $('#sign-in-to-submit').on('click', showLogin);
    $('#join-to-submit').on('click', function(){
        saveLocally();
        location.href = '/auth/signup/student?requestor=' + encodeURIComponent(location.href) + '&returnTo=' + getReturnURL();
    });

    function syncData(args){
        var group = helpers.getCurrentGroup(helpers.getData('editor'));
        editorStateManager.save(group, args);
    }


////////////////////
// Tutorial Slide //
////////////////////

    function showTutorialSlide(e){
        if(e instanceof Event){ e.preventDefault(); }
        setSlide(1);

        if(!$.cookie('seenConceptmapEditorTutorial') ){
            $.cookie('seenConceptmapEditorTutorial', true, { expires: 30, path: '/' });
        }

        $('.conceptmap-nav__middle__editor-suggest').find('.icon-help_icon').trigger('click');
    }

    function checkIfSeenTutorialSlide() {
        if($.cookie('seenConceptmapEditorTutorial')){ return setSlide(1); }

        $.when(User.get()).done(function(user){
            // If not logged in
            if(user.userInfoDetail.message){
                return showTutorialSlide();
            }

            // Check for app data
            user.getAppData('conceptmap')
                .done(function(res){
                    res = res.response;

                    // If no app data present, set it
                    if(!res.message && (res.userdata && !res.userdata.seenEditorTutorial) ){
                        user.setAppData('conceptmap', helpers.extend(
                            res.userdata,
                            {
                                seenEditorTutorial: true
                            }
                        ));
                        showTutorialSlide();
                    } else {
                        setSlide(1);
                    }
                }).fail(showTutorialSlide);

        }).fail(showTutorialSlide);

    }

/////////////////////////
// Expansion Highlight //
/////////////////////////

    // Expand Widget on element clicks in order to bring attention to the editor
    var openEditorWidget = (function(){
        var counter      = 0,
            svgElements  = ['text', 'circle'];

        return function onClick(e){
            var isGraph = !helpers.isZeroState() && !helpers.isEditorState();

            if(isGraph && svgElements.indexOf(e.target.tagName) > -1){
                if(++counter === 3){
                    $('body').off('click.openEditorWidget');
                    $slides.first().addClass(expandedClass);
                }
            }
        };
    })();

    $('body').on('click.openEditorWidget', openEditorWidget);

//////////
// Misc //
//////////

    function getComments() {
        return $textarea.val();
    }

    function setComments(){
        if(config.urlParams.comments){
            $textarea.val(decodeURIComponent(config.urlParams.comments));
            delete config.urlParams.comments;
        }
    }

    function autosave(){
        if(config.urlParams.autosave){
            syncData({persist: true});
            delete config.urlParams.autosave;

            // Unbind current thanks slide closing and allow it to go back to
            // the editor submit slide instead
            $slide4Close.off('click').one('click', function(){
                setSlide(1);
                // Rebind to default functionality
                $slide4Close.on('click', function(){ setSlide(0); });
            });

            // Set to thanks for the feedback slide
            setSlide(3);
        }
    }

/////////////
// Exports //
/////////////

    exports.show = show;
    exports.hide = hide;
    exports.broadcast = broadcast;

    exports.disableEditor = disableEditor;
    exports.enableEditor = enableEditor;

    exports.getComments = getComments;
    exports.setComments = setComments;
    exports.autosave = autosave;
    exports.setSlide = setSlide;
});