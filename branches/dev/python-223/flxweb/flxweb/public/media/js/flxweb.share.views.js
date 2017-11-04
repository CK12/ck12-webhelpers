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
 * This file originally written by Ravi Gidwani
 *
 * $id$
 */
define('flxweb.share.views', ['jquery', 'underscore', 'flxweb.global', 'backbone', 'flxweb.groups.models','common/utils/utils','templates/success_modal.tmpl', 'jquery-ui'], function ($, _, $global, Backbone, GroupsModule, Util, SuccessModal) {
    'use strict';
    var ShareViews = {},
        groupsLoading = false,
        moreGroups = true;

    /**
     * Share via groups view
     * Parameters:
     *  options.link is the element which when clicked will open this view.
     *  options.objectID is the object that is being shared
     */
    ShareViews.GroupsShareView = Backbone.View.extend({  	
        events: {
            'click #shareGroupFormBtn': 'shareToGroups',
            'click #success-btn' : 'closeModal'
        },
        initialize: function () {
            //Make sure the action link element exists
            if ($(this.options.link).length === 0) {
                return;
            }

            //Make sure the objectID is passed
            if ($(this.options.objectID).length === 0) {
                return;
            }
            //create the div after the link
            this.$el.insertAfter($(this.options.link));
            this.$el.addClass('groups_share_dialog hide');

            // groups for which user has share permission
            this.myGroups = new GroupsModule.MyGroups();

            var self = this;
            //handle the click on the link
            $(this.options.link).off('click.share').on('click.share', function () {
                if ($('#shareGroupsContainer:visible').length) {
                    self.close();
                } else {
                    self.open();
                }
                return false;
            }).off('mouseenter.groups').on('mouseenter.groups', function () {
                $(this).addClass('hover');
            }).off('mouseleave.groups').on('mouseleave.groups', function () {
                $(this).removeClass('hover');
            });
        },
        open: function () {
        	$(document).click();
            var self = this;
            if ($.flxweb.isUserSignedIn()) {
                this.$el.html(_.template($('#shareGroupsLoadingTemplate').html())).removeClass('hide');
                $.flxweb.events.triggerEvent($(document), 'flxweb.share.view.open');
                this.myGroups.pageNum = 1;
                this.myGroups.fetch({
                    success: function (collection, response) {
                        //once the groups are fetched,
                        //update the view by calling render
                        self.$el.empty();
                        moreGroups = response.response.limit + response.response.offset < response.response.total;
                        self.render({
                            'container': self.$el,
                            'onLoad': true
                        });
                        var title = window.title.split("By");
                        $(".modality-title").html(title[0]);
                        $('#shareGroupsContainer').off('scroll.groups').on('scroll.groups', function () {
                            if ($(this).height() + $(this).scrollTop() >= this.scrollHeight && moreGroups) {
                                self.loadMoreGroups();
                            }
                        }).off('change.share').on('change.share', '.js_groups_select', function () {
                            $('#none_selected_error').addClass('hide');
                        }).scrollTop(0);
                        $('.groups_share_dialog .load-more-groups').off('click.loadMoreGroups').on('click.loadMoreGroups', function () {
                            if(moreGroups){
                                self.loadMoreGroups();
                            }
                        });
                        //handler to close the view when clicked outside the group share dialog
                        $(document).off('click.share').on('click.share', function (e) {
                            if(self.el === e.target){
                                return false;
                            }
                            else if (!$(self.el).has(e.target).length) {
                                self.close();
                                $(this).off(e);
                            }
                        });
                        $('.groups_share_dialog').on('mouseup', function(e) {
                            e.stopImmediatePropagation();
                        });
                        $(".close-modal").off("click.closeModal").on("click.closeModal",function(){
                        	self.close();
                        });
                        $("#all-grps").off("click.selectAll").on("click.selectAll",function(){
                        	if($(this).is(':checked')){
                        		$('#shareGroupsContainer').find('.js_groups_select').attr("checked",true);
                        	}else{
                        		$('#shareGroupsContainer').find('.js_groups_select').attr("checked",false);
                        	}
                        	
                        });
                        //trigger event for other views to listen
                        $.flxweb.events.triggerEvent($(document), 'flxweb.share.view.open');
                    },
                    error: function () {}
                });
            } else {
                $.flxweb.alertToSignin();
                return false;
            }
        },
        close: function () {
            this.$el.empty().addClass('hide');
            $.flxweb.events.triggerEvent($(document), 'flxweb.share.view.close');
        },
        loadMoreGroups: function () {
            if (groupsLoading) {
                return;
            }
            var self = this;
            this.myGroups.pageNum = this.myGroups.pageNum + 1;
            groupsLoading = true;
            this.myGroups.fetch({
                success: function (collection, response) {

                    groupsLoading = false;
                    moreGroups = response.response.limit + response.response.offset < response.response.total;
                    if(!moreGroups){
                    	$('.groups_share_dialog .load-more-groups').css('color','#56544D');
                    }
                    //once the groups are fetched,
                    //update the view by calling render
                    self.render({
                        'container': $('#shareGroupsContainer'),
                        'onLoad': false
                    });
                },
                error: function () {}
            });
        },
        render: function (options) {
            try {
            	
                this.myGroups.toJSON()[0].response.onLoad = options.onLoad;
                options.container.append(_.template($('#shareGroupsTemplate').html(), this.myGroups.toJSON()[0].response, {
                    'variable': 'data'
                }));
             
            } catch (e) {
                console.log(e);
            }
        },
        shareToGroups: function () {
            var data,
                share_to_group_url = webroot_url + 'flx/group/share',
                self = this,
                checked_elements = this.$el.find("input.js_groups_select[type=checkbox]:checked"),
                group_ids = '',groups = [];
            checked_elements.each(function () {
                group_ids += this.id;
                group_ids += ',';
                groups.push(this.id);
            });
            group_ids = group_ids.split(',');
            group_ids.pop();
            group_ids = group_ids.join(',');
            if (!group_ids) {
                $('#shareGroupsContainer').scrollTop(0);
                $('#none_selected_error').removeClass('hide');
                return false;
            }
            data = {
                'objectID': this.options.objectID,
                'groupIDs': group_ids,
                'url': window.location.href,
                'format': 'json'
            };

            $('#shareGroupFormBtn').text('Sharing ...');
            $.post(share_to_group_url, data, function (response) {
                $('#shareGroupFormBtn').text('Share');
                response = response.response;
                if (response) {
                    if (response.hasOwnProperty('message')) {
                        alert('We couldn\'t share the content to the selected group(s). Please try again later.');
                        console.log(response.message);
                    } else {
                        $(self.options.link).addClass('shared');
                        self.close();
                        var payload = {};
                        var finalModalData = {
                        	'groupList' : [],
                        	'assignmentName' : ''
                        };
                        payload.artifactID = self.options.objectID;
                        payload.memberID = ads_userid;
                        payload.social_network = 'group';
                        payload.page = 'modality_details';
                        $.flxweb.logADS('fbs_share', payload);
                        for(var i = 0; i < groups.length; i++){
                        	finalModalData.groupList.push({
                				"groupID" : response.result[groups[i]].groupID,
                				"groupName" : $.parseJSON(response.result[groups[i]].activityData).group_name
                			})
                			//finalModalData['assignmentName'] = $.parseJSON(response.result[groups[i]].activityData).title;
                        };
                        finalModalData['assignmentName'] = $.parseJSON(response.result[groups[0]].activityData).title;
                        self.loadFinalModal(finalModalData);
                        
                    }
                } else {
                    alert('We couldn\'t share the content to the selected group(s). Please try again later.');
                }
            });
        },
        successTmpl : _.template(SuccessModal.SUCCESSINFO),
        loadFinalModal: function(response){
        	//console.log("Assignment created and assigned successfully!!");
        	var successTmpl = "",
        	successTmpl = this.successTmpl({
        		"assignmentName" : response['assignmentName'],
        		"groupList" : response['groupList']
        	}),
        	that = this;
        	if($('body #share-successModal'))
        		$('body #share-successModal').remove();
        	$('body').append(successTmpl);
	    	$('#success-btn').off('click').on('click', function(){
	    		 that.closeModal($("#share-successModal"));
	         });
        	setTimeout(function(){
        		that.revealModal($("#share-successModal"));
        	},500);
        },
        revealModal : function(modal){
        	$(modal).foundation("reveal","open");
        }, 
        closeModal : function(modal){
        	$(modal).foundation("reveal","close");
        }
    });

    return ShareViews;
});
