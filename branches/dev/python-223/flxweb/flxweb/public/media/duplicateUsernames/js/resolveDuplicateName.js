define(['jquery', 'underscore', 'common/utils/utils', 'fn/foundation.min'], function($, _, util){
    var duplicateUsername = function(){};
    duplicateUsername.prototype.init = function(){
        var $container = $('#duplicateUsernameContainer'),
            $usernameChangeNotification = $container.find('.username-change'),
            $usernameLabelSmall = $container.find('.label-small'),
            $usernameExistNotification = $container.find('.username-exist'),
            $stage1 = $container.find('.stage-1'),
            $stage2 = $container.find('.stage-2'),
            $input = $container.find('.new-username'),
            $valideIcon = $container.find('.icon-validated'),
            $saveBtn = $container.find('.new-username-submit'),
            $proceedBtn = $container.find('.proceed'),
            enableBtn = false;
        $input.off('focus').on('focus', function(){
            $usernameChangeNotification.removeClass('hide');
            $usernameLabelSmall.addClass('left');
            $usernameLabelSmall.removeClass('error-username');
            $input.removeClass('error');
            if(!$usernameExistNotification.hasClass('hide')){
                $usernameExistNotification.addClass('hide');
            }
        });
        $input.off('blur').on('blur', function(){
            $usernameChangeNotification.addClass('hide');
            $usernameLabelSmall.removeClass('left');
        });
        var that = this;
        var keyDonwhander = _.debounce(function(){
            var newUsername = $input.val().trim();
            if(newUsername.length > 0){
                if(that.isInvalidUsername(newUsername)){
                    if(newUsername.trim().length < 3){
                        $usernameExistNotification.html('<span>Must be at least 3 characters.</span>');
                    }else if(newUsername.trim().length > 128){
                        $usernameExistNotification.html('<span>Must be less than 128 characters.</span>');
                    }else{
                        $usernameExistNotification.html('<span>Username is not valid. No special characters allowed.</span>');
                    }
                    $usernameExistNotification.removeClass('hide');
                    if(!$usernameLabelSmall.hasClass('error-username')){
                        $usernameLabelSmall.addClass('error-username');
                    }
                    if(!$usernameChangeNotification.hasClass('hide')){
                        $usernameChangeNotification.addClass('hide');
                    }
                    if(!$valideIcon.hasClass('hide')){
                        $valideIcon.addClass('hide');
                    }
                    if(!$input.hasClass('error')){
                        $input.addClass('error');
                    }
                    return;
                }
                util.ajax({
                    url: util.getApiUrl('auth/ajax/validate/member/login', true),
                    data: {
                        login:newUsername
                    },
                    'xhrFields': {
                        'withCredentials': true
                    },
                    dataType: 'JSON',
                    method: 'post'
                }).done(function(isValidUsername){
                    if(isValidUsername){
                        that.newUsername = newUsername;
                        enableBtn = true;
                        $valideIcon.removeClass('hide');
                        $saveBtn.removeClass('disabled');
                        $input.removeClass('error');
                        $usernameChangeNotification.removeClass('hide');
                        $usernameLabelSmall.removeClass('error-username');
                        if(!$usernameLabelSmall.hasClass('left')){
                            $usernameLabelSmall.addClass('left');
                        }
                        if(!$usernameExistNotification.hasClass('hide')){
                            $usernameExistNotification.addClass('hide');
                        }
                    }else{
                        $usernameExistNotification.html('<span>This username has already been taken.</span>');
                        $usernameExistNotification.removeClass('hide');
                        if(!$usernameLabelSmall.hasClass('error-username')){
                            $usernameLabelSmall.addClass('error-username');
                        }
                        if(!$usernameChangeNotification.hasClass('hide')){
                            $usernameChangeNotification.addClass('hide');
                        }
                        if(!$valideIcon.hasClass('hide')){
                            $valideIcon.addClass('hide');
                        }
                        if(!$input.hasClass('error')){
                            $input.addClass('error');
                        }
                    }
                });
            }else{
                $usernameChangeNotification.removeClass('hide');
                $usernameLabelSmall.addClass('left');
                $usernameLabelSmall.removeClass('error-username');
                if(!$usernameExistNotification.hasClass('hide')){
                    $usernameExistNotification.addClass('hide');
                }
            }
        },1000);
        $input.off('keydown').on('keydown', function(){
            if(enableBtn){
                enableBtn = false;
                $saveBtn.toggleClass('disabled');
            }
            keyDonwhander();
        });
        $proceedBtn.off('click').on('click', function(){
            $('.reveal-modal-bg').removeClass('active-duplicate-username');
            $('#duplicate-username').foundation('reveal', 'close');
        });

        $saveBtn.off('click').on('click', function(){
            if(!$saveBtn.hasClass('disabled')){
                $saveBtn.addClass('disabled');
                util.ajax({
                    url: util.getApiUrl('auth/update/member/'+ that.userId, true),
                    data: {
                        login: that.newUsername
                    },
                    'xhrFields': {
                        'withCredentials': true
                    },
                    dataType: 'JSON',
                    method: 'post'
                }).done(function(responseData){
                    if(responseData.responseHeader.status === 0){
                        $container.find('#duplicate-username').removeClass('yellow');
                        $stage1.addClass('hide');
                        $stage2.removeClass('hide');
                    }
                });
            }
        });

    };
    duplicateUsername.prototype.isInvalidUsername = function(username){
        return !(/^[\w]{3,128}$/gi).test(username.trim());
    };
    duplicateUsername.prototype.renderModal = function(){
        var that = this;
        $('body').append('<div id="duplicateUsernameContainer"></div>');
        $('#duplicateUsernameContainer').load('/media/duplicateUsernames/content.html', function(){
            that.init();
            $('#duplicate-username').foundation('reveal', 'open');
            $('.reveal-modal-bg').addClass('active-duplicate-username');
        });
    };
    duplicateUsername.prototype.resolve = function(){
        var that = this;
        util.ajax({
            url: util.getApiUrl('auth/get/info/my', true),
            dataType: 'JSON',
            'xhrFields': {
                'withCredentials': true
            }
        }).done(function(data){
            if(data.responseHeader.status === 0){
                if(data.response.hasLoginConflict){
                    that.userId = data.response.id;
                    that.renderModal();
                }
            }
        });
    };
    return new duplicateUsername();
});
