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
 * This file originally written by Naman Jain
 *
 */
define('flxweb.guided_practice',[
    'backbone',
    'underscore',
    'jquery',
    'text!templates/guided_practice_template.html',
    'common/utils/assessmentFrameListener',
    'jquery-ui',
    'flxweb.global'
], function(Backbone, _, $, modalTemplate, frameListener, X1, X2) {

    var GuidedPractice = Backbone.View.extend({
        template : _.template('<li><div class="guided-practice-question"><%= content %></div><a data-qid="<%= qid %>" class="js-guided-practice">Try It <i class="icon-arrow_right"></i></a></li>'),
        initialize: function() {
            var eid = $(this.el).attr("data-eid"),
            artifactID = $(this.el).attr("data-artifactid");
        //exit if the element does not exist
        if ($(this.el).length === 0 || eid === "" || artifactID === "") {
          return;
        }

        if($("#guidedPracticeModal").length === 0){ //create modal for guided practice at initialization
          $("body").append($(modalTemplate).find("#guidedPracticeModal"));
          $("#guidedPracticeModal").off("click.guided-modal").on("click.guided-modal", ".js-guided-modal-close", function(){
            $("#guidedPracticeModal").foundation("reveal", "close");
          });

          $("#guidedPracticeModal").on("close", function(){
              $("#guidedPracticeModal").find(".iframe-container").removeAttr("src");
          });
        }

        frameListener.init({
          "apis" : ['resize'],
          "container" : $("#guidedPracticeModal").find(".iframe-container")
        });

        if(window.ck12_signed_in){
          this.loadGuidedPracticeQuestions(eid, artifactID);
        }else{
          this.showLoginPrompt();
        }

      },

        events : {
            'click .js-guided-practice' : 'openGuidedPractice',
            'click .js-open-practice' : 'openPractice',
            'click .dropdowntop' : 'toggleDropdown'
        },

        render : function (test) {
            var self = this,
                html = [],
                question = null;

            for(var i = 0; i < test.items.length; i++){
                question = test.items[i].object;
                if(question._id && question.questionData){
                    html.push(self.template({
                        "qid" : question._id,
                        "content" : question.questionData.stem.displayText
                    }));
                }
            }
            $(self.el).find(".guided_practice_container").attr("data-testid", test._id);
            $(self.el).find(".guided_practice_container").html(html.join(""));
            $(".js_renderlink_pdf").attr("href",test.workSheetUrls.pdf.withoutAnswer);
            $(".js_renderlink_html").attr("href",test.workSheetUrls.html.withoutAnswer);
            $(".js_renderlink_pdf_withAns").attr("href",test.workSheetUrls.pdf.withAnswer);
            $(".js_renderlink_html_withAns").attr("href",test.workSheetUrls.html.withAnswer);
            $(self.el).removeClass("hide");
        },

        showLoginPrompt : function(){
            var self = this,
                title = $(self.el).attr("data-name") || "",
                template = $(modalTemplate).find("#guidedLoginTemplate").html();

            template = template.replace(/@@concept@@/, title);

            $(self.el).html(template);
            $(self.el).removeClass("hide");
        },

        loadGuidedPracticeQuestions : function(eid, artifactID){
            var removeId, self=this;
            $.ajax({
                url: window.webroot_url + "assessment/api/get/detail/test/guided practice/encodedid/" + eid + "/" + artifactID,
                success: function(data) {
                    if(data.responseHeader.status === 0){
                        if (js_modality_data && js_modality_data.artifact && js_modality_data.artifact.creator === 'CK-12') {
                            window.GuidedPracticeExists = true;
                            if (js_modality_data.artifact.encodedID.match('MAT')) {
                                removeId = '#x-ck12-RXhwbG9yZSBNb3Jl';
                            } else if (js_modality_data.artifact.encodedID.match('SCI')) {
                                removeId = '#x-ck12-UmV2aWV3';
                            }
                            if (removeId && $(removeId).length) {
                                $('#modality_content').find(removeId).nextUntil('h3').andSelf().remove();
                            }
                        }
                        self.render(data.response.test);
                    }else if(data.responseHeader.status === 1009){
                        self.showLoginPrompt();
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error(textStatus);
                },
                dataType:'json'
            });
        },

        openGuidedPractice : function(e){
            var self = this,
                qid = $(e.currentTarget).attr("data-qid"),
          $guidedPracticeModal = $("#guidedPracticeModal"),
                testId = $(self.el).find(".guided_practice_container").attr("data-testid"),
          $iframeContainer = $guidedPracticeModal.find(".iframe-container"),
          $header = $guidedPracticeModal.find('.guided-modal-header').first();
  

          $iframeContainer[0].onload = function () {
            if ( ! this.contentWindow.ae ) {
              console.debug('ae undefined');
              return false;
            }
            var iFrameHeight = $iframeContainer.height();
            // iFrame expands with animation. 
            window.setTimeout(function () { iFrameHeight = $iframeContainer.height(); }, 2000);

            this.contentWindow.ae.views.tv.on('scratchpad.open', function () {
              // cause the window to scroll to the top left of the parent iframe, so the user
              // may see the scratchpad menu.
              // BUG: 36012
              window.scrollTo(0, $iframeContainer.offset().top);
          // Bug: 36085 The break point for the for-mobile class is 600px
             // we want to remove the close symbol only for the mobile breakpoint.
          if($header.width()< 601){
                $header.addClass('hide');
          }
              // BUG: 36083 (resize the iframe so nexus7 users can see the scratchpad without scrolling)
              $iframeContainer.attr('height', 500+iFrameHeight);
              $iframeContainer.css('height', ''); // remove inline style height property
            });
            this.contentWindow.ae.views.tv.on('scratchpad.close', function () {
              $iframeContainer.attr('height', iFrameHeight);
              $header.removeClass('hide');
            });
            this.contentWindow.ae.views.tv.on('improveQuestion.open', function () {
                $header.addClass('hide');
            });
            this.contentWindow.ae.views.tv.on('improveQuestion.close', function () {
                $header.removeClass('hide');
            });
          };
          
                $iframeContainer.removeAttr("src");
                $iframeContainer.attr("src", "/assessment/ui/views/test.view.new.html?testId=" + testId + "&type=practice&questionID=" + qid + "&ep=" + window.location.href);
                $("#guidedPracticeModal").foundation("reveal", "open");

        },

        openPractice : function(){
            var handle = $(this.el).attr("data-handle");

            if(handle){
                handle += '-practice';
                window.location.href = "/assessment/ui/views/test.view.new.html?title=" + handle + "&type=practice&ep=" + window.location.href;
            }else{

            }
        },

        error : function(){
            $(this.el).remove();
        },
        
        toggleDropdown: function(e) {
            var $dropdown = $(e.currentTarget).next('.dropdown');
            if ($dropdown.is(':hidden')) {
                $dropdown.slideDown('slow');
            }
            else {
                $dropdown.hide('slow');
            }
        }
    });

  function domReady(){
      window.guidedPractice = new GuidedPractice({el:$('#js_guided_practice_section')});
  }

  $(document).ready(domReady);

});
