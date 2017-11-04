/**
 * Copyright 2007-2011 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Chetan Padhye
 *
 * $id$
 */
define('flxweb.reviews', ['backbone', 'jquery', 'common/utils/date', 'common/views/modal.view', 'jquery-ui', 'flxweb.global', 'jquery.scrollTo'],

    function(Backbone, $, date, ModalView) {
        'use strict';

        var reviewsCollection, reviewsSummary, feedbackModel;

        function showLoading(ele) {
            $(ele).parents('.feedbackbtn').find('.wait_js').html('<img class="x-ck12-img-nopopup" src="/media/images/icon_loading.gif">');
        }

        function hideLoading(ele) {
            $(ele).parents('.feedbackbtn').find('.wait_js').html('');
        }

        var ReviewsModule = {};
        /**
         * Review model contains the review that contains comments
         */
        ReviewsModule.Review = Backbone.Model.extend({
            idAttribute: 'memberID',
            initialize: function(options) {
                this.artifactID = options.artifactID;
                this.memberID = options.memberID;
            },
            url: function() {
                return '/json/reviews/my/' + this.artifactID + '/';
            },
            defaults: {
                'score': null,
                'comments': '',
                'dislike': 0,
                'like': 0
            },
        });

        /**
         * Reply model contains the reply for review
         */
        ReviewsModule.Reply = Backbone.Model.extend({});

        /**
         * Summary of the artifact Review.
         * This contains the counts of votes (likes vs dislikes)
         * and counts of ratings (star ratings)
         * Edit Review Button and  'Most Helpful Reviews:' Text
         */
        ReviewsModule.ReviewsSummary = Backbone.Model.extend({
            url: function() {
                return '/json/reviews/summary/' + this.artifactID + '/';
            },
            initialize: function(options) {
                this.artifactID = options.artifactID;
                this.on('change', this.onChange);
            },
            onChange: function() {
                var total = 0,
                    percentage = 0,
                    dislikes, likes;
                dislikes = this.get('dislike') || 0;
                likes = this.get('like') || 0;
                total = dislikes + likes;
                percentage = (likes * 100) / total;
                percentage = Math.round(percentage);
                this.set({
                    total: total,
                    percentage: percentage
                }, {
                    silent: true
                });
            },
            defaults: {
                'score': null,
                'reviewsCount': 0,
                'dislike': 0,
                'like': 0,
                'reviewsRemaining' : 0
            }
        });

        /**
         * Returns the current user's review for the specified
         * artifactID.
         */
        ReviewsModule.MyReview = Backbone.Model.extend({
            idAttribute: 'memberID',
            url: function() {
                return '/json/reviews/my/' + this.artifactID + '/';
            },
            defaults: {
                'score': null,
                'comments': '',
                'dislike': 0,
                'like': 0
            },
            initialize: function(options) {
                this.artifactID = options.artifactID;
            }
        });
        /**
         * Reviews usability count
         *
         */
        ReviewsModule.ReviewsUsability = Backbone.Model.extend({
            url: function() {
                return '/json/reviews/feedback_usability/';
            },
            initialize: function(options) {
                this.artifactID = options.artifactID;
            }
        });

        /**
         * Contains the reply for the specified review to add in collection.
         *
         */
        ReviewsModule.ReviewReply = Backbone.Model.extend({
            url: function() {
                return '/json/reviews/reply/';

            },
            defaults: {
                'score': null,
                'reviewComment': '',
                'reviewersMemberID': '',
                'memberID': '',
                'artifactID': ''
            },
            initialize: function(options) {
                this.artifactID = options.artifactID;
            }
        });

        /**
         * Model used for the reply for the specified review to add, edit and delete actions.
         *
         */
        ReviewsModule.ReviewUpdateReply = Backbone.Model.extend({
            idAttribute: 'reviewID',
            url: function() {
                return '/json/reviews/updatereply/' + this.id + '/' + this.reviewersMemberID;
            },
            defaults: {
                'reviewComment': '',
                'reviewID': '',
                'reviewersMemberID': ''
            },
            initialize: function(options) {
                this.reviewID = options.reviewID;
                this.reviewComment = options.reviewComment;
                this.reviewersMemberID = options.reviewersMemberID;
            }
        });

		/**
         * Review abuse model contains the artifactID and memberID for abuse report
         */
        ReviewsModule.ReviewAbuseModel = Backbone.Model.extend({
            idAttribute: 'memberID',
            initialize: function(options) {
                this.artifactID = options.artifactID;
                this.memberID = options.memberID;
            },
            url: function() {
                return '/flx/create/feedback/abuse/' + this.artifactID + '/'+ this.memberID;
            },
        });

        /**
         * Reply abuse model contains the artifactID and reviewID for abuse report
         */
        ReviewsModule.ReplyAbuseModel = Backbone.Model.extend({
            idAttribute: 'reviewID',
            initialize: function(options) {
                this.reviewID = options.reviewID;
            },
            url: function() {
                return '/flx/create/feedbackreview/abuse/' + this.reviewID;
            },
        });

        /**
         * Collection of reviews shown in the reviews listing
         */
        ReviewsModule.ReviewsCollection = Backbone.Collection.extend({
            url: function() {
                return '/flx/get/feedback/comments/' + this.artifactID + '?pageNum=' + this.pageNum + '&pageSize=5';
            },
            model: ReviewsModule.Review,
            initialize: function(models, options) {
                this.artifactID = options.artifactID;
                this.pageNum = options.pageNum > 1 ? options.pageNum : 1;
            },
            parse: function(response) {
                if(response.response.result){
                    response.response.result.forEach(function(review){
                        var name = review.memberName.split(/\s+/);
                        if(name.length  === 1){
                            review.memberName = name[0];
                        }else if(name.length > 1){
                            review.memberName  = name[0] + ' ' + name[1][0].toUpperCase() + '.';
                        }
                    });
                }

                return response.response.result;
            }
        });

        /**
         * Collection of reply shown for each review
         */
        ReviewsModule.ReplyCollection = Backbone.Collection.extend({
            url: function() {
                return '/json/reviews/reply/' + this.artifactID + '/' + this.memberID + '/';

            },
            model: ReviewsModule.Reply,
            initialize: function(models, options) {
                this.artifactID = options.artifactID;
                this.memberID = options.memberID;

            },
            parse: function(response) {
                if(response.replies){
                    response.replies.forEach(function(review){
                        var name = review.reviewersMemberName.split(/\s+/);
                        if(name.length  === 1){
                            review.reviewersMemberName = name[0];
                        }else if(name.length > 1){
                            review.reviewersMemberName  = name[0] + ' ' +  name[1][0].toUpperCase() + '.';
                        }
                    });
                }
                return response.replies;
            }

        });

        /**
        * View for report abuse
        */
        ReviewsModule.ReviewAbuseView = Backbone.View.extend({
        	tagName : 'span',
        	events: {
        		'click .flag-link' : 'reportAbuseConfirm',
        		'click .flag-comment-options' : 'onContainerClick',
        	},

            render: function() {
                var template = _.template($('#commentInappropriateTemplate').html());
                this.setElement(template(this.model.toJSON()), true);
                return this;
            },

            reportAbuseConfirm: function(){
            	var modal = ModalView.confirm(this.reportAbuse, 'Are you sure you want to report this comment as abused?', 'Report Abused', this.model);
            	modal.$el.find('.button.turquoise.modal-uikit-cancel').addClass('dusty-grey').focus();
            	modal.$el.find('.button.turquoise').addClass("confirmButtons");
            },

            reportAbuse: function(model){
                var eventSrc = model.get('source');
                model.unset('source');
            	showLoading($(eventSrc));
            	model.save(null, {
                    success: function(model) {
                            hideLoading($(eventSrc));
                            $(eventSrc).remove();
                    }
                });
            },
            onContainerClick: function(e){
            	e.stopPropagation();
            	e.preventDefault();
            }

        });

        /**
         * View for each review from the reviews list
         * Each review will contain reply collection
         */
        ReviewsModule.ReviewView = Backbone.View.extend({
            events: {
                'click .listreply': 'listReply',
                'click .addreply': 'addreply',
                'click .cancelreply_js': 'cancelreply',
                'click .postreply_js': 'postreply',
                'click .editreply_js': 'editreply',
                'click .deletereply_js': 'deletereply',
                'click .updatereply_js': 'updatereply',
                'click .canceleditreply': 'canceleditreply',
                'click .helpfulyes': 'updatehelpful',
                'click .helpfulno': 'updatehelpful',
                'click .js_feedbackbtn_remove' : 'removeFeedback',
                'click .remove_feedback_confirm' : 'confirmAction',
                'click .report_abuse' : 'abuseReportAction'
            },
            render: function() {
                try {
                    this.model.set('creationTime', date.getTimeInUserTimeZone(this.model.get('creationTime')));
                    var template = _.template($('#reviewTemplate').html());
                    this.model.set({'isArtifactOwner': (window.artifact_json || window.js_modality_data.artifact).creatorID == window.ads_userid});
                    this.model.set({'isAdminUser' : window.flxweb_role == 'admin'});
                    this.model.set({'isReviewer' : this.model.memberID == window.ads_userid});
                    this.setElement(template(this.model.toJSON()), true);
                    return this;
                } catch (e) {
                    console.log(e);
                }
            },
            initialize: function() {
                this.artifactID = this.model.get('artifactID');

            },
            updatehelpful: function(e) {
                if (!$.flxweb.isUserSignedIn()) {
                    $.flxweb.alertToSignin();
                    return false;
                }

                if ($(e.currentTarget).parents('.reply_action').hasClass('disabled')) {
                    return false;
                }
                $(e.currentTarget).parents('.reply_action').addClass('disabled');

                var usable = true;
                var ct = $(e.currentTarget);
                if ($(e.currentTarget).hasClass('helpfulno')) {
                    usable = false;
                }
                var feedback_usability = new ReviewsModule.ReviewsUsability({});
                feedback_usability.set({
                    'artifactID': this.model.get('artifactID'),
                    'memberID': this.model.get('memberID'),
                    'isHelpful': usable
                }, {
                    'silent': true
                });

                feedback_usability.save(null, {
                    success: function(model, response) {
                        var helpfulyesele = $(ct).parents('.reply_action').find('.helpfulyes');
                        var helpfulnoele = $(ct).parents('.reply_action').find('.helpfulno');
                        var helpfulyes = $(helpfulyesele).data('helpfulyes');
                        var helpfulno = $(helpfulnoele).data('helpfulno');
                        if (response.is_updated === true) {
                            if (response.is_value_changed === true) {
                                if (usable === true) {
                                    helpfulyes = helpfulyes + 1;
                                    helpfulno = helpfulno > 0 ? helpfulno - 1 : 0;
                                } else {
                                    helpfulyes = helpfulyes > 0 ? helpfulyes - 1 : 0;
                                    helpfulno = helpfulno + 1;
                                }
                            }
                        } else {
                            if (usable === true) {
                                helpfulyes = helpfulyes + 1;
                            } else {
                                helpfulno = helpfulno + 1;
                            }
                        }
                        $(helpfulyesele).data('helpfulyes', helpfulyes);
                        $(helpfulnoele).data('helpfulno', helpfulno);
                        $(helpfulyesele).html(' Yes ( ' + helpfulyes + ' )');
                        $(helpfulnoele).html(' No ( ' + helpfulno + ' )');
                        $(ct).parents('.reply_action').removeClass('disabled');
                    },
                    error: function() {
                        $(ct).parents('.reply_action').removeClass('disabled');
                    }
                });
            },
            confirmAction: function(e){
            	e.stopPropagation();
                var $this = $(e.currentTarget),
                    type = $(e.currentTarget).hasClass('js_feedback')? 'feedback' : 'reply',
                    callback = this.deletereply;
                if (type == 'feedback'){
                	feedbackModel = this.model;
                	callback = this.removeFeedback;
                }
            	var modal = ModalView.confirm(callback, 'Are you sure you want to delete this comment?', 'Delete Comment', $this);
            	modal.$el.find('.button.turquoise.modal-uikit-cancel').addClass('dusty-grey').focus();
            	modal.$el.find('.button.turquoise').addClass("confirmButtons");
            },
            removeFeedback: function(e){
                showLoading($(e));
                var dexterPayload = {
						artifactID   : feedbackModel.attributes.artifactID,
						memberID : parseInt(window.ads_userid),
						comment : feedbackModel.attributes.comments,
						reviewerMemberID : feedbackModel.attributes.memberID,
						feedbackType : 'feedback'
				};
                feedbackModel.destroy({wait: true, url: '/flx/delete/myfeedback/' + feedbackModel.artifactID + '?type=vote&memberID='+ feedbackModel.memberID,
                    success: function(model) {
                            model.set({
                                'comments': ''
                            }, {
                                silent: true
                            });
                            if (reviewsCollection) {
                                reviewsCollection.remove(model);
                            }
                            if (model.get('score') == 1) {
                                reviewsSummary.set({
                                    score: 0,
                                    'like': reviewsSummary.get('like') - 1,
                                    'reviewsCount' : reviewsSummary.get('reviewsCount') - 1,
                                });
                            } else if (model.get('score') == -1) {
                                reviewsSummary.set({
                                    score: 0,
                                    'dislike': reviewsSummary.get('dislike') - 1,
                                    'reviewsCount' : reviewsSummary.get('reviewsCount') - 1,
                                });
                            }
                            model.set('score', 0);
                            reviewsSummary.set({
                                reviewsRemaining: reviewsSummary.get('reviewsRemaining') - 1,
        		            });
                            $('.feedback-helpfull-heading').toggleClass('hide');
                            $('.show-hide-feedback-reviews').toggleClass('hide');
                            if (!reviewsCollection.length){
                            	$('.reviewfeedbackhead').html("Help us create better content by rating and reviewing this modality.");
                            }
                            hideLoading($(e));
                            if (model.memberID == window.ads_userid){
                                $('#review_popup').addClass('hide');
                                $('#myreview_vote #review_up').find('.imgwrap').removeClass('like').addClass('yes');
                                $('#myreview_vote #review_down').find('.imgwrap').removeClass('dislike').addClass('no');
                                $('#myreview_vote #top_edit_review').removeClass('show').addClass('hide');
                                $('#myreview_vote .washelpful_js').removeClass('hide').addClass('show');
                                $('#myreview_vote #review_comments').val('');
                            }
							if (window._ck12){
								_ck12.logEvent('FBS_REVIEWS_DELETE', dexterPayload);
							}
                            $('#review_list_container').trigger('flxweb.modality.read.initreviewlist');
                            // delay the unbind on safer side.
                            setTimeout(function() {
                                $('#review_list_container').unbind('flxweb.modality.read.initreviewlist');
                            }, 500);
                        }

                });
            },
            abuseReportAction: function(e){
            	if (!$.flxweb.isUserSignedIn()) {
                    $.flxweb.alertToSignin();
                    return false;
                }
                e.stopPropagation();
                var $this = $(e.currentTarget),
                	action = $(e.currentTarget).hasClass('js_feedback_abuse')? 'feedback' : 'reply',
                	abuseModel = this.replyAbuseReport,
                	parent = $(e.currentTarget).parents('.feedbacksection').find('.divider.spacetop');
                if (action == 'feedback'){
                	feedbackModel = this.model;
                	abuseModel = new ReviewsModule.ReviewAbuseModel({
	                    'memberID': feedbackModel.memberID,
	                    'artifactID': feedbackModel.artifactID,
	                    'source' : e.currentTarget,
	                });
                }else{
                	var commentdiv = $(e.currentTarget).parents('.replycomment').find('.feedbackcomment'),
                    reviewID = $(commentdiv).data('reviewid');
	                abuseModel = new ReviewsModule.ReplyAbuseModel({
	                		'reviewID': reviewID,
	                		'source' : e.currentTarget,
	                });
	                parent = $(e.currentTarget).parents('.replycomment').find('.divider.spacetop');
                }
                var abuseReviewView = new ReviewsModule.ReviewAbuseView({
						model: abuseModel
	            });
	            $('body #flag-comment-container').remove();
	            $('body').append(abuseReviewView.render().el);
	            $(abuseReviewView.$el).css({'top' : ($(parent).offset().top
	            									+ $(parent).height())
	            							, 'left' : $(parent).offset().left + $(parent).width() - $(abuseReviewView.$el).width() - 5 });
	            $('body').off('click.abusePopup').on('click.abusePopup', function(){
	                setTimeout(function() {
	                    abuseReviewView.$el.remove();
	                },100);
	            });
            },
            feedbackAbuseReport: function(e){
            	showLoading($(e));


            },
            replyAbuseReport: function(e){
            	showLoading($(e));
				var commentdiv = $(e).parents('.replycomment').find('.feedbackcomment'),
                    reviewID = $(commentdiv).data('reviewid');
                var replyModel = new ReviewsModule.ReplyAbuseModel({
                		'reviewID': reviewID,
                	});
                replyModel.save(null, {
                    success: function(model) {
                    	hideLoading($(e));
                        $(e).remove();
                    }
                });

				return false;
			},
            updatereply: function(e) {

                var commentdiv, reviewComment;
                commentdiv = $(e.currentTarget).parents('.replycomment').find('.feedbackcomment');
                reviewComment = $.trim(commentdiv.find('.replytextarea').val());

                //validate if text is blank
                if (reviewComment === '') {
                    commentdiv.find('.replytextarea').focus();
                    return false;
                }


                var update_reply_model = new ReviewsModule.ReviewUpdateReply({
                    'reviewComment': reviewComment,
                    'reviewID': commentdiv.data('reviewid'),
                    'reviewersMemberID': commentdiv.data('reviewersmemberid')
                });
                showLoading($(e.currentTarget));
                update_reply_model.save(null, {
                    success: function(model, response) {
                        if (response && response.isProfane && response.isProfane === true) {

                            /*$(commentdiv).find('.replytextarea').highlightTextarea({
                                words: [response.profaneWord],
                                caseSensitive: true,
                                resizable: false
                        });
                       $(commentdiv).find('.replytextarea').highlightTextarea('setWords', [response.profaneWord]);
                       */
                            $(commentdiv).find('.profanereply').text('We have detected profane words in the comment. Please correct it and re-submit the comment.');
                        } else {
                            $(commentdiv).html(reviewComment.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;'));
                            $(commentdiv).parents('.replycomment').find('.editreply_js').removeClass('hide');
                        }
                        hideLoading($(e.currentTarget));
                    }
                });
                return false;
            },

            canceleditreply: function(e) {
                var commentdiv = $(e.currentTarget).parents('.replycomment').find('.feedbackcomment');
                $(commentdiv).html($(commentdiv).data('reviewcomment')).parents('.replycomment').find('.editreply_js').removeClass('hide');
            },

            editreply: function(e) {
                var commentdiv = $(e.currentTarget).parents('.replycomment').find('.feedbackcomment');

                $(commentdiv).data('reviewcomment', $.trim(commentdiv.text()));
                var update_reply_model = new ReviewsModule.ReviewUpdateReply({
                    'reviewComment': $.trim(commentdiv.text()),
                    'reviewID': $(commentdiv).data('reviewid'),
                    'reviewersMemberID': $(commentdiv).data('reviewersmemberid')
                });

                var replyView = new ReviewsModule.UpdateReplyView({
                    model: update_reply_model
                });


                $(commentdiv).html(replyView.render().el);
                $(e.currentTarget).addClass('hide');
            },

            deletereply: function(e) {


                var commentdiv = $(e).parents('.replycomment').find('.feedbackcomment'),
                    reviewID = $(commentdiv).data('reviewid'),
                    reviewerMemberID = $(commentdiv).data('reviewersmemberid');
                var update_reply_model = new ReviewsModule.ReviewUpdateReply({
                    'reviewID': reviewID,
                    'reviewersMemberID': reviewerMemberID,
                });
                var dexterPayload = {
										artifactID   : parseInt(artifactID),
										memberID : parseInt(window.ads_userid),
										reviewID : reviewID,
										comment : $.trim($(commentdiv).html()),
										reviewerMemberID : reviewerMemberID,
										feedbackType : 'review'
									};
                update_reply_model.destroy({url:'/flx/delete/feedbackreview?reviewID=' + reviewID,
                    success: function() {
                            if (window._ck12){
								_ck12.logEvent('FBS_REVIEWS_DELETE', dexterPayload);
							}
                        // update reply count.
                        var replylist = $(e).parents('.feedbacksection').find('.listreply');
                        var totalreviews = $(replylist).data('totalreviews');
                        totalreviews -= 1;
                        $(replylist).data('totalreviews', totalreviews);
                        $(replylist).text(totalreviews + (totalreviews > 1 || totalreviews === 0 ? ' Comments ' : ' Comment '));

                        $(e).parents('.replycomment').remove();
                    }
                });

                return false;
            },

            addreply: function(e) {
                if (!$.flxweb.isUserSignedIn()) {
                    $.flxweb.alertToSignin();
                    return false;
                }
                $('.replytextarea').val('');
                $('#' + $(e.currentTarget).data('memberid') + ' .addreplybox').removeClass('hide').find('.profanereply').text('');

            },
            cancelreply: function(e) {
                $(e.currentTarget).parents('.addreplybox').addClass('hide');
            },

            postreply: function(e) {

                var memberID = $(e.currentTarget).data('memberid');
                //validate if text is blank
                if ($.trim($('#' + memberID).find('.replytextarea').val()) === '') {
                    $('#' + memberID).find('.replytextarea').focus();
                    return false;
                }

                var reply_model = new ReviewsModule.ReviewReply({});
                reply_model.set({
                    'reviewComment': $('#' + memberID).find('.replytextarea').val(),
                    'artifactID': this.artifactID,
                    'memberID': memberID,
                    'reviewersMemberID': ''
                }, {
                    'silent': true
                });
                showLoading($(e.currentTarget));
                reply_model.save(null, {
                    success: function(model, response) {
                        if (response && response.isProfane && response.isProfane === true) {

                            /*
                        $(idde).find('.replytextarea').highlightTextarea({
                                 words: [response.profaneWord],
                                caseSensitive: true,
                                resizable: false
                        });

                       $(idde).find('.replytextarea').highlightTextarea('setWords', [response.profaneWord]);
                       */

                            $('#' + memberID).find('.profanereply').text('We have detected profane words in the comment. Please correct it and re-submit the comment.');
                        } else {
                            $(e.currentTarget).parents('.addreplybox').addClass('hide');
                            var memberName = response.reviewersMemberName;
                            if(memberName){
                                var name = memberName.split(/\s+/);
                                if(name.length === 1){
                                    response.reviewersMemberName = name[0];
                                }else if(name.length > 1){
                                    response.reviewersMemberName = name[0] + ' ' + name[1][0].toUpperCase() + '.';
                                }
                            }
                            model.set({
                                'reviewersMemberName': response.reviewersMemberName,
                                'creationTime': response.creationTime,
                                'id': response.id,
                                'reviewersMemberID': response.reviewersMemberID
                            }, {
                                'silent': true
                            });
                            var replyView = new ReviewsModule.ReplyView({
                                model: model
                            });
                            // update reply count.
                            $('#' + model.get('memberID')).find('.addreplybox').after(replyView.render().el);
                            var listreply = $('#' + model.get('memberID')).find('.listreply');
                            var totalreviews = $(listreply).data('totalreviews');
                            totalreviews += 1;
                            $(listreply).data('totalreviews', totalreviews);
                            $(listreply).text(totalreviews + (totalreviews > 1 ? ' Comments ' : ' Comment '));

                        }
                        hideLoading($(e.currentTarget));
                    }
                });
                return false;
            },

            listReply: function(e) {
                var replyCollection = new ReviewsModule.ReplyCollection([], {
                    artifactID: this.artifactID,
                    memberID: $(e.currentTarget).data('memberid'),
                    type: 'rating'
                });
                replyCollection.on('reset', this.onRemoveAll, this);
                var me = this;
                if ($(e.currentTarget).hasClass('collapsereply')) {
                	showLoading($(e.currentTarget));
                    $(e.currentTarget).removeClass('collapsereply').addClass('expandreply');
                    replyCollection.reset();
                    replyCollection.fetch({
                        success: function() {
                        	hideLoading($(e.currentTarget));
                            replyCollection.each(me.onLoadReply);
                        }
                    });
                } else {
                    $(e.currentTarget).removeClass('expandreply').addClass('collapsereply');
                    replyCollection.reset();
                }
            },
            onRemoveAll: function(memberid) {
                $('#' + memberid.memberID + ' .replycomment').remove();
            },

            onLoadReply: function(reply) {
                var replyView = new ReviewsModule.ReplyView({
                    model: reply
                });
                $('#' + reply.get('memberID')).append(replyView.render().el);
            }
        });

        /**
         * View for each reply from the reply list
         */
        ReviewsModule.ReplyView = Backbone.View.extend({
            render: function() {
                var template = _.template($('#replyTemplate').html());
                this.model.set('creationTime', date.getTimeInUserTimeZone(this.model.get('creationTime')));
                this.model.set({'isArtifactOwner': (window.artifact_json || window.js_modality_data.artifact).creatorID == window.ads_userid});
                this.model.set({'isAdminUser' : window.flxweb_role == 'admin'});
                this.model.set({'isReviewer' : this.model.get("memberID") == window.ads_userid});
                this.model.set({'isReplier' : this.model.get("reviewersMemberID") == window.ads_userid});
                this.setElement(template(this.model.toJSON()), true);
                return this;
            }
        });

        /**
         * View for each reply edit from the reply list
         */
        ReviewsModule.UpdateReplyView = Backbone.View.extend({
            render: function() {
                var template = _.template($('#updateReplyTemplate').html());
                this.setElement(template(this.model.toJSON()), true);

                return this;
            }
        });

        /**
         * View for the current user's review for the
         * specified artifactID. Add Review popup.
         */
        ReviewsModule.MyReviewView = Backbone.View.extend({
            events: {
                'click #review_up': 'onVoteUp',
                'click #review_down': 'onVoteDown',
                'click #review_submit': 'onSubmit',
                'click #review_skip': 'onSkip',
                'click #top_edit_review': 'edit',
                'click .feedbackbtn_cancel': 'cancelFeedback',
                'click .feedbackbtn_remove': 'removeFeedback'
            },
            initialize: function() {
                this.model = new ReviewsModule.Review({
                    'artifactID': this.options.artifactID,
                    'memberID': ads_userid
                });
                //this.model.on('change',this.render,this);
                $('body').on('click.feedback', this.donefeedback);
                $('body').on('keypress.feedback', this.donefeedback);
                if ($.flxweb.isUserSignedIn()) {
                    var self = this;
                    this.model.fetch({
                        success: function() {
                            self.render();
                        }
                    });
                } else {
                    this.render();
                }
            },
            render: function() {
                var template = _.template($('#myReviewTemplate').html());
                this.$el.html(template(this.model.toJSON()));
                return this;
            },
            donefeedback: function(e) {
                var trg = e.target.className.toString();
                if ((trg && (trg.indexOf('feedback') === -1 || trg === '')) || (e.keyCode === 27)) {
                    $('#review_popup').addClass('hide');
                    $('#myreview').removeClass('disabled');
                }
            },
            cancelFeedback: function() {
                this.setLikeDislikeStyle(0);
                $('#review_popup').addClass('hide');
                return false;
            },
            removeFeedback: function(e) {
                if ($(e.target).hasClass('disabled')) {
                    return;
                } else {
                    $(e.target).addClass('disabled');
                }
                showLoading($(e.currentTarget));
                ReviewsModule.MyReviewView.upvoted = false;
                ReviewsModule.MyReviewView.downvoted = false;
                ReviewsModule.MyReviewView.firstReview = 0;
                if (this.model.get('score') === 1) {
                    reviewsSummary.set({
                        score: 0,
                        'like': reviewsSummary.get('like') - 1
                    });
                } else if (this.model.get('score') === -1) {
                    reviewsSummary.set({
                        score: 0,
                        'dislike': reviewsSummary.get('dislike') - 1
                    });
                }
                if (ReviewsModule.MyReviewView.firstReview === 0){
                    reviewsSummary.set({
                        reviewsRemaining: reviewsSummary.get('reviewsRemaining') - 1,
                    });
                }
                if (! $('#reviewsList').hasClass('hide')){
                    $('.feedback-helpfull-heading').removeClass('hide');
                    $('.show-hide-feedback-reviews .showreviews_js').parent().addClass('hide');
                    $('.show-hide-feedback-reviews .hidereviews_js').parent().removeClass('hide');
                }
                this.model.set({'memberID' : parseInt(this.model.memberID)});
                var dexterPayload = {
                    artifactID   : this.model.attributes.artifactID,
                    memberID : parseInt(window.ads_userid),
                    comment : this.model.attributes.comments,
                    reviewerMemberID : parseInt(this.model.attributes.memberID),
                    feedbackType : 'feedback'
                };
                $.when(this.deferred).then(function() {
                    $('#myreview').addClass('disabled');
                    this.model.destroy({
                        success: function(model) {
                            if (window._ck12){
                                _ck12.logEvent('FBS_REVIEWS_DELETE', dexterPayload);
                            }
                            if (reviewsCollection) {
                                reviewsCollection.remove(model);
                            }
                            if (reviewsSummary) {
                                reviewsSummary.set({
                                    score: 0,
                                    reviewsCount: reviewsSummary.get('reviewsCount') - 1
                                });
                                //reviewsSummary.fetch();
                            }
                            model.set('score', 0);
                            $('#myreview').removeClass('disabled');
                            if (! $('#reviewsList').hasClass('hide')){
                                $('.feedback-helpfull-heading').removeClass('hide');
                                $('.show-hide-feedback-reviews .showreviews_js').parent().addClass('hide');
                                $('.show-hide-feedback-reviews .hidereviews_js').parent().removeClass('hide');
                            }
                            $('#review_popup').addClass('hide');
                            hideLoading($(e.currentTarget));
                        }
                    })
                }.bind(this));

                this.resetwidget();

            },
            setVote: function(score) {
                var expanded, hideReview;
                if (!$.flxweb.isUserSignedIn()) {
                    $('#myreview').removeClass('disabled');
                    $.flxweb.alertToSignin();
                    return false;
                }
                this.model.set({
                    'score': score,
                    type: 'vote'
                }, {
                    'silent': true
                });
                this.model.id = '1';
                ReviewsModule.MyReviewView.readyToSubmit = false;
                if(score === 1 && !ReviewsModule.MyReviewView.upvoted || score === -1 && !ReviewsModule.MyReviewView.downvoted){
                    this.deferred = this.model.save(null, {
                        success: function(model) {
                            ReviewsModule.MyReviewView.readyToSubmit = true;
                            $('#myreview').removeClass('disabled');
                            //reviewsSummary.fetch();
                            //reviewsCollection.remove(model);
                            if (! $('#reviewsList').hasClass('hide')){
                                $('.feedback-helpfull-heading').removeClass('hide');
                                $('.show-hide-feedback-reviews .showreviews_js').parent().addClass('hide');
                                $('.show-hide-feedback-reviews .hidereviews_js').parent().removeClass('hide');
                            }
                        }
                    });
                    hideReview = $('.js-show-hide-feedback-reviews').hasClass('hide');
                    if (score === 1 && !ReviewsModule.MyReviewView.upvoted) {
                        expanded = !$('.reviews-expanded').hasClass('hide');
                        reviewsSummary.set({
                            'like': reviewsSummary.get('like') + 1,
                            'dislike': reviewsSummary.get('dislike') - ReviewsModule.MyReviewView.firstReview,
                            'reviewsCount': reviewsSummary.get('reviewsCount') - 1
                        });
                        if (expanded) {
                            $('.reviews-expanded').removeClass('hide');
                            $('.reviews-collapsed').addClass('hide');
                        }
                        if (hideReview) {
                            $('.js-show-hide-feedback-reviews').addClass('hide');
                        }
                    } else if (score === -1 && !ReviewsModule.MyReviewView.downvoted) {
                        expanded = !$('.reviews-expanded').hasClass('hide');
                        reviewsSummary.set({
                            'like': reviewsSummary.get('like') - ReviewsModule.MyReviewView.firstReview,
                            'dislike': reviewsSummary.get('dislike') + 1,
                            'reviewsCount': reviewsSummary.get('reviewsCount') - 1
                        });
                        if (expanded) {
                            $('.reviews-expanded').removeClass('hide');
                            $('.reviews-collapsed').addClass('hide');
                        }
                        if (hideReview) {
                            $('.js-show-hide-feedback-reviews').addClass('hide');
                        }
                    }
                }else{
                	$('#myreview').removeClass('disabled');
                }

                //open the popup
                this.edit();
                return false;
            },
            onVoteUp: function() {
                if (this.model.get('score') && this.model.get('score') > 0) {
                    return false;
                }
                ReviewsModule.MyReviewView.downvoted = false;
                if ($('#myreview').hasClass('disabled')) {
                    return false;
                }
                if ($('#review_up').find('.imgwrap').hasClass('like')) {
                    ReviewsModule.MyReviewView.upvoted = true;
                }
                if (this.model.get('score')) {
                    ReviewsModule.MyReviewView.firstReview = 1;
                } else {
                    ReviewsModule.MyReviewView.firstReview = 0;
                }
                $('#myreview').addClass('disabled');
                this.loadReviewList();
                $('#review_up').find('.imgwrap').addClass('like');
                $('#review_down').find('.imgwrap').removeClass('dislike');
                this.setVote(1);
                return false;
            },
            onVoteDown: function() {
                if (this.model.get('score') && this.model.get('score') < 0) {
                    return false;
                }
                ReviewsModule.MyReviewView.upvoted = false;
                if ($('#myreview').hasClass('disabled')) {
                    return false;
                }
                if ($('#review_down').find('.imgwrap').hasClass('dislike')) {
                    ReviewsModule.MyReviewView.downvoted = true;
                }
                if (this.model.get('score')) {
                    ReviewsModule.MyReviewView.firstReview = 1;
                } else {
                    ReviewsModule.MyReviewView.firstReview = 0;
                }
                $('#myreview').addClass('disabled');
                this.loadReviewList();
                $('#review_down').find('.imgwrap').addClass('dislike');
                $('#review_up').find('.imgwrap').removeClass('like');
                this.setVote(-1);
                return false;
            },
            saveComment: function(e) {
                var previousComments;
                if (ReviewsModule.MyReviewView.readyToSubmit) {
                    window.clearInterval(ReviewsModule.MyReviewView.interval);
                    previousComments = this.model.get('comments');
                    this.model.set({
                        'comments': $('#review_comments').val()
                    }, {
                        'silent': true
                    });
                    this.model.save(null, {
                        success: function(model, response) {
                            if (response && response.isProfane && response.isProfane === true) {

                                /*
                                $('.feedbacktextarea').highlightTextarea({
                                        words: [response.profaneWord],
                                        caseSensitive: true,
                                        resizable: false
                                });
                                $('.feedbacktextarea').highlightTextarea('setWords', [response.profaneWord]);
                                */
                                $('.feedbackpopup').height('240px');
                                $('#profane_message').text('We have detected profane words in the review. Please correct it and re-submit the review.');
                            } else {
                                var name = model.get('memberName').split(/\s+/);
                                if(name.length === 1){
                                    model.set('memberName', name[0]);
                                }else if(name.length > 1 && name[1][0]){
                                    model.set('memberName', name[0] + ' ' + name[1][0].toUpperCase() + '.');
                                }
                                $(document).scrollTo($('#feedback'));
                                $('#review_popup').addClass('hide');
                                reviewsCollection.remove(model);
                                reviewsCollection.add(model);
                                reviewsSummary.set({
                                    reviewsCount: reviewsSummary.get('reviewsCount') + 1
                                });
                                if (ReviewsModule.MyReviewView.firstReview === 0 || ! previousComments){
                                    reviewsSummary.set({
                                        reviewsRemaining: reviewsSummary.get('reviewsRemaining') + 1,
                                    });
                                }
                                if (! $('#reviewsList').hasClass('hide')){
                                    $('.feedback-helpfull-heading').removeClass('hide');
                                    $('.show-hide-feedback-reviews .showreviews_js').parent().addClass('hide');
                                    $('.show-hide-feedback-reviews .hidereviews_js').parent().removeClass('hide');
                                }
                            }

                            hideLoading($(e.currentTarget));
                        }
                    });
                }
            },
            onSubmit: function(e) {
                var interval, thisObject;
                thisObject = this;
                this.loadReviewList();
                //validate if text is blank
                if ($.trim($('.feedbacktextarea').val()) === '') {
                    $('.feedbacktextarea').focus();
                    return false;
                }
                showLoading($(e.currentTarget));
                ReviewsModule.MyReviewView.interval = window.setInterval(function() {
                    thisObject.saveComment(e);
                }, 500);
                return false;
            },
            onSkip: function() {
                //on skip, we don't want the comments.
                //this.model.set({comments:null});
                //this.model.save();
                $('#review_popup').addClass('hide');
                return false;
            },
            loadReviewList: function() {
                $('#review_list_container').trigger('flxweb.modality.read.initreviewlist');
                // delay the unbind on safer side.
                setTimeout(function() {
                    $('#review_list_container').unbind('flxweb.modality.read.initreviewlist');
                }, 500);
            },
            edit: function() {
                //this.$('#myreview_vote').removeClass('hide');
                //this.$('#myreview_thankyou').addClass('hide');
                //this.model.fetch();
                this.render();
                this.setLikeDislikeStyle(this.model.get('score'));
                $('#review_popup').removeClass('hide');
            },
            setLikeDislikeStyle: function(vote) {
                if (vote === '1') {
                    $('.feedbackpopup').removeClass('voteyes').removeClass('voteno').addClass('voteyes');
                } else if (vote === '-1') {
                    $('.feedbackpopup').removeClass('voteyes').removeClass('voteno').addClass('voteno');
                } else {
                    $('.feedbackpopup').removeClass('voteyes').removeClass('voteno');
                }
            },
            resetwidget: function() {

                this.model.set({
                    'comments': ''
                }, {
                    silent: true
                });
                $('#review_up').find('.imgwrap').removeClass('like').addClass('yes');
                $('#review_down').find('.imgwrap').removeClass('dislike').addClass('no');
                $('#top_edit_review').removeClass('show').addClass('hide');
                $('.washelpful_js').removeClass('hide').addClass('show');

            }

        }, {
            "upvoted": false,
            "downvoted": false,
            "firstReview": 1,
            "readyToSubmit": true
        });

        /**
         * View for the showing the list of reviews and the
         * summary of artifact reviews
         */
        ReviewsModule.ReviewsListView = Backbone.View.extend({
            events: {
                'click #editMyReview': 'onEditMyReview',
                'click #loadMorebtn': 'onLoadMore',
                'click .show-hide-feedback-reviews': 'showHideReviews',
            },
            initialize: function() {
                //exit if the element does not exist
                if ($(this.el).length === 0) {
                    return;
                }
                if (!this.options.pageNum) {
                    this.pageNum = 1;
                } else {
                    this.pageNum = this.options.pageNum;
                }
                if (!this.options.pageSize) {
                    this.pageSize = 5;
                } else {
                    this.pageSize = this.options.pageSize;
                }
                if (!this.options.artifactID || this.options.artifactID === undefined || this.options.artifactID === 'undefined') {
                    throw 'ReviewsListView:artifactID not passed';
                }
                this.artifactID = this.options.artifactID;
                this.totalReviews = 0;
                reviewsCollection = new ReviewsModule.ReviewsCollection([], {
                    artifactID: this.artifactID,
                    pageNum: this.pageNum
                });
                reviewsSummary = new ReviewsModule.ReviewsSummary({
                    artifactID: this.artifactID
                });
                //add listeners
                reviewsCollection.on('add', this.onAddReview, this);
                reviewsCollection.on('reset', this.onData, this);
                reviewsCollection.on('remove', this.onRemoveReview, this);
                //initialize the review
                var artifact, likeSummary, dislikeSummary, totalSummary, percentSummary, reviewsCount;
                likeSummary = dislikeSummary = totalSummary = percentSummary = reviewsCount = 0;
                if (window.js_modality_data && window.js_modality_data.artifact) {
                    artifact = window.js_modality_data.artifact;
                } else if (window.artifact_json_encoded) {
                    artifact = window.artifact_json_encoded;
                }
                if (artifact) {
                    likeSummary = artifact.feedbacks.voting.like;
                    dislikeSummary = artifact.feedbacks.voting.dislike;
                    totalSummary = likeSummary + dislikeSummary;
                    percentSummary = (likeSummary * 100) / totalSummary;
                    reviewsCount = artifact.feedbacks.rating.count;
                }
                reviewsSummary.on('change', this.render, this);
                reviewsSummary.set({
                    "dislike": dislikeSummary,
                    "like": likeSummary,
                    "reviewsCount": reviewsCount,
                    "total": totalSummary,
                    "percentage": percentSummary
                });
                //reviewsSummary.fetch();
                var self = this;
                reviewsCollection.fetch({
                    success: function(collection, response) {
                        reviewsSummary.set({
                            reviewsCount: response.response.total
                        });
                        self.showhideLoadMore(response.response.total, self.pageNum);
                        if (self.pageNum == 1){
                    		$('#reviewsList').addClass('hide');
                    		$('#load-more-container').addClass('hide');
                    		reviewsSummary.set({
                    		    reviewsRemaining: response.response.total,
                    		});
                    	}
                    }
                });
            },
            showhideLoadMore: function(total, pageNum) {
                var jsonObj = {},
                    template = _.template($('#loadmoreBtnTemplate').html());
                jsonObj.total = total;
                jsonObj.reviewsRemaining = total - (pageNum * 5);
                jsonObj.reviewsRemaining > 0 ? jsonObj.reviewsRemaining : 0;
                jsonObj.showLoadmore = total - (pageNum * 5) > 0 ? true : false;
                if (!($('#loadMorebtn').length === 0)) {
                    $('#load-more-container').remove();
                }
                if (!jsonObj.showLoadmore) {
                    $('#loadMorebtn').addClass('hide');
                }
                if (jsonObj.reviewsRemaining){
	                $('#reviewsList').after(template(jsonObj));
	            }
	            /*reviewsSummary.set({
					reviewsRemaining: jsonObj.reviewsRemaining,
                });*/
            },
            showHideReviews: function(){
            	$('#reviewsList').toggleClass('hide');
            	$('.feedback-helpfull-heading').toggleClass('hide');
            	$('#load-more-container').toggleClass('hide');
            	$('.show-hide-feedback-reviews').toggleClass('hide');
            },
            onLoadMore: function() {
                reviewsCollection.pageNum = reviewsCollection.pageNum + 1;
                var self = this;
                reviewsCollection.fetch({
                    success: function(collection, response) {
                        self.showhideLoadMore(response.response.total, reviewsCollection.pageNum);
                    }
                });
            },
            onAddReview: function(review) {
                var reviewView = new ReviewsModule.ReviewView({
                    model: review
                });
                if ($('#' + review.get('memberID')).length) {
                    $('#' + review.get('memberID')).remove();
                }
                $('#reviewsList').prepend(reviewView.render().el);
            },
            onLoadReview: function(review) {
                var reviewView = new ReviewsModule.ReviewView({
                    model: review
                });
                $('#reviewsList').append(reviewView.render().el);
            },
            onRemoveReview: function(review) {
                $('#' + review.get('memberID')).remove();
            },
            onData: function() {
                reviewsCollection.each(this.onLoadReview);
            },
            render: function() {
                var template = _.template($('#reviewsSummaryTemplate').html());
                $('#reviewsSummary').html(template(reviewsSummary.toJSON()));
                return this;
            },
            onEditMyReview: function() {
                this.options.myReviewView.edit();
                $('#review_comments').focus();
                return false;
            }
        });
        return ReviewsModule;
    });
