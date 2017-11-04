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
 * $Id$
 */
define('flxweb.coursegen',
['backbone','jquery','jquery-ui','flxweb.models.artifact','common/utils/utils','flxweb.global'],
function(Backbone,$,UI,Artifact, Util) {
    var CoursegenModule = {};
    var coursegen_loading_completed = false;
    var is_clicked = false;
    CoursegenModule.AlignedStates = Backbone.Collection.extend({
        initialize: function(options) {
            options || (options = {});
            this.subject = options.subject; 
        },   
        url: function() {
            return '/ajax/standards/' + this.subject + '/states/';
        }
    });

    CoursegenModule.AlignedGrades = Backbone.Collection.extend({
        initialize: function(options) {
            options || (options = {});
            this.subject = options.subject;
            this.state = options.state;
        },   
        url: function() {
            return '/ajax/standards/' + this.subject + '/' + this.state + '/grades/';
        }
    });

    CoursegenModule.AlignedBook = Backbone.Model.extend({
        urlRoot: '/ajax/coursegen/book/'
    });

    CoursegenModule.CoursegenView = Backbone.View.extend({
        events: {
            'change #cg_subject': 'onSubjectChange',
            'change #cg_state': 'onStateChange',
            'change #cg_grade': 'onGradeChange'
            //'change select[id^="cg_"]': 'onChange'
        },
        initialize: function() {
            //exit if the element does not exist
            if ($(this.el).length == 0 ||
                $(this.options.target).length == 0) {
                return;
            }
            var self = this;

            this.url = $(this.el).data('url');
            $(this.el).load(this.url,function() {
                self.dialog = $.flxweb.createDialog($(self.el),
                    {
                        'title':$(self.el).data('title'),
                        'height':450,
                        'width':500,
                        'buttons':{ 
                            'OK': function() {
                                self.trigger('flxweb.coursegen.ok');
                            },
                            'Cancel':function() {
                                $(this).dialog('close');
                            }
                        }
                    });
                coursegen_loading_completed = true;
                if (is_clicked){
                	is_clicked = false;
                	$.flxweb.hideLoading();
                	self.show();
                }
            });
            //add event listeners
            $(this.options.target).click(function(){
				if (coursegen_loading_completed){
					self.show();
				}else{
					is_clicked = true;
					$.flxweb.showLoading();
				}
				return false;
			});
            this.bind('flxweb.coursegen.ok',this.onOK);
            this.book = new CoursegenModule.AlignedBook();
        },
        show: function() {
            var self=this;
            this.reset();
            this.dialog.open();
        },
        hide: function() {
            this.dialog.close();
        },
        setStates: function(states) {
            $('#js_old_fb_notification').html('<br>');
            $('#js_old_fb_notification').removeClass('nostandardsmatch');
            $('#cg_state').find('option').remove();
            $('#cg_state').append('<option value="-" data-id="-">Select state or standard set</option>');
            if (states.length == 0 ) {
                $('#cg_state').attr('disabled',true);
            } else {
                for (var i=0;i<states.length;i++) {
                    var optionStr = '<option value="'
                                            + states[i].countryCode
                                            + '.' 
                                            + states[i].name
                                            + '" data-id="'
                                            + states[i].id
                                            +'">';
                    optionStr += states[i].longname;

                    if (states[i].countryCode != 'US') {
                        optionStr += " (" + states[i].countryName + ")";
                    }
                    optionStr += '</option>';
                    $('#cg_state').append(optionStr);
                }
                $('#cg_state').removeAttr('disabled');
            }
        },
        setGrades: function(grades) {
            $('#js_old_fb_notification').html('<br>');
            $('#js_old_fb_notification').removeClass('nostandardsmatch');
            $('#cg_grade').find('option').remove();
            $('#cg_grade').append('<option value="-">Select grade</option>');
            if (grades.length == 0 ) {
                $('#cg_grade').attr('disabled',true);
            } else {
                for (var i=0;i<grades.length;i++) {
                    $('#cg_grade').append('<option value="'
                                            + grades[i].name 
                                            + '">' + grades[i].longname
                                            + '</option>');
                }
                $('#cg_grade').removeAttr('disabled');
            }
        },
        onSubjectChange: function(event) {
            var subject = this.$('#cg_subject').val();
            var self = this;
            $('#cg_state').attr('disabled',true);
            $('#cg_grade').attr('disabled',true);
            $('#js_old_fb_notification').html('<br>');
            $('#js_old_fb_notification').removeClass('nostandardsmatch');
            $('#cg_title_div').addClass('hide');
            if (subject != "-") {
                var states = new CoursegenModule.AlignedStates({'subject':subject});
                states.fetch({
                    success: function(collection, response) {
                        self.setStates(response.data.states);
                        self.setGrades([]);              
                    },
                    error: function(collection, response) {
                        $.flxweb.showDialog('could not update states');
                    }
                });
            } else {
                self.setStates([]);              
                self.setGrades([]);              
            }
        },
        onStateChange: function(event) {
            var subject = this.$('#cg_subject').val();
            var state_id = this.$('#cg_state').find("option:selected").data('id');
            var country_value = this.$('#cg_state option:selected').attr('value');
            var self = this;
            $('#cg_grade').attr('disabled',true);
            $('#cg_title_div').addClass('hide');
            if (subject != "-" && state_id != "-") { 
                var grades = new CoursegenModule.AlignedGrades({'subject':subject,'state':state_id});
                grades.fetch({
                    success: function(collection, response) {
                        if (response.data.grades.length == 0 && country_value.indexOf('US.') != -1) {
                            var grades = new CoursegenModule.AlignedGrades({'subject':subject,'state':state_id});
                            grades.url = '/ajax/standards/'+subject+'/'+state_id+'/alternate_grades/';
                            grades.fetch({
                                success: function(collection, response) {
                                    if (response.data && response.data.grades){
                                        self.setGrades(response.data.grades);
                                        message = response.data.message;
                                        $('#js_old_fb_notification').html(response.data.message);
                                        $('#js_old_fb_notification').addClass('nostandardsmatch');
                                    }else{
                                    }
                                },
                                error: function(collection, response) {
                                    $.flxweb.showDialog('could not update grades');
                                }
                            });
                        }else if (response.data.grades.length == 0 && country_value.indexOf('US.') == -1) {
                            standard_name = this.$('#cg_state option:selected').text();
                            self.setGrades(response.data.grades);
                            $('#js_old_fb_notification').html("We have not aligned our books with the standards with " + $.trim(standard_name));
                            $('#js_old_fb_notification').addClass('nostandardsmatch');
                            $('#cg_title').val('');
                        }
                        if (response.data.grades.length != 0){
                            self.setGrades(response.data.grades);
                        }         
                    },
                    error: function(collection, response) {
                        $.flxweb.showDialog('could not update grades');
                    }
                });
            } else {
                self.setGrades([]);              
            }
        },
        onGradeChange: function(event) {
            var attribute = event.target.name;
            var value = event.target.value;

            var state_text = this.$('#cg_state option:selected').text();
            var grade_text = this.$('#cg_grade option:selected' ).text();
            var subject_text = this.$('#cg_subject option:selected').text();

            var state = this.$('#cg_state').val();
            var grade = this.$('#cg_grade' ).val();
            var subject = this.$('#cg_subject').val();

            var fName = $('#cg_fname').val();
            //var lName = $('#cg_lname').val();

            if (state != "-" && grade != "-" && subject != "-") {
                var title = subject_text + " FlexBook for " + state_text +
                            " " + grade_text + " by " + fName ;
                title = title.substr(0,100); 
                $('#cg_title').val(title);
                //trigger keyup to update the character length display
                $('#cg_title').trigger('keyup');
                $('#cg_title_div').removeClass('hide');
            }else{
                $('#cg_title_div').addClass('hide');
            }
        },
        reset: function() {
            //reset the dialog i.e reset the form and any other ui state
            $('#cg_form').each(function(){
                this.reset();
            });
            //disable the state and grade dropdown
            $('#cg_state').attr('disabled',true); 
            $('#cg_grade').attr('disabled',true); 
            $('#cg_title_div').addClass('hide');
            $('#js_old_fb_notification').html('<br>');
            $('#js_old_fb_notification').removeClass('nostandardsmatch');
            $.flxweb.events.triggerEvent(document, 'flxweb.library.closeCreateDropdown');
        },
        onOK: function() {
            var self=this;
            var state = this.$('#cg_state').val();
            var grade = this.$('#cg_grade' ).val();
            var subject = this.$('#cg_subject').val();

            if (state == "-" || grade == "-" || subject == "-") {
                $.flxweb.showDialog('Please select a state, grade and a subject');
                return;
            }

            var title = $('#cg_title').val();
            title = $.trim(title);
            if (! Util.validateResourceTitle(title, 'artifact', $('#cg_title'))){
            	return false;
            }

            title = Artifact.htmlEscapArtifactTitle(title);
            $.flxweb.showLoading($.flxweb.gettext("Generating '"+ title.display_title + "'.You will be redirected to the generated FlexBook&#174; textbook"));
            this.book.set( {
                                'state':state,
                                'grade':grade,
                                'subject': subject,
                                'title' : title.artifact_title,
                                'silent':true
                                })
                                    
            this.book.save(null,{
                'success': function(model,response) {
                    if (response.status == 'error') {
                        if (response.message != undefined) {
                            $.flxweb.showDialog(response.message);
                        } else {
                            $.flxweb.showDialog($.flxweb.gettext('Could not complete the operation.Please try again later'));
                        }
                    }else{
                        if (response.data.perma) {
                           document.location.href = "/" + response.data.perma; 
                        } else {
                            $.flxweb.showDialog($.flxweb.gettext('Your FlexBook&#174; textbook has been created and added to your library. Please visit your library'));
                        }
                    }
                },
                'error': function(response) {
                    if (response.message != undefined) {
                        $.flxweb.showDialog(response.message);
                    } else {
                        $.flxweb.showDialog('Could not complete the operation.Please try again later');
                    }
                }
            });
        }
    });
    return CoursegenModule;
});
