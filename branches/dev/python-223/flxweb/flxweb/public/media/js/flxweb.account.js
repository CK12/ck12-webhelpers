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
 * $Id: flxweb.account.js 13791 2011-11-22 00:42:38Z ravi $
 */
define('flxweb.account',
['jquery', 'jquery-ui', 'flxweb.global'],
function($) {
	'use strict';
    function domReady() {

        $('#signin_form').ck12_smartForm({
            ajax: false,
            validateOnBlur: false,
            rules : {
                username : {
                    required : true,
                    maxlength: 250
                },
                password : {
                    required : true
                }
            }
        });

        // add the ck12 form treatment
        $('#profile_form').ck12_smartForm({
            ajax: false,
            rules : {
                firstName : {
                    required : true
                },
                lastName : {
                    required : true
                },
                email : {
                    required : true,
                    simple_email : true,
                    remote : {
                        url : webroot_url + 'account/validate/email/',
                        type : 'post'
                    }
                },
                //login aka username
                login : {
                    required : true,
                    minlength: 5,
                    maxlength: 127,
                    ck12_username:true,
                    remote : {
                        url : webroot_url + 'account/validate/username/',
                        type : 'post'
                    }
                }
            }
        });

        // add the ck12 form treatment
        $('#password_change_form').ck12_smartForm({
            ajax: false,
            rules : {
                current_password : {
                    required : true
                },
                new_password : {
                    required : true,
                    minlength : 6, 
                    ck12_password: true
                },
                confirm_new_password : {
                    required : true,
                    minlength : 6, 
                    ck12_password: true,
                    equalTo : '#new_password'
                }
            }
        });

        // add the ck12 form treatment
        $('#password_forgot_form').ck12_smartForm({
            ajax: false,
            rules : {
                email : {
                    required : true,
                    simple_email : true
                }
            }
        });

        // add the ck12 form treatment
        $('#usernameForm').ck12_smartForm({
            ajax: false,
            rules : {
                login : {
                    required : true,
                    minlength: 3,
                    maxlength: 127,
                    ck12_username:true,
                    notEqual: '#emailID',
                    remote : {
                        url : webroot_url + 'ajax/validate/member/login',
                        type : 'post'
                    }
                }
            },
            messages: {
                login : {
                    required: 'Please enter valid login id.',
                    minlength: 'Must be at least 3 characters.',
                    maxlength: 'Must be less than 128 characters.',
                    notEqual: 'Username can not be same as email id.',
                    remote : 'This username has already been taken.'
                }
           }
        });
    }
    $(document).ready(domReady);
});