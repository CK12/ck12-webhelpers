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
 * This file originally written by Javed Attar
 *
 * $Id$
 */

define(['jquery', 'auth/flx.global'], function($){

    $(function() {
        $('#signup_underage_form').ck12_smartForm({
            ajax: false,
            rules : {
                parent_email : {
                    required : true,
                    maxlength: 128,
                    simple_email : true
                }
            },
            messages : {
                parent_email : {
                    required : 'Enter a valid email address',
                    maxlength: 'Must be less than 128 characters'
                }
            }
        });
        $('#signup_underage_form').bind('submit', function(){
            if ($(this).hasClass('disabled')) {
                return false;
            }
            var errors = $(this).find('input.error').size();
            if (errors){
                return false;
            } else {
                var name = $(this).find('#name').val() || '';
                name = $.trim(name);
                var arr = name.split(' ');
                $(this).find('#firstName').val(arr.splice(0,1));
                $(this).find('#lastName').val(arr.join(' '));
            }
        });

    });
});
