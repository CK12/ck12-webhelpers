define(['jquery', 'common/utils/utils'], function ($, util) {
    'use strict';

    var groupRosterController;
    require(['groups/controllers/group.roster'], function (controller) {
        groupRosterController = controller;
    });

    function rosterEditMemberView() {

        
        var externalUpdateMemberCallback,
            _c = this;

        function updateMemberCallback(response) {
            $('#update-group-member').text("Save");
            if ('error' === response) {
                console.log('Sorry, we are not able to update this member. Please try again after some time.');
            } else if (0 !== response.responseHeader.status) {
                alert('Sorry, we are not able to update this member. Please try again after some time.');
            } else {
                var memberID = response.response.id;
                $('.js-close-edit-member').trigger('click');
                showPasswordButton(true);
                // If external callback is set trigger it
                if (_c.externalUpdateMemberCallback) {
                    return _c.externalUpdateMemberCallback(response);
                }
            }
        }

        function hasMadeEdits(){
            if ($('#update-firstname').attr('data-default-value') !== $('#update-firstname').val()) {
                return true;
            } 
            if ($('#update-lastname').attr('data-default-value') !== $('#update-lastname').val()){
                return true;
            }
            if (!_.isEmpty($('#update-password').val())){
                return true;
            }
            return false;
        }

	// Edit member input validation
        function testNameRegex(name) {
            var testRegx = /^[a-zA-Z\-\_\,\.\'\+\=\;\?\d\s]*$/;
            return testRegx.test(name);
        }

	function validateName(name, checkForEmpty) {
            if (checkForEmpty && _.isEmpty(name)) {
                return {msg: "Required field cannot be empty"};
            }
            if (!testNameRegex(name)) {
                return {msg: "Special characters are not allowed"};
            }
            return true;
        }

        function validatePassword(password) {
            var testRegx = /\d/g;
            return (password && (password.length < 6 || !testRegx.test(password))) ? false : true;
        }

        function disableSaveEditButton(){
            $('#update-group-member').addClass('disabled').addClass('grey');
        }

        function clearSaveButton() {
            if ( !$('#editMemberModal').find('input.input-error').length) {
                $('#update-group-member').removeClass('disabled').removeClass('grey');
            }
        }

        function flagInvalidName(input, msg){
            input.addClass('input-error');
            $("#edit-modal-error").text(msg);
            $("#edit-modal-error").removeClass('hide');
            disableSaveEditButton();
        }

        function clearInvalidName(input){
            input.removeClass('input-error');
            $("#edit-modal-error").text("");
            $("#edit-modal-error").addClass('hide');
            clearSaveButton();
        }

        function flagInvalidPassword() {
            $("#update-password").addClass("input-error");
            $("#edit-modal-error").text("Password must contain at least 1 number and be at least 6 characters");
            $("#edit-modal-error").removeClass('hide');
            disableSaveEditButton();
        }

        function clearInvalidPassword() {
            $("#edit-modal-error").addClass('hide');
            $("#update-password").removeClass("input-error");
            clearSaveButton();
        }

        function showPasswordButton(bool) {
            if (bool === false) {
                $('.hidden-password-button').addClass('hide');
                $('.js-update-password-container').removeClass('hide');
            } else {
                $('.hidden-password-button').removeClass('hide');
                $('.js-update-password-container').addClass('hide');
            }
            // Close password tooltip
            $('.edit-password-tooltip').addClass('hide');
            $('#toggle-password-text').text('Show password');
            $('#update-password').prop('type', 'password');
            $('#update-password').val('');
        }

        function bindEvents() {
            // Show hide username tooltip
            $('.edit-username-icon').on('mouseenter click', function(e){
                $('.edit-username-tooltip').removeClass('hide');
            });
            $('.edit-username-tooltip .icon-close').click(function (){
                $('.edit-username-tooltip').addClass('hide');
            });
            // Show hide password tooltip
            $('.hidden-password-button .icon-Info').on('mouseenter click', function (){
                $('.edit-password-tooltip').removeClass('hide');
            });
            $('.edit-password-tooltip .icon-close').click(function(e) {
                $('.edit-password-tooltip').addClass('hide');
            });
            // onclick of reset password link in tooltip
            $('#show-reset-password').click(function(e){
                showPasswordButton(false);
            });
            // Toggle input type for password show/hide
            $('#toggle-password-text').click(function(e){
                var inputType = $('#update-password').prop('type') !='password' ? 'password' : 'text';
                $('#update-password').prop('type', inputType);
                $(this).text(( inputType === 'password' ? 'Show password' : 'Hide password'));
            });
            // onlick of discard changes
            $('.edit-discard-changes').click(function(e){
                var $input = $(e.target).parent().find('input');
                var _default = $input.attr('data-default-value');
                $input.val(_default);
                $input.attr('id') != 'update-password' ? $input.next().addClass('hide') : null;
                $input.trigger('keyup');
            });
            // keyup on password field
            $('#update-password').on('focusout',function(e){
                if(!validatePassword($('#update-password').val())){
                    flagInvalidPassword();
                }else{
                    clearInvalidPassword();
                }
            });
            // keyup on firstname lastname field
            $('#update-firstname, #update-lastname').keyup(function(e){
                var $input = $(e.target);
                var defaultValue = $input.attr('data-default-value');
                var targetInput = $input.attr('name');
                if ($input.val() !== defaultValue) {
                    $input.next().removeClass('hide');
                } else {
                    $input.next().addClass('hide');
                }
                // Validate Name
                var isNameValid = (targetInput === 'first-name') ? validateName($input.val(), true) : validateName($input.val());
                if (isNameValid !=true) {
                    flagInvalidName($input, isNameValid.msg);
                } else {
                    clearInvalidName($input);
                }
            });
            // close or cancel modal
            $('#cancel-edit-member-modal,.js-close-edit-member').off('click').on('click', function(e){
                // Close edit member modal on cancel click
                $('#editMemberModal').foundation('reveal', 'close');
                clearInvalidPassword();
                clearInvalidName($('#update-firstname'));
                clearInvalidName($('#update-lastname'));
                showPasswordButton(true);
                $('#update-password').val('');
                $('#editMemberModal').attr('data-member', '');
                $('#editMemberModal').find('span.edit-firstname-helper,span.edit-lastname-helper').addClass('hide');
            });
            // onclick save update member changes
            $('.edit-member-button-wrapper ').off('click', '#update-group-member').on('click', '#update-group-member', function (e) {
                // Make API call to update member
                if (!$(this).hasClass('disabled')) {
                    if ( hasMadeEdits() ) {
		        $(this).text("Saving");
                        var password, memberID,
                            data = {};
                        data.givenName = $('#update-firstname').val();
                        data.lastName = $('#update-lastname').val();
                        password = $('#update-password').val();
                        password ? (data.password = password) : null;
                        memberID = Number($('#editMemberModal').attr('data-member'));
                        groupRosterController.updateMember( updateMemberCallback, memberID, data);
                    } else {
                        $('.js-close-edit-member').trigger('click');
                    }
                }
            });
            // onclick outside of elements
            $('body').off('click.content-wrap').on('click.content-wrap', function(e){
                var $target = $(e.target);
                if (!$target.hasClass('edit-username-tooltip') && !$target.hasClass('icon-Info')) {
                    $('.edit-username-tooltip').addClass('hide');
                }
                if (!$target.hasClass('edit-password-tooltip') && !$target.hasClass('icon-Info')) {
                    $('.edit-password-tooltip').addClass('hide');
                }
            });
        }

        // Takes the target element as target
        function launch(target){
	    // Only the creator of the account can edit this member
	    if (!$(target).parents('li').hasClass('no-edit-member')){
		var editMemberElement = $(target).parents('.js-member-parent');
		$('#editMemberModal').attr('data-member', editMemberElement[0].id);
		var name = $(target).parents('.js-member-parent').find('span.member-name');
		$('#update-firstname').val(name.attr('data-fname'));
		$('#update-firstname').attr('data-default-value', name.attr('data-fname'));
		$('#update-lastname').val(name.attr('data-lname'));
		$('#update-lastname').attr('data-default-value', name.attr('data-lname'));
		$('#username-field').text(name.data('slogin'));
		$('#username-field').attr('title',name.data('slogin'));
		$('#editMemberModal').foundation('reveal', 'open');
           }
        }

        function render(container, updateMemberCallback) {
            if (updateMemberCallback) {
                _c.externalUpdateMemberCallback = updateMemberCallback;
            }
            require(['text!groups/templates/roster.edit.member.modal.html'], function (template) {
                $(container).append(template);
                bindEvents();
            });
        }

        this.launch = launch;
        this.render = render;

    }
    return new rosterEditMemberView();
});
