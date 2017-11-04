define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates',
    'common/utils/base64',
    'forums/services/forum.services'
], function($, _, Backbone, Mn, TMPL, Base64, ForumService){
    var Share = Mn.ItemView.extend({
        template: _.template(TMPL.ForumShare),
        events:{
            'click #share-forum-final': 'share',
            'keypress #recipient-email': 'removeErrorMessage'
        },
        initialize: function(){
            this.Base64 = Base64.newInstance('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=');
        },
        validateEmail: function(email){
            return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email);
        },
        removeErrorMessage: function(){
            var errorMessage = this.$el.find('.share-error-message');
            if(errorMessage.html().length > 0){
                errorMessage.html('');
            }
        },
        share: function(){
            var recipientEmailList = this.$el.find('#recipient-email').val() || this.$el.find('#mobile-recipient-email').val(),
                shareTitle = 'new discussion "'+ this.$el.find('.forum-link > a').first().text().trim() +'"',
                innerHTML = this.$el.find('#forum-message').html();

            var self = this;
            var HasInvalidEmail = recipientEmailList.split(',').some(function(email){
                return !self.validateEmail(email.trim());
            });

            if(HasInvalidEmail){
                this.$el.find('.share-error-message').html('Your recipient emails have an invalid format.');
                return;
            }
            var emailDataJSON = {
                'receivers': recipientEmailList,
                'subject': shareTitle,
                'body': innerHTML,
                // 'senderName' : senderName,
                // 'senderEmail': senderEmail,
                'purpose': 'share'
            };

            var encodedData = this.Base64.encode(JSON.stringify(emailDataJSON));
            this.$el.find('.cancel-btn').attr('style','display: none !important');
            this.$el.find('.spin-container').css('display','inline-block');
            this.$el.find('.share-button-center').css('width','174px');
            this.$el.find('#share-forum-final').prop('disabled', true);
            ForumService.share({data: encodedData}).done(function(data){
                self.$el.find('.cancel-btn').attr('style','display: inline-block');
                self.$el.find('.spin-container').css('display','none');
                self.$el.find('.share-button-center').css('width','284px');
                self.$el.find('#share-forum-final').prop('disabled', false);
                if(data.responseHeader.status === 0){
                    $('.before-share').addClass('fadeOut');
                    $('.after-share').addClass('fadeIn');
                    $('#forum-share').css({
                        'max-height':'345px',
                        'margin': '0'
                    });
                }else if(data.responseHeader.status === 2052){
                    self.$el.find('.share-error-message').html('Please enter recipient email addresses, separated by commas');
                    self.$el.find('#recipient-email').css('border-color', 'red');
                }else{
                    self.$el.find('.share-error-message').html(data.response.message);
                }
            }).fail(function(errorMessage){
                ModalView.alert(errorMessage);
            });
        },
    });
    return Share;
});
