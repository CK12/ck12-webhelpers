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

var AlignedStates = Backbone.Collection.extend({
    initialize: function(options) {
        options || (options = {});
        this.subject = options.subject; 
    },   
    url: function() {
        return '/ajax/standards/' + this.subject + '/states/';
    }
});

var AlignedGrades = Backbone.Collection.extend({
    initialize: function(options) {
        options || (options = {});
        this.subject = options.subject;
        this.state = options.state;
    },   
    url: function() {
        return '/ajax/standards/' + this.subject + '/' + this.state + '/grades/';
    }
});

var AlignedBook = Backbone.Model.extend({
    urlRoot: '/ajax/coursegen/book/'
});

var CoursegenView = Backbone.View.extend({
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
                    'height':420,
                    'width':450,
                    'buttons':{ 
                        'OK': function() {
                            self.trigger('flxweb.coursegen.ok');
                        },
                        'Cancel':function() {
                            $(this).dialog('close');
                        }
                    }
                });
        });
        //add event listeners
        $(this.options.target).click(function(){
                                        self.show();
                                        return false;
                                    });
        this.bind('flxweb.coursegen.ok',this.onOK);
        this.book = new AlignedBook();
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
        $('#cg_state').find('option').remove();
        $('#cg_state').append('<option value="-" data-id="-">Select state or standard board</option>');
        if (states.length == 0 ) {
            $('#cg_state').attr('disabled',true);
        } else {
            for (var i=0;i<states.length;i++) {
                $('#cg_state').append('<option value="'
                                        + states[i].countryCode
                                        + '.' 
                                        + states[i].name
                                        + '" data-id="'
                                        + states[i].id
                                        +'">' 
                                        + states[i].longname
                                        + " (" + states[i].countryCode + ")"
                                        + '</option>');
            }
            $('#cg_state').removeAttr('disabled');
        }
    },
    setGrades: function(grades) {
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
        if (subject != "-") {
            var states = new AlignedStates({'subject':subject});
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
        var self = this;
        $('#cg_grade').attr('disabled',true);
        if (subject != "-" && state_id != "-") { 
            var grades = new AlignedGrades({'subject':subject,'state':state_id});
            grades.fetch({
                success: function(collection, response) {
                    self.setGrades(response.data.grades);              
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
        var lName = $('#cg_lname').val();

        if (state != "-" && grade != "-" && subject != "-") {
            var title = subject_text + " book for " + state_text +
                        " " + grade_text + " by " + fName + " " +
                        lName;
            $('#cg_title').val(title);
            $('#cg_title_div').removeClass('hide');
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
    },
    onOK: function() {
        var self=this;
        var state = this.$('#cg_state').val();
        var grade = this.$('#cg_grade' ).val();
        var subject = this.$('#cg_subject').val();
        var title = $('#cg_title').val();

        if (state == "-" || grade == "-" || subject == "-") {
            $.flxweb.showDialog('Please select a state, grade and a subject');
            return;
        }
        if (!title || $.trim(title) == '') {
            $.flxweb.showDialog('Please enter a book title');
            return;
        }

        $.flxweb.showLoading("Generating '"+ title + "'.You will be redirected to the generated book");
        this.book.set( {
                            'state':state,
                            'grade':grade,
                            'subject': subject,
                            'title' : title,
                            'silent':true
                            })
                                
        this.book.save(null,{
            'success': function(model,response) {
                if (response.status == 'error') {
                    if (response.message != undefined) {
                        $.flxweb.showDialog(response.message);
                    } else {
                        $.flxweb.showDialog('Could not complete the operation.Please try again later');
                    }
                }else{
                    if (response.data.perma) {
                       document.location.href = "/" + response.data.perma; 
                    } else {
                        $.flxweb.showDialog('Your book has been created and added to your library. Please visit your library');
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

