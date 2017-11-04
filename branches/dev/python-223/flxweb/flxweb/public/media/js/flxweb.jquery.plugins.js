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
 * $Id: flxweb.jquery.plugins.js 12422 2011-08-19 22:51:58Z ravi $
 */

/*************************************************
 * This file should contain only small CK-12
 * authored jquery plugins
 *************************************************/

/***********************************************************
 * CK-12 jQuery Smart Form Plugin
 * Does the following:
 * 1) Animates submit button 
 * 2) Disables/enables the submit button on success/failure
 * 3) Allows option to submit forms through ajax
 * 4) Allows adding inline validation rules on form
*************************************************************/
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an named module.
        define('flxweb.jquery.plugins',['jquery','jquery-ui','jquery.validate'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
$.fn.ck12_smartForm = function(options){

    //Default settings
    var defaults = {
            ajax : false, // submitting the form by ajax
            submitButtonClass : 'submitButton', //css class for the submit link
            submitButtonLoadingClass : 'submitButtonLoading', //css class for the loading
            successCallback : null, // used only when ajax=true
            errorCallback : null, // used only when ajax=true
            rules: null, // jquery form validation rules
            messages: null, // jquery form messages
            validateOnBlur: true //validate fields on blur
    };
    //overwrite defaults with specified options
    var options = $.extend(defaults, options);

    function validateField(obj) {
        var id = $(obj).attr('id');
        var form = obj.form;
        if ($(form).validate().element('#'+id)) {
            showMessage(obj,true);
        } else {
            showMessage(obj,false);
        }
    }

    function showMessage(obj,valid,message) {
        var id = $(obj).attr('id');
        if (valid) {
            $(obj).removeClass('error');
            $('.inputhint[data-for="'+id+'"]').removeClass('hide');
            $('.error[data-for="'+id+'"]').addClass('hide');
        } else {
            $(obj).addClass('error');
            $('.inputhint[data-for="'+id+'"]').addClass('hide');
            if (message) {
                $('.error[data-for="'+id+'"]').html('').append('<span class="imgwrap"></span>').append(message);
            }
            $('.error[data-for="'+id+'"]').removeClass('hide');
        }
    }

    $.validator.addMethod("simple_email", function(value, element) {
        return /(^[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+)*|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-011\013\014\016-\177])*")@(?:[A-Z0-9]+(?:-*[A-Z0-9]+)*\.)+[A-Z]{2,6}$/i.test(jQuery.trim(value));
    }, "Enter a valid email address");

    $.validator.addMethod("ck12_password",function(value,element) {
        return /^(?=.*\d).*$/.test(value);
    }, "Password must contain at least one number");
    
    /*
    $.validator.addMethod("ck12_loginemail",function(value,element) {
        if (value && value.indexOf("@") != -1 && $("#email").val() != value) {
            return false;
        }
        return true;
    }, "Login Email id should be same as Account Email id");
    */

    $.validator.addMethod("ck12_ascii",function(value,element) {
        return /^[^\u2022]*$/.test(value);
    }, "Please reenter your password with valid characters");

    $.validator.addMethod("ck12_username",function(value,element) {
        return /^(?=.*\d)|(?=.*\w)(?!").*$/.test(value);
    }, "Username should have atleast one number or an alphabet");

    $.validator.addMethod("ck12_website",function(value,element){
        return /^$|(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(value);
    }, "Website should be a valid URL");

    $.validator.addMethod("ck12_zip",function(value,element) {
        return /^$|^[0-9]{5}$/.test(jQuery.trim(value));
    }, "Zip code should contain 5 digits only");

    $.validator.addMethod("ck12_phone",function(value,element) {
        return /^$|^[0-9]{7,16}$/.test(jQuery.trim(value));
    }, "Phone should be numbers only");

    $.validator.addMethod("notEqual",function(value, element, param) {
        return this.optional(element) || $.trim(value) != $.trim($(param).val());
    }, "This has to be different...");

    return this.each(function(){
        var form_to_submit = $(this);
        var submitButton = $('input[type=submit]', form_to_submit);

        // Accept 'Enter' key on any input field
        $(':input',form_to_submit).keypress(function(e) {
            if(e.which == 13) {
               submitButton.click();
            }
        });

        // add form validation
        if (options.rules) {  
            var messages = {};
            //construct the validation messages by picking the 
            //"data-<rule>" attributes from each field of the form
            for (var field in options.rules) {
                for (var rule in options.rules[field]) {
                    //get message by lowecasing the rule
                    //since html5 defaults to lower casing
                    //the data attributes
                    var dataMessage = $('#'+field).data(rule.toLowerCase());
                    if (dataMessage) {
                        if (!messages[field]) {
                            messages[field] = {};
                        }
                        messages[field][rule] = dataMessage;
                    }
                } 
            }

            // if the options.messages is passed, then use them instead.
            //so overwrite data-<field> messages with the ones specified in options.messages
            options.messages = $.extend(messages, options.messages);

            $(form_to_submit).validate( {
                onkeyup: false,
                onfocusout: function(element) {
                    if (options.validateOnBlur) {
                        $(element).valid();
                    }
                },
                rules : options.rules,
                messages : options.messages,
                submitHandler : function(form1) {
                    var submitted = $(form1).data('submitted');
                    // avoid recursion by not using $(form1).submit()
                    // see http://docs.jquery.com/Plugins/Validation#Too_much_recursion
                    if (!submitted) {
                        form1.submit();
                        $(form1).data('submitted',true);
                    }
                },
                errorPlacement: function(error, element) {
                    showMessage(element,false,error);
                },
                errorClass:'invalid',
                highlight: function(element, errorClass) {
                    showMessage(element,false);
                },
                unhighlight: function(element, errorClass) {
                    showMessage(element,true);
                }
            });
        } 

        //add ajax form handling only if options.ajax
        if (options.ajax) {
            var submitButton = $('input[type=submit]', form_to_submit);
            submitButton.addClass(options.submitButtonClass);
            $('.' + options.submitButtonClass,form_to_submit).live('click',function() {
                // validate the form if rules are specified
                if (options.rules && !form_to_submit.validate().form()) {
                    return false;  
                } 
                var link = $(this);
                var jqxhr = $.ajax({       
                    type: $(form_to_submit).attr('method'),
                    url: $(form_to_submit).attr('action'),
                    data: $(form_to_submit).serialize(),
                    dataType:'json',
                    beforeSend: function(){
                        //Display the animation after the user click on the button
                        link.addClass(options.submitButtonLoadingClass); 
                    },
                    success: function(data) {
                        //Reset the button back to default
                        link.removeClass(options.submitButtonLoadingClass); 
                        if (options.successCallback != null) {
                            options.successCallback(data);
                        }
                    },
                    error: function() {
                        //Reset the button back to default
                        link.removeClass(options.submitButtonLoadingClass); 
                        if (options.errorCallback != null) {
                            options.errorCallback();
                        }
                    }
                });
                return false;
            });
        }
    });
}


/***********************************************************
 * CK-12 Drop Down menu Plugin
 * Does the following:
 * 1) Converts the <ul> into a dropdown menu. 
*************************************************************/
$.fn.ck12_dropDownMenu = function(options){

    //Default settings
    var defaults = {
        'hideOnSelection':true
    };
    
    //overwrite defaults with specified options
    var options = $.extend(defaults, options);
    
    return this.each(function(){
        // menu HTML element
        var menu = $(this);
    
        //element that will have the click bind
        var menuLink= $(menu).data('menu-link');
       
        function hideMenu(e){
            //Do not hide Menu on middle or right mouse click button
            if(e != undefined && (e.which == 2 || e.which == 3)){
                return;
            }
            $(menu).addClass('hide'); //hide menu
            $(menuLink).removeClass('dropdownopened');
            $(menu).trigger('flxweb.dropmenu.hide');//trigger hide event on the menu
            $(document).add('a').unbind('click', hideMenu) //remove global handler
        }
        
        function showMenu(){
            $(menu).removeClass('hide'); //show menu
            $(menuLink).addClass('dropdownopened');
            $(menu).trigger('flxweb.dropmenu.show');//trigger show event on the menu
            $(document).bind('click',hideMenu); //add global click handler
        }
        
        $(menuLink).bind('click',function() {
            showMenu();
            return false;
        });
        
        $(menu).bind('click', function(e){ 
            if (options.hideOnSelection) {
                hideMenu();
            }else {
                e.stopPropagation();
            }
        });
        //expose showMenu and hideMenu methods on the dom object
        $(menu).get(0).showMenu = showMenu;
        $(menu).get(0).hideMenu = hideMenu;
        //initially hide the menu
        hideMenu();
    });
}
}));
