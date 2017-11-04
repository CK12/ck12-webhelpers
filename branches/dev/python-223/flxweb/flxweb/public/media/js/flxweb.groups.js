

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
 * This file originally written by Deepak Babu
 *
 * $id$
 */
define('flxweb.groups',
        ['jquery',
        'underscore',
        'jquery-ui',
        'flxweb.global','flxweb.utils.base64','flxweb.utils.url','jquery.simpleplaceholder'],
function($,_,UI,global,Base64,Url) {
    
    var row_template = null, group_details = {}, edit_template = null, loading_div = null;
    var prev_active_gp_id = null;
    var typingTimer;                //timer identifier for saving changes to text boxes
    var doneTypingInterval = 1000;
    group_details = {}; //New Array named group_details
    //on keyup, start the countdown
	
    
    
    function domReady() {
           row_template = _.template($("#tmpl_grp_row").html(), null,{'variable':'data'});
           edit_template = _.template($("#tmpl_grp_edit").html(), null,{'variable':'data'});
	   loading_div = $("#loader_container").html();
        $('.groupRows .groupRow:even').addClass("alternate");
        if($.browser.mozilla){
            $("#groupName").css("width","378px");
            $("#groupDescription").css("width","378px");
        }
        $('input:text[placeholder]').simplePlaceholder();
        $('textarea[placeholder]').simplePlaceholder();

	if (window.location.hash == '#create') { 
		openCreateGroupForm();
        }


         
        $('.groupRow').live('click',function(e){
            var target, parents;
            target = $(e.target);
            target_id = target.attr('id');
            if(target_id != undefined)
                if((target_id.indexOf('groupScopeEdit') != -1) ||(target_id.indexOf('del_group_user_link') != -1) || (target.attr('id') == 'gp_join_url_help') || (target.hasClass('grid_icons')))
                    return;
            parents = target.parents('.groupbody');
            if ($(parents).size()){
                return false;
            }
	        $(this).siblings(".groupRow").each(function(){
		        	//alert($(this).css("height"));
		        	
	        	$(this).find(".inputfield").hide();
	        	$(this).find(".inputfield").next().hide();
	        	$(this).find("input:checkbox").parent().hide();
	        	if($(this).css("height") != "50px"){
		        	$(this).css("height", "50px").removeClass('active');
	        	}
                        $(this).find('.warning').hide();
                        $(this).find('#gp_join_url_help').hide();
                        if($(this).hasClass('Admin'))
                            $(this).find('.groupbody').html(loading_div);
	        });
	        if ( $(this).hasClass('active') ){  //if you click the active one
	            $(this).find(".inputfield").hide();
	            $(this).find(".inputfield").next().hide();
	            $(this).find("input:checkbox").parent().hide();
	            $(this).css("height", 50).removeClass('active');
                    if(prev_active_gp_id != null){
                        $('#groupTitle_'+prev_active_gp_id).text($('#group_'+prev_active_gp_id).attr('data-groupname'));
                    }
                    $(this).find('.warning').hide();
                    $(this).find('#gp_join_url_help').hide();
                    if($(this).hasClass('Admin'))
                        $(this).find('.groupbody').html(loading_div);
                    prev_active_gp_id = null;
	        } else { //if you click an inactive one
	            
	            $(this).find(".inputfield").show();
	            $(this).find("input:checkbox").parent().show();
                    $(this).find('.warning').show();
                    $(this).find('#gp_join_url_help').show();
	            $(this).css("height", $(this).children(":first").css("height")).addClass('active');
	        }
	        
	        if ( $(this).hasClass('active') ){
    	        group_details = {}; //New Array named group_details
                group_details['new'] = {} //first item in grou_details isnamed new, and is an array
                group_details['new']['id'] = $(this).attr('data-groupid'); // new's ID is the group id number
                group_details['new']['name'] = $(this).attr('data-groupname'); // new's name is the group name
                if(prev_active_gp_id != null){ // if there was not another active row
                    $('#groupTitle_'+prev_active_gp_id).text($('#group_'+prev_active_gp_id).attr('data-groupname')); //set the text box to say the group name
                    $('#groupTitle_'+prev_active_gp_id).find('.warning').hide();
                    $('#groupTitle_'+prev_active_gp_id).find('#gp_join_url_help').hide();
                    $('#groupTitle_'+prev_active_gp_id).find('.groupbody').html(loading_div);
                }
                prev_active_gp_id = $(this).attr('data-groupid');
                var new_group_id = group_details['new']['id']
                var member_role = $.trim($(this).find('#gpRole_'+new_group_id).text()).toLowerCase();
                if(member_role == 'admin') {
                    $('#groupbody_'+new_group_id).html(loading_div);
                    getGroupDetails(group_details);
                } else {
                    $('#group_'+new_group_id).find('.warning').html('<a data-groupname="'+group_details["new"]["name"]+'" data-groupid="'+group_details["new"]["id"]+'" id="del_group_user_link_'+new_group_id+'" class="gpLeaveLink warningMemberLink deleteGroupUserIcon" href="javascript:void(0)"></a>');
                }
	        }
        });

        $('.active input:checkbox').live("change",function(){
		    clearTimeout(typingTimer);
		    var textfield = $(this);
		    typingTimer = setTimeout(function(){doneTypingDesc(textfield);}, doneTypingInterval); 
            
        });
        $('.active .inputfield').live("keydown",function(){
		    clearTimeout(typingTimer);
		    var textfield = $(this);
		    textfield.next().html(' ');
		    if (textfield.val()) {
		        typingTimer = setTimeout(function(){doneTypingDesc(textfield);}, doneTypingInterval); 
		    }
		});
		
		function doneTypingDesc (textField) {
		   var htmlText = $('#thinkingGif').html();
		   textField.next().html(htmlText);
		   simpleUpdateGroup(textField);
		}
		
		
        $('#groups_create_new').click(function(){
	    openCreateGroupForm();
        });
        
        $('#groups_join').click(function(){
            $('#groups_create_new').removeClass("open");
            $(this).toggleClass("open");
            $('#groups_create_box').hide();
            $('#groups_join_box').toggle();
            $('#joinForm').find('#groupName').focus().select();
        });
        $('#create_popbox').click(function(){
            createGroup();
        });
        $('#join_popbox').click(function(){
            joinGroup();
        });
        $('#createForm').keydown(function(event){
            if(event.which == 13){
                createGroup();
            }
        });
        $('#joinForm').keydown(function(event){
            if(event.which == 13){
                joinGroup();
            }
        });
        $('#gpMemberDel').live('click', function(event) {
            var element = $(event.target);
            var group_name = $(element).attr('data-groupname');
            var group_id = $(element).attr('data-groupid');
            var member_id = $(element).attr('data-memberid');
            var member_name = $(element).attr('data-membername');
            confirmDeleteMemberFromGroup(group_name, group_id, member_id, member_name);
        });
        $('.gpLeaveLink').live('click', function(event) {
            var element = $(event.target);
            var group_name = $(element).attr('data-groupname');
            var group_id = $(element).attr('data-groupid');
            confirmLeaveGroup(group_name, group_id);
        });
        //$('.gpDelLink').live('click', confirmDeleteGroup());
        $('.gpDelLink').live('click', function(event) {
            var group_name = $(this).attr('data-groupname');
            confirmDeleteGroup(group_name);
        });
        $('#groups_update').live('click', function(){
            updateGroup();
        });
        
        $('#titleRow').hover(function(){
            showHelpIcons(this, 1);
            hideMemberHelpIcon(this, 1);
        },
        function(){
            hideHelpIcons(this, 1);
            $('.grid_icon_box').hide();
        });

        $(".groupRow.active").live('mouseover', function() { 
            showMemberHelpIcon(this, 1);
        }).live('mouseleave', function () {
            hideMemberHelpIcon(this, 1);
            //$('.grid_icon_box').hide();
        });


        $(".members_help_icon").live('mouseover', function() { 
            showMemberHelpIcon(this, 2);
        }).live('mouseleave', function () {
            hideMemberHelpIcon(this, 2);
        });
 
        $(".groupRow.active").live('mouseleave', function() {
            $('.groupRow.active').css('overflow','hidden');
            $('.grid_icon_box').hide();
        });

        $('.grid_icon_box').live('mouseleave', function() {
            $('.groupRow.active').css('overflow','hidden');
            $('.grid_icon_box').hide();
            if($(this).parent().find('.grid_icons').hasClass('highlight'))
                $(this).parent().find('.grid_icons').removeClass('highlight').addClass('show');
        });

        $('.grid_icon_box').live('mouseover', function() {
            if(!$(this).parent().find('.grid_icons').hasClass('highlight'))
                $(this).parent().find('.grid_icons').addClass('highlight').removeClass('show');
        });

        $('.grid_icons').hover(function(){
            showHelpIcons(this, 2);
        },
        function(){
            hideHelpIcons(this, 2);
        });

        $('.grid_icons').click(function(){
            $('.grid_icon_box').hide();
            var icon = $(this).attr('data-icon');
            $('#'+icon+'_grid_icon_box').toggle();
        });

        $(".members_help_icon").live('click', function() { 
            var icon = $(this).attr('data-icon');
            var groupid = $(this).attr('data-groupid');
            $('.groupRow.active').css('overflow','visible');
            $('#'+icon+'_grid_icon_box_'+groupid).toggle();
        });

        $('.box.grid_icon_box').hover(function(){
            $(this).parent().children(0).toggleClass('highlight').toggleClass('show');
        });

        $('body').live('click', function(e){
            if(!($(e.target).closest('#groups_join_box').length) && !($(e.target).closest('#groups_create_box').length) && !($(e.target).closest('#groups_create_new').length) && !($(e.target).closest('#groups_join').length) && !($(e.target).closest('div.js_ck12_dialog_common').length)) {
                $('#groups_create_box').hide();
                $('#groups_join_box').hide();
                $('#groups_join').removeClass("open");
                $('#groups_create_new').removeClass("open");
            }
        });
        checkUserJoin();
        
	$('.groupbody').html(loading_div);
    }


    function openCreateGroupForm() {
            $('#groups_create_new').toggleClass("open");
            $('#groups_join').removeClass("open");
            $('#groups_join_box').hide();
            $('#groups_create_box').toggle();
            $('#createForm').find('#groupName').focus();
    }
    
    function checkUserJoin(){
        var joined_group_id = $('#joined_group_id').text();
        var msg = '';
        if(joined_group_id == 'not_joined') {
            msg = 'We couldn\'t join you to the group.  Please try again later.';
        } else {
            if(joined_group_id == 'already_joined') {
                msg = 'You are already in the group.';
            } else {
                if(joined_group_id == 'no_such_group'){
                    msg = 'Group does not exist. Please contact group administrator';
                } else {
                    getMyGroups();
                    return false;
                }

            }
        }

        if(msg == '') {
            $.each($('groupmgmt').find('.ui-accordion-header'), function(index, obj){
                alert($(obj).attr('data-groupid'));
                alert($(obj).attr('data-groupid') == joined_group_id);
            });
        } else {
                    $.flxweb.showDialog(msg,{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                                getMyGroups();
                            }
                        }
                    });
                    return false;

        }
    }

    function joinGroup() {
        $.flxweb.showLoading("Joining to the Group.");
        var groupName = $.trim($('#joinForm').find('#groupName').val());
        var accessCode = $.trim($('#joinForm').find('#accessCode').val());
        if($.trim(groupName) == "" || $.trim(accessCode) == "") {
                    $.flxweb.showDialog("Group title/Access code cannot be empty.",{
                        'buttons' : {
                            'OK': function(){
                            	$('#joinForm').find('#groupName').val(groupName);
                            	$('#joinForm').find('#accessCode').val(accessCode);
                            	if (groupName == ""){
                            		$('#joinForm').find('#groupName').focus().select();
                            	}else if (accessCode == ""){
                            		$('#joinForm').find('#accessCode').focus().select();
                            	}
                                $(this).dialog('close');
                            }
                        }
                    });
                    return;

        }
        $('#joinForm').find('#groupName').val('');
        $('#joinForm').find('#accessCode').val('');
        $('#groups_join_box').hide();
        var join_group_url = webroot_url + 'ajax/join/group/';
        var data = {'accessCode':accessCode, 'groupName':groupName}
        $.post(join_group_url, data, function(res){
            $.flxweb.hideLoading();
            if(res != "null") {
                res = $.parseJSON(res);
                if('message' in res){
                    if(res.message == 'no_such_group') {
                        $.flxweb.showDialog("There is no such group: "+groupName,{
                            'buttons' : {
                                'OK': function(){
                                    $(this).dialog('close');
                                    return false;
                                }
                            }
                        });

                        
                    } else {
                        if(res.message == 'already_joined') {
                            $.flxweb.showDialog("You are already in the group: '"+groupName+"'",{
                                'buttons' : {
                                    'OK': function(){
                                        $(this).dialog('close');
                                        return false;
                                    }
                                }
                            });

                        } else {
                            $.flxweb.showDialog("We couldn't join you to the group: '"+groupName+"', Please try again later.",{
                                'buttons' : {
                                    'OK': function(){
                                        $(this).dialog('close');
                                        return false;
                                    }
                                }
                            });

                        }
                    }
                    return;
                }
                if(res.result == true){
                    getMyGroups();
                } else {
                    $.flxweb.showDialog("Could not join Group.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });
                } 
           
            } else {
                    $.flxweb.showDialog("Could not join Group.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });

            }
        })
        .error(function() {
                    $.flxweb.hideLoading();
                    $.flxweb.showDialog("Could not get Group details.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });


        });

    }

    function confirmDeleteGroup(group_name){
        $.flxweb.showDialog("Are you sure you want to delete " + group_name + "?",
        {
            'buttons': [
                {
                    'text': 'Remove',
                    'click': function(){
                        $(this).dialog('close');
		        deleteGroup(group_name);
                    }
                },
                {
                    'text' : 'Cancel',
                    'click': function(){
                        $(this).dialog('close');
                    }
                }
            ]
        });
        return false;
    }

    function deleteGroup(group_name) {
        $.flxweb.showLoading("Deleting Group");
        var del_group_url = webroot_url + 'ajax/delete/group/';
        var data = {'groupName':group_name,'groupID':current_group_id};
        $.post(del_group_url, data, function(res){
            $.flxweb.hideLoading();
            if(res != "null") {
                $('#groups_join_box').hide();
                res = $.parseJSON(res);
                if('message' in res) {
                    $.flxweb.showDialog("Could not delete Group.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });
                } else {
                    getMyGroups();

                }
                
            } else {
                    $.flxweb.showDialog("Could not delete Group.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });

            }
        })
        .error(function() {
                    $.flxweb.hideLoading();
                    $.flxweb.showDialog("Could not get Group details.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });



        });
    }

    function confirmDeleteMemberFromGroup(group_name, group_id, member_id, member_name){
        $.flxweb.showDialog("Are you sure you want to remove " + member_name + " from " + group_name + "?",
        {
            'buttons': [
                {
                    'text': 'Remove',
                    'click': function(){
                        $(this).dialog('close');
		        deleteMemberFromGroup(group_id, member_id);
                    }
                },
                {
                    'text' : 'Cancel',
                    'click': function(){
                        $(this).dialog('close');
                    }
                }
            ]
        });
        return false;
    }
    function confirmLeaveGroup(group_name, group_id){
        $.flxweb.showDialog("Are you sure you want to leave the group " + group_name + "?",
        {
            'buttons': [
                {
                    'text': 'Leave',
                    'click': function(){
                        $(this).dialog('close');
		        deleteMemberFromGroup(group_id, "self");
                    }
                },
                {
                    'text' : 'Cancel',
                    'click': function(){
                        $(this).dialog('close');
                    }
                }
            ]
        });
        return false;
    }


    function deleteMemberFromGroup(group_id, member_id, member_name) {
        if(member_id == "self")
            $.flxweb.showLoading("Leaving from the group");
        else
            $.flxweb.showLoading("Deleting Group member");
        var del_member_url = webroot_url + 'ajax/delete/groupmember/';
        var data = {'memberID':member_id, 'groupID':group_id}
        $.post(del_member_url, data, function(res){
            $.flxweb.hideLoading();
            if(res != "null") {
                $('#groups_join_box').hide();
                res = $.parseJSON(res);
                if(res.result == true){
                    getMyGroups();
                } else {
                    if(member_id == "self"){
                        $.flxweb.showDialog("We couldn't remove you from the group. Please try again later.",{
                            'buttons' : {
                                'OK': function(){
                                    $(this).dialog('close');
                                }
                            }
                        });
                    }else{
                        $.flxweb.showDialog("Could not delete Group member. Please try again later.",{
                            'buttons' : {
                                'OK': function(){
                                    $(this).dialog('close');
                                }
                            }
                        });
                    }

                }
            } else {
                    $.flxweb.showDialog("Could not delete Group member.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });

            }

        })
        .error(function() {
                    $.flxweb.hideLoading();
                    $.flxweb.showDialog("Could not get Group details.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });


        });
    }

    function getShortName(name) {
        if(name.length < 10) {
            return name;
        } else {
            return name.substr(0,9)+'..';
        }
    }

    function createGroup() {
        var groupName = $.trim($('#createForm').find('#groupName').val());
        var groupDesc = $.trim($('#createForm').find('#groupDescription').val());
        var groupScope = 'closed';
        if($('#createForm').find('#groupScope').attr('checked') == 'checked') {
            groupScope = 'open';
        }
        if($.trim(groupName) == "") {
                    $.flxweb.showDialog("Group title cannot be empty.",{
                        'buttons' : {
                            'OK': function(){
                            	$('#createForm').find('#groupName').val(groupName);
                            	$('#createForm').find('#groupName').focus().select();
                                $(this).dialog('close');
                            }
                        }
                    });
                    return;

        }
        if($.trim(groupName) == "Group Title") {
                    $.flxweb.showDialog("Group title cannot be 'Group Title'.",{
                        'buttons' : {
                            'OK': function(){
                                $('#createForm').find('#groupName').val(groupName);
                                $('#createForm').find('#groupName').focus().select();
                                $(this).dialog('close');
                            }
                        }
                    });
                    return;
        }
        if((!groupName.match(RegExp('^([A-Z|a-z|0-9|\\\s])+$')) || (groupName.indexOf("|")!= -1))) {
                    $.flxweb.showDialog("Group title can contain only alphanumeric characters(A-z, 0-9) and whitespace.",{
                        'buttons' : {
                            'OK': function(){
                            	$('#createForm').find('#groupName').val(groupName);
                            	$('#createForm').find('#groupName').focus().select();
                                $(this).dialog('close');
                            }
                        }
                    });
            return;
        }
        $('#createForm').find('#groupName').val('');
        $('#createForm').find('#groupDescription').val('');
        $('#createForm').find('#groupScope').removeAttr('checked');
        $('#groups_create_box').hide();
        var create_group_url = webroot_url + 'ajax/create/group/';
        var data = {'groupName':groupName, 'groupDesc':groupDesc, 'groupScope':groupScope}
        $.flxweb.showLoading("Creating new Group ");
        $.post(create_group_url, data, function(res){
            $.flxweb.hideLoading();
            if(res != "null") {
                res = $.parseJSON(res);
                if('message' in res) {
                    if(res.message == 'group_exists') {
                        $.flxweb.showDialog("Group with the title '"+groupName+"' already exists. Please try using different Group title.",{
                            'buttons' : {
                                'OK': function(){
                                    $(this).dialog('close');
                                    return false;
                                }
                            }
                        });

                    } else{
                    $.flxweb.showDialog("Could not create Group. Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });
                    }
                } else {
                    getMyGroups();
                }
            } else {
                    $.flxweb.showDialog("Could not create Group. Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });

            }
        })
        .error(function() {
                    $.flxweb.hideLoading();
                    $.flxweb.showDialog("Could not get Group details.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });

        });
    }

    function updateGroup() {
        $.flxweb.showLoading("Updating Group");
        var groupName = $('#groupTitleEdit_'+current_group_id).attr('data-groupname');
        var newGroupName = $.trim($('#groupTitleEdit_'+current_group_id).val());
        var newGroupDesc = $.trim($('#groupdescedit_'+current_group_id).val());
        var groupScope = 'closed';
        if($('#groupScopeEdit_'+current_group_id).attr('checked') == 'checked'){
            groupScope = 'open';
        }
        if($.trim(newGroupName) == "") {
                    $.flxweb.showDialog("Group title cannot be empty.",{
                        'buttons' : {
                            'OK': function(){
                            	$.trim($('#groupTitleEdit_'+current_group_id).val(groupName));
                            	$('#groupTitleEdit_'+current_group_id).focus().select();
                                $(this).dialog('close');
                            }
                        }
                    });
                    return;

        }
        if((!newGroupName.match(RegExp('^([A-Z|a-z|0-9|\\\s])+$')) || (newGroupName.indexOf("|")!= -1))) {
                    $.flxweb.showDialog("Group title can contain only alphanumeric characters(A-z, 0-9) and whitespace.",{
                        'buttons' : {
                            'OK': function(){
                            	$('#createForm').find('#groupName').val(groupName);
                            	$('#createForm').find('#groupName').focus().select();
                                $(this).dialog('close');
                            }
                        }
                    });
            return;
        }
        var update_group_url = webroot_url + 'ajax/update/group';
        var data = {'groupName':groupName, 'newGroupName':newGroupName, 'newGroupDesc':newGroupDesc, 'groupScope':groupScope}
        $.post(update_group_url, data, function(res){
            $.flxweb.hideLoading();
            if(res != "null") { 
                res = $.parseJSON(res);
                if('message' in res) {
                    if(res.message == 'group_exists') {
                        $.flxweb.showDialog("Group with the title '"+newGroupName+"' already exists. Please try using different Group title.",{
                            'buttons' : {
                                'OK': function(){
                                	$.trim($('#groupTitleEdit_'+current_group_id).val(groupName));
                            		$('#groupTitleEdit_'+current_group_id).focus().select();
                                    $(this).dialog('close');
                                    return false;
                                }
                            }
                        });

                    } else{
                        $.flxweb.showDialog("Could not update Group. Please try again later.",{
                            'buttons' : {
                                'OK': function(){
                                    $(this).dialog('close');
                                    return false;
                                }
                            }
                        });
                    }
                } else {
                    getMyGroups();
                }
            } else {
                    $.flxweb.showDialog("Could not update Group. Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });

            } 
        })
        .error(function() {
                    $.flxweb.hideLoading();
                    $.flxweb.showDialog("Could not get Group details.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });


        });
        
    }
    

    
    function simpleUpdateGroup(textField) {
        
        
        var groupName = $('#groupTitleEdit_'+current_group_id).attr('data-groupname');
        var newGroupName = $.trim($('#groupTitleEdit_'+current_group_id).val());
        var newGroupDesc = $.trim($('#groupdescedit_'+current_group_id).val());
        var groupScope = 'closed';
        if($('#groupScopeEdit_'+current_group_id).attr('checked') == 'checked'){
            groupScope = 'open';
        }
        if($.trim(newGroupName) == "") {
                    $.flxweb.showDialog("Group title cannot be empty.",{
                        'buttons' : {
                            'OK': function(){
                            	$.trim($('#groupTitleEdit_'+current_group_id).val(groupName));
                            	$('#groupTitleEdit_'+current_group_id).focus().select();
                                $(this).dialog('close');
		                textField.next().html('');
                            }
                        }
                    });
                    return;

        }
        if((!newGroupName.match(RegExp('^([A-Z|a-z|0-9|\\\s])+$')) || (newGroupName.indexOf("|")!= -1))) {
                    $.flxweb.showDialog("Group title can contain only alphanumeric characters(A-z, 0-9) and whitespace.",{
                        'buttons' : {
                            'OK': function(){
                            	$('#createForm').find('#groupName').val(groupName);
                            	$('#createForm').find('#groupName').focus().select();
                                $(this).dialog('close');
		                textField.next().html('');
                            }
                        }
                    });
            return;
        }
        
        var update_group_url = webroot_url + 'ajax/update/group';
        var data = {'groupID':current_group_id, 'groupName':groupName, 'newGroupName':newGroupName, 'newGroupDesc':newGroupDesc, 'groupScope':groupScope}
        $.post(update_group_url, data, function(res){
            if(res != "null") { 
                res = $.parseJSON(res);
                
                if('message' in res) {
                    if(res.message == 'group_exists') {
                        $.flxweb.showDialog("Group with the title '"+newGroupName+"' already exists. Please try using different Group title.",{
                            'buttons' : {
                                'OK': function(){
                                	$.trim($('#groupTitleEdit_'+current_group_id).val(groupName));
                            		$('#groupTitleEdit_'+current_group_id).focus().select();
                                    $(this).dialog('close');
		                    textField.next().html('');
                                    return false;
                                }
                            }
                        });

                    } else{
                        $.flxweb.showDialog("Could not update Group. Please try again later.",{
                            'buttons' : {
                                'OK': function(){
                                    $(this).dialog('close');
		                    textField.next().html('');
                                    return false;
                                }
                            }
                        });
                    }
                } else {
                        new_group_code = res.group.accessCode;
                	$('.groupRow.active').attr('data-groupname', $('#groupTitleEdit_'+current_group_id).val());
                	$('.active #group_del_link_'+current_group_id).attr('data-groupname', $('#groupTitleEdit_'+current_group_id).val());
                	$('#groupTitleEdit_'+current_group_id).attr('data-groupname', $('#groupTitleEdit_'+current_group_id).val());
                        var new_join_url = '';
                        if(new_group_code == null) {	
                            new_join_url = webroot_url + 'join/group?groupName='+encodeURIComponent(newGroupName);
                        } else {
                            new_join_url = webroot_url + 'join/group?groupName='+encodeURIComponent(newGroupName)+'&accessCode='+new_group_code;
                        }
                	updateEditView(textField);
                        updateJoinInstructions(newGroupName,new_join_url,groupScope,new_group_code);
                }
            } else {
                    $.flxweb.showDialog("Could not update Group. Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
		                textField.next().html('');
                            }
                        }
                    });
                    
                    
                    

            } 
        })
        .error(function() {
                    $.flxweb.hideLoading();
                    $.flxweb.showDialog("Could not get Group details. Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
		                textField.next().html('');
                            }
                        }
                    });


        });
        
    }
    

  
    function updateJoinInstructions(new_group_name,new_join_url,new_group_type,new_group_code) {
        gp_ins_group_name = $('#group_'+current_group_id).find('#gp_ins_group_name');
        gp_join_url_help = $('#group_'+current_group_id).find('#gp_join_url_help');
        gp_ins_group_code_text = $('#group_'+current_group_id).find('#gp_ins_group_code_text');
        gp_ins_group_code = $('#group_'+current_group_id).find('#gp_ins_group_code');
        gp_join_url_help = gp_join_url_help.attr('href',new_join_url);
        gp_join_url_help.text(new_join_url);
        gp_ins_group_name.text(new_group_name);
        if(new_group_type == 'open') {
            $('#groupScopeEdit_'+current_group_id).attr('checked','checked');
            gp_ins_group_code_text.html('');
            $('#gpCode_'+current_group_id).html('-');
        } else {
            $('#groupScopeEdit_'+current_group_id).removeAttr('checked');
            gp_ins_group_code_text.html(' and the access code <span id="gp_ins_group_code">'+new_group_code+'</span>');
            $('#gpCode_'+current_group_id).html(new_group_code);
        }
    }
    
    function updateEditView(textField){
	    var htmlText = $('#savedState').html();
		textField.next().html(htmlText);

	    }

    function addGroupEntry(group){
        var group_header = "<div width='100%'><span class='prefix_1'>Title</span>";
        group_header += "<span class='prefix_1'>Code</span>";
        group_header += "<span class='prefix_1'>My Role</span></div>";
        $('#groupmgmtheader').html(group_header);
        $('#groupmgmt').accordion('destroy');
        var groupEntries = $('#groupmgmt').html();
        var new_entry = "<h3><a data-groupid="+group.id+" data-groupname='"+group.name+"' id='group_"+group.id+"' href='#'><span class='prefix_1 gpTitle'>";
        new_entry += group.name;
        new_entry += "</span><span  id='gpCode_"+group.id+"'class='prefix_1 gpCode'> "+group.accessCode;
	var groupRole = null;
        if (group.role == 'group admin') {
	    groupRole = 'Admin';
       	}
	else {
	    groupRole = 'Member';
	}
        new_entry += "</span><span id='gpRole_" + group.id + "' class='prefix_1 gpRole'>" + groupRole + "</span></a></h3>";
        new_entry += "<div id='groupdesc_"+group.id+"'>"+group.description+"</div>";
        groupEntries += new_entry;
        $('#groupmgmt').html(groupEntries);
    }

    function getMyGroups(){
	/*$.flxweb.showLoading("Loading Groups"); */
	$('#groupmgmt').html(loading_div);
        var my_groups_url = webroot_url + 'ajax/groups/my';
        $.get(my_groups_url, function(res){
            //$.flxweb.hideLoading();
            if(res != "null") {
                res = $.parseJSON(res);
                if('message' in res) {
                    $.flxweb.showDialog("Could not fetch Groups. Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });
                } else {
                    fillGroupViewer(res)
                }
            } else {
                    $.flxweb.showDialog("Could not fetch Groups. Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });

            }
        })
        .error(function() {
                    $.flxweb.hideLoading();
                    $.flxweb.showDialog("Could not get Group details.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });


        });

    }

    function isGroupExist(group_name) {
        var group_details_url = webroot_url + 'ajax/group/details';
        var data = {'groupName':group_name}
        $.post(group_details_url, data, function(res){
            if(res != "null") {
                res = $.parseJSON(res);
                if('message' in res){
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        });
    }

    function getGroupDetails(group_dict) {
        var group_details_url = webroot_url + 'ajax/group/details';
        var data = {'groupID':group_dict['new']['id']}
        $.post(group_details_url, data, function(res){
            if(res != "null") {
                res = $.parseJSON(res);
                if('message' in res) {
                    $.flxweb.showDialog("Could not fetch Group details. Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });

                } else {
                    $('#groupTitle_'+group_dict['new']['id']).text('');
                    buildGroupEntryEditor(group_dict, res)
                }
            } else {
                    $.flxweb.hideLoading();
                    $.flxweb.showDialog("Could not get Group details.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });

            }
        })
        .error(function() {
                    $.flxweb.hideLoading();
                    $.flxweb.showDialog("Could not get Group details.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                            }
                        }
                    });


        }); 
    }

    var current_group_id = 'none';

    function buildGroupEntryEditor(group_dict, group_detail_res) {
        var new_group_id = group_dict['new']['id'],
            new_group_name = group_dict['new']['name'],
            groupName = new_group_name,
            members = group_detail_res.members,
            type = group_detail_res.type,
            member= null, i, role,
            tmpl_data = null,
            editor_view = null,
            group_row = null;
            if(type == 'open'){
                join_url =  webroot_url + 'join/group?groupName='+encodeURIComponent(groupName)
            } else {
                join_url =  webroot_url + 'join/group?groupName='+encodeURIComponent(groupName)+'&accessCode='+group_detail_res.accessCode
            }
        
        current_group_id = new_group_id;
        
        //mark admin member
        for (i=0;i<members.length; i+=1){
            member = members[i];
            member.is_admin = false;
            role = $.trim(member.role).toLowerCase();
            if (role === 'group admin'){
                member.is_admin = true;
            }
        }
        
        //data to pass onto the template
        tmpl_data = {
            'id' : current_group_id,
            'name': groupName,
            'accessCode': group_detail_res.accessCode,
            'members': members,
            'description': group_detail_res.description,
            'type': type,
            'join_url': join_url
        };
        
        editor_view = edit_template(tmpl_data)
        
        // memberViewContainer = '<div class="memberViewContainer" id="groupmemberlist_'+new_group_id+'">';
        // $.each(group_detail_res['members'], function(){
            // member_role = $.trim(this.role).toLowerCase();
            // if(member_role == 'group admin') {
                // memberViewContainer += '<span class="memberView">'+this.name+'</span>&nbsp;&nbsp;';
            // } else {
                // memberViewContainer += '<span class="memberView">'+this.name+' <a href="#" id="gpMemberDel" data-memberid="'+this.id+'" data-groupname="'+new_group_name+'" style="color:green;">X<a></span>&nbsp;&nbsp;';
            // }
        // });
        //memberViewContainer += '</div>';
        // memberViewContainer += '<div class="prefix_10 grid_2"><a class="btn open" href="#" style="margin-left:35%" id="groups_update">Save</a></div>'
        // $('#groupTitle_'+new_group_id).remove();
        
        // $('#groupbody_'+new_group_id).html("<textarea name='groupDescription' id='groupdesc_"+new_group_id+"' rows='5' cols='20' class='inputfield' style='width:22%'>"+group_detail_res.description+"</textarea>"+memberViewContainer);
        $('#groupbody_'+new_group_id).html(editor_view);
        
        // $('<input type="text" name="groupName" id="groupTitle_'+new_group_id+'" data-groupname="'+groupName+'" value="'+groupName+'" class="inputfield" style="width:22%"/>').insertBefore($('#groupdesc_'+new_group_id));
        //$('#gpCode_'+new_group_id).insertBefore($('#groupdesc_'+new_group_id));
        //$('#gpRole_'+new_group_id).insertBefore($('#groupdesc_'+new_group_id));
        // $('<a href="#" data-groupname="'+new_group_name+'" id="group_del_link" class="gpDelLink" style="color:green;">Delete</a>').insertBefore($('#groupdesc_'+new_group_id));
        // $('<br />').insertBefore($('#groupdesc_'+new_group_id));
        // $('<br />').insertBefore($('#groupdesc_'+new_group_id));
        // $('<div class="gpEditorDivider"></div>').insertBefore($('#groupdesc_'+new_group_id));
        // $('#groupbody_'+new_group_id).css('height','1%');
        
        group_row = $("#group_"+current_group_id);
        $(group_row).css("height", $(group_row).children(":first").height() + 30);
        
    }

    function fillGroupViewer(groups){
        if(groups.length > 0){
            var group_header = "<div width='100%'><span class='prefix_1'>Title</span>";
            group_header += "<span class='prefix_1'>Code</span>";
            group_header += "<span class='prefix_1'>My Role</span></div>";
            $('#groupmgmtheader').html(group_header);
        } else {
            $('#groupmgmtheader').html('');
            $('#groupmgmt').html('<div class="noGroupsMessage">You don\'t have any groups.  Start by creating a new group or joining an existing group.</div>');
            return false;
        }
        var groupEntries = "";
        $.each(groups, function(){

            if (this.role.toLowerCase() == 'group admin') {
	        this.role = 'Admin';
       	     }
	    else {
	         this.role = 'Member';
	     }

            var row = row_template(this);
            var new_entry = row;
            // new_entry = "<h3><a data-groupid="+this.id+" data-groupname='"+this.name+"' id='group_"+this.id+"' href='#' title='"+this.name+"'><span id='groupTitle_"+this.id+"' class='prefix_1 gpTitle'>";
            // new_entry += getShortName(this.name);
            // new_entry += "</span><span  id='gpCode_"+this.id+"'class='prefix_1 gpCode'> "+this.accessCode;
            // new_entry += "</span><span id='gpRole_"+this.id+"' class='prefix_1 gpRole'>"+this.role+"</span></a></h3>";
            // new_entry += "<div id='groupbody_"+this.id+"'>"+this.description+"</div>";
            groupEntries += new_entry;
        });
        $('#groupmgmt').html(groupEntries);
        $('.groupRows .groupRow:even').addClass("alternate");
	$('.Admin .groupbody').html(loading_div);
    }

    function showMemberHelpIcon(evt, level){
        if(level == 1){
            $('.members_help_icon').addClass('show').removeClass('hide');
        }else{
            $(evt).addClass('highlight').removeClass('show');
        }
    }

    function hideMemberHelpIcon(evt, level){
        if(level == 1){
            $('.members_help_icon').addClass('hide').removeClass('show');
        }else{
            $(evt).addClass('show').removeClass('highlight');
        }
    }

    function showHelpIcons(evt, level){
        if(level == 1){
            $('.grid_icons').toggleClass('show').toggleClass('hide');
        }else{
            $(evt).toggleClass('highlight').toggleClass('show');
        }
    }

    function hideHelpIcons(evt, level){
        if(level == 1){
            $('.grid_icons').toggleClass('hide').toggleClass('show');
        }else{
            $(evt).toggleClass('show').toggleClass('highlight');
        }
    }

    $(document).ready(domReady);
});

