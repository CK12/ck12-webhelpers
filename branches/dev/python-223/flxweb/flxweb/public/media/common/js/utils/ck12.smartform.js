/***********************************************************
 * CK-12 jQuery Smart Form Plugin
 * Does the following:
 * 1) Animates submit button
 * 2) Disables/enables the submit button on success/failure
 * 3) Allows option to submit forms through ajax
 * 4) Allows adding inline validation rules on form
 *************************************************************/
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an named module.
        define(['jquery', 'jquery-ui', 'jquery.validate', 'jquery-migrate'], factory);
    } else {
        // Browser globals
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';
    $.fn.ck12_smartForm = function (options) {

        //Default settings
        var defaults = {
            ajax: false, // submitting the form by ajax
            submitButtonClass: 'submitButton', //css class for the submit link
            submitButtonLoadingClass: 'submitButtonLoading', //css class for the loading
            successCallback: null, // used only when ajax=true
            errorCallback: null, // used only when ajax=true
            rules: null, // jquery form validation rules
            messages: null, // jquery form messages
            validateOnBlur: true //validate fields on blur
        };
        //overwrite defaults with specified options
        options = $.extend(defaults, options);

        function showMessage(obj, valid, message) {
            var id = $(obj).attr('id');
            if (valid) {
                $(obj).removeClass('error').addClass('valid').closest('form').addClass('formValid');
                $('.inputhint[data-for="' + id + '"]').removeClass('hide');
                $('.error[data-for="' + id + '"]').addClass('hide');
            } else {
                $(obj).addClass('error').removeClass('valid').closest('form').removeClass('formValid');
                $('.inputhint[data-for="' + id + '"]').addClass('hide');
                if (message) {
                    $('.error[data-for="' + id + '"]').html('').append('<span class="imgwrap"></span>').append(message);
                }
                $('.error[data-for="' + id + '"]').removeClass('hide');
            }
        }

        /*function validateField(obj) {
            var id, form;
            id = $(obj).attr('id');
            form = obj.form;
            if ($(form).validate().element('#' + id)) {
                showMessage(obj, true);
            } else {
                showMessage(obj, false);
            }
        }*/

        function simple_email(value) {
            return (/(^[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+)*|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-011\013\014\016-\177])*")@(?:[A-Z0-9]+(?:-*[A-Z0-9]+)*\.)+[A-Z]{2,6}$/i).test($.trim(value));
        }

        $.validator.addMethod('simple_email', simple_email, 'Enter a valid email address');

        $.validator.addMethod('simple_email_emptyable', function (value) {
            if ('' === value) {
                return true;
            }
            return simple_email(value);
        }, 'Enter a valid email address');

        $.validator.addMethod('ck12_password', function (value) {
            return (/^(?=.*\d).*$/).test(value);
        }, 'Password must contain at least one number');

        /*
    $.validator.addMethod('ck12_loginemail',function(value) {
        if (value && value.indexOf('@') != -1 && $('#email').val() != value) {
            return false;
        }
        return true;
    }, 'Login Email id should be same as Account Email id');
    */

        $.validator.addMethod('ck12_ascii', function (value) {
            return (/^[^\u2022]*$/).test(value);
        }, 'Please reenter your password with valid characters');

        $.validator.addMethod('ck12_name', function (value) {
            return !(/~|\/|%|#|\&|\?/gi).test(value);
        }, 'Please reenter your name with valid characters');

        function ck12_username(value) {
            return (/^((?=.*\d)|(?=.*\w)(?!").*)|[^\x00-\x80]+$/).test(value);
        }

        $.validator.addMethod('ck12_username', ck12_username, 'Username should have atleast one number or an alphabet');

        $.validator.addMethod('ck12_username_emptyable', function (value) {
            if ('' === value) {
                return true;
            }
            return ck12_username(value);
        }, 'Username should have atleast one number or an alphabet');

        $.validator.addMethod('ck12_website', function (value) {
            return (/^$|(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/).test(value);
        }, 'Website should be a valid URL');

        $.validator.addMethod('ck12_zip', function (value) {
            return (/^$|^[0-9]{5}$/).test($.trim(value));
        }, 'Zip code should contain 5 digits only');

        $.validator.addMethod('ck12_phone', function (value) {
            return (/^$|^[0-9]{7,16}$/).test($.trim(value));
        }, 'Phone should be numbers only');

        $.validator.addMethod('notEqual', function (value, element, param) {
            return this.optional(element) || $.trim(value) !== $.trim($(param).val());
        }, 'This has to be different...');

        $.validator.addMethod('invalid_username', function (value) {
            /*return !(/[^\w\-]/gi).test($.trim(value));*/
            return (/^(\w+\s?)*$/gi).test($.trim(value));
        }, 'Special Characters are not allowed');

        $.validator.addMethod('invalid_fullname', function (value) {
            return (/^[^/\\()~!@#$%^<>&|*]*$/).test($.trim(value));
        }, 'Special Characters are not allowed');

        return this.each(function () {
            var form_to_submit, submitButton, messages, field, rule, dataMessage;
            form_to_submit = $(this);
            submitButton = $('input[type=submit]', form_to_submit);

            // Accept 'Enter' key on any input field
            $(':input', form_to_submit).keypress(function (e) {
                if (e.which === 13) {
                    submitButton.click();
                }
            });

            // add form validation
            if (options.hasOwnProperty('rules')) {
                messages = {};
                //construct the validation messages by picking the
                //'data-<rule>' attributes from each field of the form
                for (field in options.rules) {
                    if (options.rules.hasOwnProperty(field)) {
                        for (rule in options.rules[field]) {
                            if (options.rules[field].hasOwnProperty(rule)) {
                                //get message by lowecasing the rule
                                //since html5 defaults to lower casing
                                //the data attributes
                                dataMessage = $('#' + field).data(rule.toLowerCase());
                                if (dataMessage) {
                                    if (!messages[field]) {
                                        messages[field] = {};
                                    }
                                    messages[field][rule] = dataMessage;
                                }
                            }
                        }
                    }
                }

                // if the options.messages is passed, then use them instead.
                //so overwrite data-<field> messages with the ones specified in options.messages
                options.messages = $.extend(messages, options.messages);

                $(form_to_submit).validate({
                    onkeyup: false,
                    onfocusout: function (element) {
                        if (options.validateOnBlur) {
                            $(element).valid();
                            if ('' === element.value) {
                                $(element).removeClass('valid');
                            }
                        }
                    },
                    onfocusin: function (element) {
                        if (options.validateOnBlur) {
                            $(form_to_submit).find('[data-for="' + element.id + '"]').addClass('hide');
                        }
                    },
                    rules: options.rules,
                    messages: options.messages,
                    submitHandler: function (form1) {
                        var submitted = $(form1).data('submitted');
                        // avoid recursion by not using $(form1).submit()
                        // see http://docs.jquery.com/Plugins/Validation#Too_much_recursion
                        if (!submitted) {
                            form1.submit();
                            $(form1).data('submitted', true);
                        }
                    },
                    errorPlacement: function (error, element) {
                        showMessage(element, false, error);
                    },
                    errorClass: 'invalid',
                    highlight: function (element) {
                        showMessage(element, false);
                    },
                    unhighlight: function (element) {
                        showMessage(element, true);
                    }
                });
            }

            //add ajax form handling only if options.ajax
            if (options.ajax) {
                submitButton = $('input[type=submit]', form_to_submit);
                submitButton.addClass(options.submitButtonClass);
                $('.' + options.submitButtonClass, form_to_submit).live('click', function () {
                    // validate the form if rules are specified
                    if (options.rules && !form_to_submit.validate().form()) {
                        return false;
                    }
                    var link = $(this);
                    $.ajax({
                        type: $(form_to_submit).attr('method'),
                        url: $(form_to_submit).attr('action'),
                        data: $(form_to_submit).serialize(),
                        dataType : 'json',
                        beforeSend: function () {
                            //Display the animation after the user click on the button
                            link.addClass(options.submitButtonLoadingClass);
                        },
                        success: function (data) {
                            //Reset the button back to default
                            link.removeClass(options.submitButtonLoadingClass);
                            if (options.successCallback) {
                                options.successCallback(data);
                            }
                        },
                        error: function () {
                            //Reset the button back to default
                            link.removeClass(options.submitButtonLoadingClass);
                            if (options.errorCallback) {
                                options.errorCallback();
                            }
                        }
                    });
                    return false;
                });
            }
        });
    };
}));
