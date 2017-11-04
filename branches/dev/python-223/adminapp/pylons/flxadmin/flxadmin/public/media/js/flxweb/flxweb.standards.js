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

var StandardsAlignedStates = Backbone.Collection.extend({
    initialize: function(options) {
        options || (options = {});
        this.subject = options.subject; 
    },   
    url: function() {
        return '/ajax/standards/' + escape(this.subject) + '/states/';
    }
});

var StandardsAlignedGrades = Backbone.Collection.extend({
    initialize: function(options) {
        options || (options = {});
        this.subject = options.subject;
        this.state = options.state;
    },   
    url: function() {
        return '/ajax/standards/' + escape(this.subject) + '/' + this.state + '/grades/';
    }
});

var StandardsAlignedView = Backbone.View.extend({
    events: {
        'change #standards_subject': 'onSubjectChange',
        'change #standards_state': 'onStateChange',
        'change #standards_grade': 'onGradeChange'
    },
    initialize: function() {
        //exit if the element does not exist
        if ($(this.el).length == 0) {
            return;
        }
        $('#standards_state').attr('disabled',true);
        $('#standards_grade').attr('disabled',true);
    },
    setStates: function(states) {
        $('#standards_state').find('option').remove();
        $('#standards_state').append('<option value="-" data-id="-">Select state or standard board</option>');
        if (states.length == 0 ) {
            $('#standards_state').attr('disabled',true);
        } else {
            for (var i=0;i<states.length;i++) {
                $('#standards_state').append('<option value="'
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
            $('#standards_state').removeAttr('disabled');
        }
    },
    setGrades: function(grades) {
        $('#standards_grade').find('option').remove();
        $('#standards_grade').append('<option value="-">Select grade</option>');
        if (grades.length == 0 ) {
            $('#standards_grade').attr('disabled',true);
        } else {
            for (var i=0;i<grades.length;i++) {
                $('#standards_grade').append('<option value="'
                                        + grades[i].name 
                                        + '">' + grades[i].longname
                                        + '</option>');
            }
            $('#standards_grade').removeAttr('disabled');
        }
    },
    onSubjectChange: function(event) {
        var subject = this.$('#standards_subject').val();
        var self = this;
        $('#standards_state').attr('disabled',true);
        $('#standards_grade').attr('disabled',true);
        if (subject != "-") {
            var states = new StandardsAlignedStates({'subject':subject});
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
        var subject = this.$('#standards_subject').val();
        var state_id = this.$('#standards_state').find("option:selected").data('id');
        var self = this;
        $('#standards_grade').attr('disabled',true);
        if (subject != "-" && state_id != "-") { 
            var grades = new StandardsAlignedGrades({'subject':subject,'state':state_id});
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
        this.showBooks();
    },
    showBooks: function() {
        var self=this;
        var state = this.$('#standards_state').val();
        var grade = this.$('#standards_grade' ).val();
        var subject = this.$('#standards_subject').val();

        if (state == "-" || grade == "-" || subject == "-") {
            $.flxweb.showDialog('Please select a state, grade and a subject');
            return;
        }

        $.flxweb.showLoading("Please wait");
        $('#standards_books').load("/ajax/standards/books/" + 
                                    escape(subject) + "/" + 
                                    escape(state) + "/" + 
                                    escape(grade) + "/",
                                    function() {
                                        $.flxweb.hideLoading();
                                    });
    }
});

(function($) {
    $(document).ready(function(){
        var view = new StandardsAlignedView({el:$('#standards_form')});
    });
})(jQuery)
