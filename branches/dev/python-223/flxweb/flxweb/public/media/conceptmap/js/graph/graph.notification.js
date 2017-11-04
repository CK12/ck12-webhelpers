define([
    'jquery'
], function($){

    var notficationClass = 'conceptmap-notification',
        fadeOutClass     = notficationClass + '--fade-out',
        promptClass      = notficationClass + '--prompt',
        actionClass      = notficationClass + '--action',
        $notification    = $('.' + notficationClass),
        $header          = $notification.find('.' + notficationClass + '__header'),
        $body            = $notification.find('.' + notficationClass + '__body'),
        $action          = $notification.find('.' + notficationClass + '__action'),
        $closeIcon       = $notification.find('.' + notficationClass + '__close'),
        $confirmButton   = $notification.find('.' + notficationClass + '__buttons__confirm'),
        $cancelButton    = $notification.find('.' + notficationClass + '__buttons__cancel');

    var NOTIFICATION_DURATION = 3000;
    var prevTimeout;

////////////
// States //
////////////

    function show($el) {
        $el.removeClass('hide');
    }

    function hide($el){
        $el.addClass('hide');
    }

    function showPrompt(){
        $notification.addClass(promptClass);
    }

    function hidePrompt(){
        $notification.removeClass(promptClass);
    }

    function isPrompt(){
        return $notification.hasClass(promptClass);
    }

    function fadeOut(){
        $notification.addClass(fadeOutClass);
    }

    function fadeIn(){
        $notification.removeClass(fadeOutClass);
    }

/////////////
// Content //
/////////////

    function setContent(args){
        handleHeader(args);
        handleBody(args);
        handlePromptContent(args);
        handleActionContent(args);
        handleCloseButton(args);
    }

    function handleHeader(args){
        if(args.header){
            $header.html(args.header);
            show( $header );
        } else {
            hide( $header );
        }
    }

    function handleBody(args){
        if(args.body){
            $body.html(args.body);
            show( $body );
        } else {
            hide( $body );
        }
    }

    function handlePromptContent(args){
        if(args.prompt){
            hide( $closeIcon );
            handlePrompt(args);
        } else {
            hidePrompt();
        }
    }

    function handleActionContent(args){
        if(args.action){
            handleAction(args);
        } else {
            $action.empty();
        }
    }

    function handleCloseButton(args){
        if(args.prompt){
            hide( $closeIcon );
        } else {
            show( $closeIcon );
        }
    }

//////////////
// Duration //
//////////////

    function stopPrevTimeout(timeout){
        if(timeout){ clearTimeout(timeout); }
    }

    function setDuration(args){
        var duration = args.duration || NOTIFICATION_DURATION;
        if(duration === Infinity){ return; }

        stopPrevTimeout(prevTimeout);
        prevTimeout = setTimeout(hideNotification, duration);
    }

////////////////////////
// Notification types //
////////////////////////

    function create(args){
        stopPrevTimeout(prevTimeout);
        setContent(args);
        setDuration(args);
        fadeIn();
    }

    function prompt(args){
        if(!args.callback){ throw 'No Callback for prompt provided.'; }
        args.prompt = true;
        args.duration = Infinity;
        create(args);
    }

    function action(args){
        if(!args.callback){ throw 'No Callback for action provided.'; }
        if(!args.element){ throw 'No element for action provided.'; }
        args.action = true;
        args.duration = Infinity;
        create(args);
    }

    function hideNotification(){
        $notification.trigger('notificationClose');
        fadeOut();
        rebindNotification();
    }

////////////
// Prompt //
////////////

    function promptConfirm(args){
        args.callback();
        promptUnload();
    }

    function promptCancel(args){
        if(args.cancelCallback){
            args.cancelCallback();
        }
        if(isPrompt()) { hideNotification(); }
        promptUnload();
    }

    function promptLoad(args){
        $notification.off('click');
        $confirmButton.one('click', function(){
            promptConfirm(args);
        });
        $cancelButton.one('click', function(){
            promptCancel(args);
        });
    }

    function promptUnload(){
        if(isPrompt()) { hideNotification(); }
        rebindNotification();
        $confirmButton.off('click');
        $cancelButton.off('click');
    }

    function handlePrompt(args){
        promptLoad(args);
        showPrompt();
    }

////////////
// Action //
////////////

    function actionCreate(args){
        args.$el = $action.append(args.element);
        actionEventBind(args);
        actionEventUnbind(args);
    }

    function actionEventBind(args){
        args.$el.one('click', function(e){
            e.preventDefault();
            args.callback();
        });
    }

    function actionEventUnbind(args){
        $notification.one('notificationClose', function(){
            args.$el.off('click');
        });
    }

    function handleAction(args){
        $action.empty();
        actionCreate(args);
    }

/////////////////
// Bind events //
/////////////////

    (function bindEvents() {
        $notification.on('click', hideNotification);
        $closeIcon.on('click', hideNotification);
    })();

    function rebindNotification(){
        $notification.off('click');
        setTimeout(function(){
            $notification.on('click', hideNotification);
        }, 100);
    }

/////////////
// Exports //
/////////////

    return {
        create: create,
        prompt: prompt,
        action: action,
        clear: hideNotification
    };
});