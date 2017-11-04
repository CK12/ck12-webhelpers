(function($){
    /**@param {object}
    * options = {
    *      planeContainerId: ,
    *      shareData: {
    *          shareImage': Image of the Resource to be shared,
    shareUrl': Url of the resource ,
    shareTitle': Title of the resource,
    context': Share context such as 'Share Subjects','Share Modality', etc
    payload': {
    'memberID': ,
    'page': name of the page
},
'userSignedIn': window.ck12_signed_in || false,
*      },
*      shareCloseCallback:
*
*
* }**/

    'use strict';

    var shareplaneTemplate = '<div class="share-plane-div js-share-plane"><div class="plane_image"></div></div>',
        initOptions,
        shareEmailView,
        hostPath,
        shareModalPath;
    function addSharePlane(){
        $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: hostPath + '/media/common/css/shareplane.css'
        }).appendTo('head');
        if(!initOptions.shareTrigger) {
            $('#' + initOptions.planeContainerId).append(shareplaneTemplate);
        }
    }

    function initTransition($this, noPlane, noAnimation) {
        if(noPlane || noAnimation){
            shareEmailView.open(initOptions.shareData);
        } else {
            if(initOptions.sharePosition === 'bottom-left') {
                initOptions.floatPostion = 'left';
            } else {
                initOptions.floatPostion = 'right';
            }
            var rightOffset;
            if($this.hasClass('absolute')) {
                rightOffset = window.innerWidth/2 - (window.innerWidth - ($this.width() + $this.offset().left));
            } else {
                rightOffset = window.innerWidth/2;
            }
            initOptions.rightPos = $this.css(initOptions.floatPostion);
            initOptions.bottomPos = $this.css('bottom');
            $this.addClass('flying').css('bottom', window.innerHeight/2);
            $this.css(initOptions['floatPostion'], rightOffset);
        }
    }

    function bindEvents() {
        var $shareTrigger,
            $sharePlane = $('.share-plane-div'),
            noPlane = false,
            noAnimation =  initOptions.hasOwnProperty('enableAnimations') ? !initOptions.enableAnimations : false;
        $sharePlane.addClass(initOptions.sharePosition);
        if(initOptions.shareTrigger) {
            $shareTrigger = $(initOptions.shareTrigger);
            noPlane = true;
        } else {
            $shareTrigger = $('.share-plane-div');
        }
        $shareTrigger.off('click.share').on('click.share', function(e) {
            if(shareEmailView){
                initTransition($(e.currentTarget), noPlane, noAnimation);
            } else {
                require([shareModalPath], function(shareView){
                    shareEmailView = shareView;
                    initTransition($(e.currentTarget), noPlane, noAnimation);
                });
            }
        });
        $sharePlane.off('transitionend.share').on('transitionend.share', function(e) {
            if($sharePlane && $sharePlane.hasClass('flying')) {
                if(e.originalEvent.propertyName === 'bottom' || e.originalEvent.propertyName === 'right') {
                    var $this = $(this);
                    $this.addClass('hide-plane');
                    if(initOptions.shareData.payload && initOptions.shareData.payload.page == 'browse concepts')
                    {
                        initOptions.shareData.shareUrl = window.location.href;
                        if(initOptions.shareData.shareUrl.indexOf('view_books') !== -1)
                        {
                            initOptions.shareData.context = 'Share Books';
                            initOptions.shareData.shareTitle = 'Books';
                        }
                        else if(initOptions.shareData.shareUrl.indexOf('view_concepts') !== -1)
                        {
                            initOptions.shareData.context = 'Share Concepts';
                            initOptions.shareData.shareTitle = 'Concepts';
                        }
                    }
                    shareEmailView.open(initOptions.shareData);
                    $sharePlane.css('bottom', initOptions.bottomPos);
                    $sharePlane.css(initOptions['floatPostion'], initOptions.rightPos);
                    if(window.innerWidth < 768) {
                        window.scrollTo(0, 0);
                    }
                    $sharePlane.removeClass('flying');
                }
            }
        });

        document.addEventListener('shareClose', function () {
            if($sharePlane && !$sharePlane.parent().hasClass('hide')) {
                $sharePlane.removeClass('hide-plane');
                if(initOptions.shareCloseCallback) {
                    initOptions.shareCloseCallback();
                }
            }
        }, false);
    }

    window.loadSharePlane = function(options) {
        window.shareRootPath = window.shareRootPath || '';
        shareModalPath = options.shareData._ck12 ? 'common/views/share.via.email.view' : window.shareRootPath + '/media/common/js/views/share.via.email.view.js';
        hostPath = options.shareData._ck12 ? '' : window.shareRootPath;
        initOptions = options;
        addSharePlane();
        bindEvents();
    };
})(window.jQuery);
