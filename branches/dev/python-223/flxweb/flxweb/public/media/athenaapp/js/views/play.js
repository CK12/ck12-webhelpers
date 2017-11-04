define([
    "jquery",
    "practiceapp/views/appview",
    "practiceapp/templates/templates",
    "groups/controllers/assignment.edit",
    "common/utils/concept_coversheet",
    "practiceapp/views/teacher.home"
], function ($, AppView, Templates, AssignmentEditController, coverSheet, TeacherHomeView) {


    // GLOBALS
    var iframe = null; // created by postRender
    var context = null;
    var controller = null;

    function bindIframeEvents(iframe) {
        window.addEventListener("resize", function(event) {
            iframe.setAttribute("height", window.innerHeight);
            iframe.setAttribute("width", window.innerWidth);
        });
        return null;
    }

    /**
     * @context PlayView
     */
    function bindViewEvents() {
        this.on("activate", function() {
            return null;
        });
    }

    /**
     * @constructor
     * Render the current configuration of the athena app, which was set via EditView
     */
    var PlayView = AppView.extend({

        initialize: function() {
            self = this;
            PlayView.__super__.initialize.apply(this, arguments); // run parent class init first
            this.postRender();
        },

        // Get the lab info
        postRender: function() {
            var URI = this.options.URI || null; // passed via controller
            context = this.config.app_name;
            controller = this.controller;
            iframe = document.createElement("iframe");
            // fixes double scrolling bar
            $(document.body).css({
                "overflow-y": "hidden"
            });
            document.body.appendChild(iframe);
            $(iframe).css({
                position: "absolute",
                top:0,
                left:0,
                "z-index":100000
            });

            iframe.setAttribute("frameborder", 0);
            iframe.setAttribute("height", window.innerHeight);
            iframe.setAttribute("width", window.innerWidth);

            // Fallback in case the URI wasn't set properly.
            if (URI === null) {
                document.body.removeChild(iframe);
                $(".message-container").html("You have not selected any content. Please start from the main screen, search or browse for your desired material, and insert it by clicking the 'Add' button.");
                $(".message-container").removeClass("hide");
            }
            else {
                // Bug #45588 fix URI that is missing hostname
		if (URI.search("http") === -1){
                    var _path = URI.substr(URI.search("#"));
                    URI = "https://"+window.location.hostname + "/embed" + _path;
                }
                iframe.setAttribute("src", URI);
            }

            bindIframeEvents(iframe);
            bindViewEvents.call(this);
        },

        destroy: function(){
            var that = this;
            $(".message-container").addClass("hide");
            this.trigger("playViewClose"); // finished
            $(iframe).remove();
            that.remove();
        }

    });

    return PlayView;
});
