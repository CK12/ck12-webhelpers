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
 * $Id: flx.member.js 13791 2011-11-22 00:42:38Z ravi $
 */

(function($) {

    function domReady(){

        $('#signin_form').ck12_smartForm( {
            ajax: false,
            validateOnBlur: false,
            rules : {
                username : {
                    required : true,
                    maxlength: 127 
                },
                password : {
                    required : true
                }
            },
            messages : {
                username : {
                    required : "Enter your user name or email",
                    maxlength : "Must be less than 128 characters"
                },
                password : {
                    required : "Enter your password"
                }
            }
        });

        // [bug:6795]  for signin form hide the previous error message, when typing.
        $('[name=submitbutton]').click(function(e) {
            $('#signin_errors').addClass('hide');
        });
       


        // add the ck12 form treatment
        $("#profile_form").ck12_smartForm({
            ajax: false,
            rules : {
                firstName : {
                    required : true,
                    maxlength: 63
                },
                lastName : {
                    required : true,
                    maxlength: 63
                },
                email : {
                    required : true,
                    maxlength: 255,
                    simple_email : true,
                    remote : {
                        url : webroot_url + 'validate/member/email',
                        type : "post"
                    }
                },
                //login aka username
                login : {
                    required : false,
                    minlength: 5,
                    maxlength: 127,
                    ck12_username:true,
                    remote : {
                        url : webroot_url + 'validate/member/login',
                        type : "post"
                    }
                },
                website : {
                    required : false,
                    maxlength: 2083
                },
                city : {
                    required : false,
                    maxlength: 63
                },
                province : {
                    required : false,
                    maxlength: 63
                },
                zip : {
                    required : false,
                    minlength: 5,
                    maxlength: 5,
                    ck12_zip:true
                },
                postalCode : {
                    required : false,
                    maxlength: 10
                },
                phone : {
                    required : false,
                    minlength: 10,
                    maxlength: 16,
                    ck12_phone:true
                },
                fax : {
                    required : false,
                    minlength: 10,
                    maxlength: 16,
                    ck12_phone:true
                }
            },
            messages : {
                firstName : {
                    required : "Enter your first name",
                    maxlength: "Must be less than 64 characters"
                },
                lastName : {
                    required : "Enter your last name",
                    maxlength: "Must be less than 64 characters"
                },
                email : {
                    required : "Enter a valid email address",
                    maxlength: "Must be less than 256 characters",
                    remote : "This email address is already taken"
                },
                login : {
                    minlength: "Must be at least 5 characters",
                    maxlength: "Must be less than 128 characters",
                    remote : "This login is already taken"
                },
                website : {
                    maxlength: "Must be less than 2084 characters"
                },
                city : {
                    maxlength: "Must be less than 64 characters"
                },
                province : {
                    maxlength: "Must be less than 64 characters"
                },
                zip : {
                    minlength: "Must be 5 characters",
                    maxlength: "Must be 5 characters"
                },
                postalCode : {
                    maxlength: "Must be less than 10 characters"
                },
                phone : {
                    minlength: "Must be at least 10 digits",
                    maxlength: "Must be less than 17 digits"
                },
                fax : {
                    minlength: "Must be at least 10 digits",
                    maxlength: "Must be less than 17 digits"
                }
            }
        });

        // add the ck12 form treatment
        $("#password_change_form").ck12_smartForm({
            ajax: false,
            rules : {
                current_password : {
                    required : true
                },
                password : {
                    required : true,
                    minlength : 6, 
                    ck12_password: true
                },
                confirm_password : {
                    required : true,
                    minlength : 6, 
                    equalTo : "#password"
                }
            },
            messages : {
                current_password : {
                    required : "Enter current password"
                },
                password : {
                    required : "Enter new password",
                    minlength : "Must be at least 6 characters"
                },
                confirm_password : {
                    required : "Enter the same password as above",
                    minlength : "Must be at least 6 characters",
                    equalTo : "Passwords do not match. Please enter the same password as above"
                },
            }
        });

        // add the ck12 form treatment
        $("#password_reset_form").ck12_smartForm({
            ajax: false,
            rules : {
                password : {
                    required : true,
                    minlength : 6, 
                    ck12_password: true
                },
                confirm_password : {
                    required : true,
                    minlength : 6, 
                    equalTo : "#password"
                }
            },
            messages : {
                password : {
                    required : "Enter new password",
                    minlength : "Must be at least 6 characters"
                },
                confirm_password : {
                    required : "Enter the same password as above",
                    minlength : "Must be at least 6 characters",
                    equalTo : "Passwords do not match. Please enter the same password as above"
                }
            }
        });


        // add the ck12 form treatment
        $("#password_forgot_form").ck12_smartForm({
            ajax: false,
            rules : {
                email : {
                    required : true,
                    simple_email : true
                }
            },
            messages : {
                email : {
                    required : "Enter a valid email address"
                }
            }
        });
    }

    $(document).ready(domReady);

    $("#countryID").change(function() {
        var action = $(this).val();

        if (action == '1') {
            $("#stateDiv").css('display', 'block')
            $("#zipDiv").css('display', 'block')
            $("#provinceDiv").css('display', 'none')
            $("#postalCodeDiv").css('display', 'none')
        } else {
            $("#stateDiv").css('display', 'none')
            $("#zipDiv").css('display', 'none')
            $("#provinceDiv").css('display', 'block')
            $("#postalCodeDiv").css('display', 'block')
        }
    });
})(jQuery);
