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
define('flxweb.groups.search',
        ['jquery',
        'jquery-ui',
        'flxweb.global','flxweb.utils.base64','flxweb.utils.url'],
function($,UI,global,Base64,Url) {
    
    var row_template = null, group_details = {}, edit_template = null, loading_div = null;
    var prev_active_gp_id = null;
    //$.flxweb.showLoading("Loading Groups");
    
    function domReady() {
        $('.group_search_result_join').click(function(e){
            group_name = $(e.target).attr('data-groupname');
            group_id = $(e.target).attr('data-groupid');
            if(group_name) {
                $('#search_group_before_join_holder_'+group_id).append($('#join_group_loader_img').clone());
                $('#search_group_before_join_holder_'+group_id).find('#join_group_loader_img').attr('id','search_group_before_join_loader_'+group_id);
                join_open_group(group_name, group_id);
            }
            return false;
        });
    }

    function join_open_group(group_name, group_id) {
        
        var join_group_url = webroot_url + 'ajax/join/group/';
        var data = {'accessCode':'', 'groupName':group_name}
        $.post(join_group_url, data, function(res){
            if(res != "null") {
                res = $.parseJSON(res);
                if('message' in res){
                    if(res.message == 'no_such_group') {
                        $.flxweb.showDialog("There is no such group: "+groupName,{
                            'buttons' : {
                                'OK': function(){
                                    $(this).dialog('close');
                                    $('#search_group_before_join_loader_'+group_id).remove();
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
                                        $('#search_group_before_join_loader_'+group_id).remove();
                                        return false;
                                    }
                                }
                            });

                        }
                    }
                    return;
                }
                if(res.result == true){
                    var after_join_group_msg = '<div id="search_group_after_join_holder_'+group_id+'" style="float:right; visibility:visible;width:10%;margin-right:7%; color:#777;">Joined <span id="search_group_result_join_btn"></span></div>';
                    $('#search_group_before_join_holder_'+group_id).replaceWith(after_join_group_msg);
                } else {
                    $.flxweb.showDialog("Could not join Group.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                                $('#search_group_before_join_loader_'+group_id).remove();
                                return false;
                            }
                        }
                    });
                } 
           
            } else {
                    $.flxweb.showDialog("Could not join Group.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                                $('#search_group_before_join_loader_'+group_id).remove();
                                return false;
                            }
                        }
                    });

            }
        })
        .error(function() {
                    $.flxweb.hideLoading();
                    $.flxweb.showDialog("Could not join group.  Please try again later.",{
                        'buttons' : {
                            'OK': function(){
                                $(this).dialog('close');
                                $('#search_group_before_join_loader_'+group_id).remove();
                                return false;
                            }
                        }
                    });


        });
    }
    $(document).ready(domReady);
});
