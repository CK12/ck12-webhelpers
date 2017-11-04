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
 * $Id: flxweb.signup.js 13791 2011-11-22 00:42:38Z ravi $
 */

$(function() {
    // add the ck12 form treatment

    $("#signup_form").ck12_smartForm({
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
            password : {
                required : true,
                minlength : 6, 
                ck12_password: true
            },
            password_confirm : {
                required : true,
                minlength : 6, 
                ck12_password: true,
                equalTo : "#password"
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
            password : {
                required : "Enter a password",
                minlength : jQuery.format("Enter at least {0} characters")
            },
            password_confirm : {
                required : "Enter the password again",
                minlength : jQuery.format("Enter at least {0} characters"),
                equalTo : "Enter the same password as above"
            },
            email : {
                required : "Enter a valid email address",
                maxlength: "Must be less than 256 characters",
                remote : "This email address is already taken"
            }
        }
    });
});
