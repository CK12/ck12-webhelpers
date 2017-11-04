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
define('flxweb.details.feedbackreview', 
        ['jquery', 'jquery-ui', 'flxweb.global',
        'flxweb.library.common', 'flxweb.edit.resource',
        'jquery.scrollTo'
        ],

function ($, UI, global, Library) {

    function showfeedbackpopup(v,id,comments) {
        $('.feedbackpopup').height('190px');
        $('#profane_message').text('');
        //Bug 11742 If comment exist sending it to save.  
        if(!comments) {
        	comments='';
        }
        var myoldvote = $('#top_edit_review').data('myvote');
        
        var vote = v == '1' ? 'voteyes' : 'voteno';
        setLikeDislikeStyle(v);
        $('.feedbacktextarea').val(comments);
        
       
        
        // if user has a vote, show 'remove' else show 'cancel'
        /*if (myoldvote == 0) {
            $('.feedbackbtn_remove').addClass('hide');
            $('.feedbackbtn_cancel').removeClass('hide');
        } else {
            $('.feedbackbtn_remove').removeClass('hide');
            $('.feedbackbtn_cancel').addClass('hide');
        }*/
        $('.feedbackpopup').removeClass('hide').removeClass('voteyes').removeClass('voteno');
        $('.feedbackpopup').addClass(vote);
        

        var artifactID = id;
        //save like dislike click api call.
        var render_url = webroot_url + 'review/feedback?artifactID=' + artifactID + '&vote=' + v +'&comments=' + comments ;
        $.ajax({
            url: render_url,
            cache: false,
            dataType: 'json'
        });
        
        
        if (v != myoldvote) {
            updatepercentage(v, false);
        }
        $('.feedbackbtn_remove').data('myvote', $(this).data('vote'));
        $('.feedbackbtn_remove').data('voted',true);
        
        updateCommentLengthCount();
        return false;
    }

    function setLikeDislikeStyle(vote) {
        if (vote == '1') {
            $('.imgwrap.yes.artifactfeedbackaction').removeClass('yes').addClass('like');
            $('.imgwrap.dislike.artifactfeedbackaction').removeClass('dislike').addClass('no');
            $('.washelpful_js').addClass('hide');
            $('#top_edit_review').removeClass('hide');
            $('#top_edit_review').data('myvote',1);
        } else if(vote == '-1'){
            $('.imgwrap.no.artifactfeedbackaction').removeClass('no').addClass('dislike');
            $('.imgwrap.like.artifactfeedbackaction').removeClass('like').addClass('yes');
            $('.washelpful_js').addClass('hide');
            $('#top_edit_review').removeClass('hide');
            $('#top_edit_review').data('myvote',-1);
        }else {
            $('.feedbackpopup').removeClass('voteyes').removeClass('voteno');
            //reset the thump up/down to default grey states
            $('.artifactfeedbackaction').find('.like').removeClass('like').addClass('yes');
            $('.artifactfeedbackaction').find('.dislike').removeClass('like').addClass('no');
            $('.washelpful_js').removeClass('hide');
            $('#top_edit_review').addClass('hide');
            $('#top_edit_review').data('myvote',0);
        }
    }

    function donefeedback() {
        var feedbackClass = $('.feedbackpopup').attr('class');
        $('.feedbacktextarea').val("");
        
        if (feedbackClass && (feedbackClass.indexOf('voteyes') != -1 || feedbackClass.indexOf('voteno') != -1)) {
            var vote = feedbackClass.indexOf('voteyes') == -1 ? 'dislike' : 'like';
            if (vote == 'like') {
                $('#review_up').find('span').removeClass('hide like yes').addClass(vote);
                $('#review_down').find('span').removeClass('hide dislike no').addClass('no');
            } else {
                $('#review_up').find('span').removeClass('hide like yes').addClass('yes');
                $('#review_down').find('span').removeClass('hide dislike no').addClass(vote);
            }
            //$('.artifactvotingfeedbackthanks span').attr("title", vote == "like" ? "Helpful" : "Not helpful");
            $('.editreviewfeedback_js').removeClass('hide');
        }
        $('.feedbackpopup').addClass('hide');
        return false;
    }

    function hideFeedbackPopup() {
        $('.feedbackpopup').addClass('hide');
    }

    function updatepercentage(myvote,remove) {
     
        var likes = $('.feedbackpercentage').data('like');
        var dislikes = $('.feedbackpercentage').data('dislike');
        var memberid = $('.editreviewfeedback_js').data('memberid');
        var voted = $('.feedbackbtn_remove').data('voted');
        
        if (remove == true) {
            if (myvote == 1) {
                likes = likes > 0 ? likes - 1 : likes;
            } else {
                dislikes = dislikes > 0 ? dislikes - 1 : dislikes;
            }
        } else {
            if (voted == true) {
                if (myvote == 1) {
                    likes += 1;
                    dislikes = dislikes > 0 ? dislikes - 1 : dislikes;
                } else {
                    likes = likes > 0 ? likes - 1 : likes;
                    dislikes += 1;
                }
            } else {
                if (myvote == 1) {
                    likes += 1;
                } else {
                    dislikes += 1;
                }
            }
            
            // memeber feedback may exist, need to remove div from HTML as it is changing only like , dislike
            // and not yet submitted changed comment.  
            $('#'+memberid).remove();
        }
        var total = likes + dislikes;
        var parc = total != 0 ? parseInt((likes / (likes + dislikes)) * 100) : 0;
        var html = '<div class="feedbackpercentage" data-dislike="' + dislikes + '" data-like="' + likes + '"><div class="formleftcolumn"><span class="feedbacktitle"> ' + parc + ' % of people thought this content was helpful. </span></div><span class="feedbacktitle"><span class="imgwrap like" title="Helpful"></span><span class="vote like"> ( ' + likes + ' ) </span><span class="imgwrap dislike" title="Not helpful"></span><span class="vote dislike"> ( ' + dislikes + ' ) </span></span></div>';
        
        $('.feedbackpercentage').replaceWith(html);
    }

    function feedbackaction() {

        var artifactID = $(this).data('artifactid');
        var comments =  encodeURIComponent($('.feedbacktextarea').val());
        var vote = $('.feedbackpopup').attr('class').indexOf('voteyes') == -1 ? -1 : 1;
        var render_url = webroot_url + 'review/feedback?artifactID=' + artifactID + '&comments=' + comments + '&vote=' + vote;

        if ($.trim($('.feedbacktextarea').val()) != "") {
            showLoading();
            $.ajax({
                url: render_url,
                cache: false,
                dataType: 'json',
                success: statusSuccess,
                error: statusError
            });
        }

        function statusSuccess(json_status) {
        
            if(json_status && json_status['isProfane']===true){
                $('.feedbackpopup').height('230px'); 
                $('#profane_message').text('We noticed that your review has abusive language. Please modify it and re-submit it.');
                stopLoading();
                return false;
            } else if (json_status && json_status['comments']) {
                $(document).scrollTo($('#feedback'));
                var responsevote;
                var totalreviews = $('.loadmorereviewfeedback_js').data('totalreviews');
                var userfullname = $('.fullname span').text();
                var comments = $('<div/>').text(json_status['comments']).html();
                if (json_status['score'] == 1) {
                    responsevote = '<a class="likeicon" title="Helpful"><span class="imgwrap"></span></a>';

                } else {
                    responsevote = '<a class="dislikeicon" title="Not helpful"><span class="imgwrap"></span></a>';
                }
                var html = '<div id="' + json_status['memberID'] + '" class="feedbacksection">' + '<div class="feedbackauth"><span class="membername"> ' + userfullname + ' </span><span class="date"> ' + json_status['creationTime'] + '</span> <span> ' + responsevote + ' </span> </div><div class="feedbackcomment"> ' + comments + ' </div><div class="divider spacetop"></div></div>' + '</div>' ;

                if (json_status['memberID'] && json_status['memberID'] != "") {
                    var idd = "#" + json_status['memberID'];
                    if ($(idd).length) {
                        $(idd).remove();
                    } 
                    $(html).insertAfter('.reviewfeedbackhead');
                    
                } else {
                    $(html).insertAfter('.reviewfeedbackhead');
                    totalreviews = totalreviews + 1 ;
                }
                $('.editreviewfeedback_js').data('mycomment', comments);
                $('.editreviewfeedback_js').data('memberid', json_status['memberID']);
                $('.editreviewfeedback_js').data('myvote', json_status['score']);
                $('.feedbackbtn_remove').data('myvote',json_status['score']);
                $('.feedbackbtn_remove').data('memberid',json_status['memberID']);
                $('.feedbackbtn_remove').data('voted',true);
                
                $('.loadmorereviewfeedback_js').data('totalreviews' , totalreviews);
                showhideloadmore();
                donefeedback();
                stopLoading();
            }

           
        }

        function statusError(json_status) {}
        
        
        return false;
    }
    
    function showhideloadmore(){
        var totalreviews = $('.loadmorereviewfeedback_js').data('totalreviews');
        var currantpage = $('.loadmorereviewfeedback_js').data('pagenum');
        var morereviews = totalreviews - (currantpage * 5); 
        if (morereviews > 0) {
            $('.loadmorereviewfeedback_js').removeClass('hide')
        } else {
            $('.loadmorereviewfeedback_js').addClass('hide')
        }
    }


    function loadmorereviewfeedback() {
        showLoading();
        var artifactID = $(this).data('artifactid');
        var pagenum = 1 + $(this).data('pagenum');
        var render_url = webroot_url + 'review/feedback/loadfeedback?artifactID=' + artifactID + '&pageNum=' + pagenum + '&pageSize=' + 5;
        $.ajax({
            'url': render_url,
            'success': function (datahtml) {
                loadMoreSuccess(datahtml);
            }
        });

        function loadMoreSuccess(datahtml) {
            $('.reviewslist').append(datahtml);
            stopLoading();
        }
        $('.loadmorereviewfeedback_js').data('pagenum', pagenum);
        showhideloadmore();
        return false;
    }

    function showLoading() {
        $('#reviewfeedback_loading_div').removeClass('hide');
    }

    function stopLoading() {
        $('#reviewfeedback_loading_div').addClass('hide');
    }

    function editfeedback() {
        showLoading();
        var artifactID = $(this).data('artifactid');
        var render_url = webroot_url + 'review/feedback/myfeedback?artifactID=' + artifactID;
        $.ajax({
            url: render_url,
            cache: false,
            dataType: 'json',
            success: statusSuccess
        });

        function statusSuccess(json_status) {
            if (json_status) {
                var score = json_status['vote']['score'];
                var comments = json_status['vote']['comments'];
                setLikeDislikeStyle(score);
                $('.feedbacktextarea').val(comments);
                $('.feedbackpopup').addClass(score == '1' ? 'voteyes' : 'voteno');
                showfeedbackpopup(score,artifactID,comments);
                
                updateCommentLengthCount();
                $('.feedbackbtn_remove').data('voted',true);
                $('.feedbackbtn_remove').data('myvote',score);
            }
            stopLoading();
        }
    }
    
    function updateCommentLengthCount(){
        var artifactComment = $.trim($("#txt_feedback").val()).toLowerCase();
        $('.var_comment').text(artifactComment.length + " / "  + $("#txt_feedback").attr('maxlength'));
    } 
   
    function removefeedback() {
        showLoading();
        var artifactID = $(this).data('artifactid');
        var memberID = $(this).data('memberid');
        var myvote = $('#top_edit_review').data('myvote');
        var render_url = webroot_url + 'review/feedback/removemyfeedback?artifactID=' + artifactID + '&votetype=vote';
        $.ajax({
            url: render_url,
            cache: false,
            dataType: 'json',
            success: statusSuccess
        });

        function statusSuccess(json_status) {

            if (json_status && json_status['feedback_delete_status'] == true) {

                //remove comment if present 
                var idd = "#" + memberID;
                if ($(idd).length) {
                    $(idd).remove();
                }
                // set flag voted to false
                $('.feedbackbtn_remove').data('voted',false);
                
                // change % count   
                updatepercentage(myvote, true);

                //reset top actions to default 
                setLikeDislikeStyle(0);

                //hide edit and remove actions
                $('.editreviewfeedback_js').addClass('hide');

                //hide the feedback popup
                $('.feedbackpopup').addClass('hide');
            }
            stopLoading();
        }

    }

    function cancelFeedback() {
        setLikeDislikeStyle(0);
        hideFeedbackPopup();
        return false;
    }

    function domReady() {
        $('.artifactfeedbackaction_js').click(function() {
            showfeedbackpopup($(this).data('vote'),$(this).data('artifactid'),$(this).data('comments'));
        });
        $('.feedbackbtn_js').click(feedbackaction);
        $('.editreviewfeedback_js').click(editfeedback);
        $('#top_edit_review').click(editfeedback);
        $('.loadmorereviewfeedback_js').click(loadmorereviewfeedback)
        $('.feedbackbtn_skip').click(donefeedback);
        $('.feedbackbtn_remove').click(removefeedback);
        $('.feedbackbtn_cancel').click(cancelFeedback);
           
        $('body').live('click', function (e) {
            var trg = "" + e.target.className;
            if (trg && trg.indexOf("feedback") == -1) {
                donefeedback();
            }
        });
        $('body').keypress(function (e) {
            if (e.keyCode == 27) { //KEY_ESC:
                donefeedback();
            }
        });
        
        $('#txt_feedback').keypress(function() {
           $('.var_comment').text($('#txt_feedback').val().length + " / "  + $('#txt_feedback').attr('maxlength'));
        });
       
    }
    $(document).ready(domReady);
});
