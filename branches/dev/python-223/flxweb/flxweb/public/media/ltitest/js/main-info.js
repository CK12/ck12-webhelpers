require.config({
    "baseUrl":"/media"
});

require(['require.config'], function(){
    require(['_main']);
});


define("_main", function (require) {
    "use strict";
    var $ = require("jquery");
    var _ = require("underscore");
    require("fn/vendor/custom.modernizr");
    require("fn/foundation.min");

    var infotmpl = '<div class="row" ><div class="key"><strong><%= data.key %></strong></div><div class="val"><%= data.val %></div></div>';
    var appLaunchURL = "https://zenit.ck12.org/ltitest/info/";

    // Hollow console
    if (typeof console === "undefined" || typeof console.log === "undefined") {
        console = {};
        console.log = function() {};
    }
    //initialize foundation framework and any its plugins
    $(document).foundation();

    function getLTIInfo(){
        var _d = $.Deferred();
        _d.resolve(window.initializationInfo);
        return _d.promise();
    }

    function init(){
        getLTIInfo().done(function(ltiInfo){
            var row = null;
            _(ltiInfo).each(function(v,k){
                row = _.template(infotmpl,{key:k,val:v},{variable:'data'});
                $("#ltiinfo").append(row);
            });
            $(".js_userid").text( ltiInfo.user_id );
            $(".js_role").text( ltiInfo.roles );
            $(".js_name").text( ltiInfo.lis_person_name_full );
            $(".js_email").text( ltiInfo.lis_person_contact_email_primary );
            
            if(!ltiInfo.mode){
                $("#ltiaction_assign").removeClass("hide");
                $("#ltiaction_assign").on("click", ".js_assign_btn", function(){
                    var redirect_params, launch_url, redirect_url;
                    var assignment_desc = $.trim( $("#txt_assignment_desc").val() ); 
                    if (assignment_desc){
                        redirect_params =  "?mode=1&assignment_desc=ASSIGNMENT_DESC";
                        launch_url = appLaunchURL + redirect_params.replace('ASSIGNMENT_DESC', encodeURIComponent(assignment_desc));
                        redirect_params = "?embed_type=basic_lti&url=" + encodeURIComponent(launch_url);
                        redirect_url = initializationInfo.launch_presentation_return_url + redirect_params;
                        console.log(redirect_url);
                        //window.location.href = redirect_url;
                    }
                });
            } else {
                $("#ltiaction_assign").addClass("hide");
                if ( parseInt(ltiInfo.mode) === 1){
                    if (ltiInfo.lis_result_sourcedid){
                        //Student taking an assignment
                        $("#ltiaction_submit").removeClass("hide");
                        var score = Math.round(Math.random()*100)/100;
                        $(".js_score").text(score);
                        $(".js_desc").text(ltiInfo.assignment_desc);
                        $("#ltiaction_submit").on('click', '.js_submit_btn', function(){
                            $.ajax({
                               url: '/ltitest/submitScore',
                               method:'post',
                               data: {
                                   launchID: ltiInfo.launchID,
                                   score: score,
                                   answer: $("#txt_answer").val()
                               } 
                            }).done(function(data){
                                console.log(data);
                                $(".js_score_container").removeClass('hide');
                                $(".js_submitscore_container").addClass('hide');
                            });
                        });
                    } else {
                        //Teacher view
                        console.log("!!");
                        $("#ltiaction_teacher").removeClass("hide");
                    }
                }
            }
            
            
        });
    }

    init();
});
