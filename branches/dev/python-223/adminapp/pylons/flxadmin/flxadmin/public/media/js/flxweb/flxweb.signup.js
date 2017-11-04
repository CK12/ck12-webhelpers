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
                maxlength: 250, 
                simple_email : true,
                remote : {
                    url : webroot_url + 'account/validate/email/',
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
        }
    });
});
