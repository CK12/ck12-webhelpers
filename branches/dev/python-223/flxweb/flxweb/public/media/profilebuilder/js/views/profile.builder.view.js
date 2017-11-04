define(['jquery', 'common/views/share.via.email.view', 'common/utils/user', 'profilebuilder/templates/profile.builder.templates'], function ($, ShareEmailView, User) {
        'use strict';

        var profileBuilderController,
            memberName,
            emailTemplate,
            userLocation,
            userRoleName = '',
            userDetails = {
                'user_email': '',
                'loggedin': false,
            };
        function profileBuilderView() {

            function renderGrades(grades, isUnderage, memberGrades) {
                if (grades instanceof Array && grades.length) {
                    require(['text!profilebuilder/templates/grades.row.html'], function (template) {
                        for (var index = 0; index < grades.length; index++) {
                            var gradeHTML = template;
                            gradeHTML = gradeHTML.replace('@@gradeId@@', grades[index].id || '');
                            if (grades[index].id === 1) {
                                gradeHTML = gradeHTML.replace('@@gradeName@@', 'Kindergarten');
                                gradeHTML = gradeHTML.replace('@@inlineClass@@','');
                            } else {
                                gradeHTML = gradeHTML.replace('@@gradeName@@', grades[index].name);
                                gradeHTML = gradeHTML.replace('@@inlineClass@@','inlineGrades');
                            }
                            $('#gradeSelectionForm').append(gradeHTML);
                        }
                        bindEvents();
                        fetchUserInfo();
                        //If member is under 13, don't allow to change the role
                        if (isUnderage){
                            $('.role_container').off('click');
                            $('#next_btn').removeClass('grey disabled').removeAttr('disabled');
                        }
                        setMembergrades(memberGrades);
                    });
                }
            }

            function renderProfileInformation(result) {
                var member = result.member,
                grades = result.grades,
                allRoles = result.allRoles;
                require(['text!profilebuilder/templates/member.information.html'], function (template) {
                    var memberHTML = template;
                    memberName = member.lastName? member.firstName + ' ' + member.lastName:member.firstName;
                    memberHTML = memberHTML.replace('@@userName@@', memberName);
                    var rolesTxt = '';
                    var isValidRole = false;
                    for (var index = 0; index < allRoles.length; index++) {
                        if ( (""+member.role.id) === (""+allRoles[index].id) ) {
                            isValidRole = true;
                        }
                        rolesTxt += '<li id = '+ allRoles[index].id +' class="roleOption">' + allRoles[index].name + '</li>';
                    }
                    memberHTML = memberHTML.replace('@@userLocation@@', member.location || '');

                    $('#userInformationContainer').append(memberHTML);
                    $('#roleOptions').html(rolesTxt);
                    $('#impersonateMemberID').val(member.id);

                    if (member.imageURL){
                        $('.uploadimage_btn_display').text('Edit Photo');
                        $('#profileImage').attr('src', member.imageURL);
                    }

                    if (!isValidRole){
                        $('#gradeSelector').addClass('hide_within_PB');
                    }else{
                        $('#selectUserRole').text(member.role.name);
                        $('#next_btn').removeClass('grey disabled').removeAttr('disabled');
                        $('#selectUserRole').data('role-id',member.role.id);
                        if (!(member.isUnderage)){
                            $('#gradeSelector').removeClass('hide_within_PB');
                        }
                        roleChanged();
                    }

                    if (member.address){
                        userLocation = {};
                        userLocation.city = member.address.city;
                        userLocation.state = member.address.province;
                        userLocation.province = member.address.province;
                        userLocation.country = member.address.country;
                        userLocation.zip = member.address.postalCode;

                        var addressTxt = '';
                        var shrtAddressTxt = '';
                        var country = userLocation.country.split(': ');
                        if (country[0] === 'US') {
                            shrtAddressTxt = userLocation.city + ', ' + userLocation.state;
                            addressTxt = userLocation.city + ', ' + userLocation.province;
                            if (userLocation.zip){
                                addressTxt += ' ' + userLocation.zip;
                            }
                            $('#usLocation').val(addressTxt);

                            $('#usLocationContainer').show();
                            $('#internationalLocationContainer').hide();
                        }
                        else {
                            shrtAddressTxt = userLocation.city + ', ' + country[1];
                            addressTxt = userLocation.city + ', ' + userLocation.province + ', ' + country[1];
                            if (userLocation.zip){
                                addressTxt += ' ' + userLocation.zip;
                            }
                            $('#internationalLocation').val(addressTxt);

                            $('#usLocationContainer').hide();
                            $('#internationalLocationContainer').show();
                        }

                        $('.js_location_select_link').text(shrtAddressTxt);

                    }
                    renderGrades(grades, member.isUnderage, member.gradeIDs);
                    profileBuilderController.initImageUploader();
                    profileBuilderController.loadLocationService();
                });
            }

            function setMembergrades(memberGrades){
            	if (memberGrades.length){
            		if (parseInt($('#selectUserRole').data('role-id'), 10) === 5) {
            			for (var i = 0; i < memberGrades.length; i++) {
            				var grade = memberGrades[i]
	                        $('#gradeSelectionFormContainer #gradeSelectionForm #' + grade.id).toggleClass('selectdGrade');

	                        if ($('#gradeSelectionFormContainer #gradeSelectionForm .selectdGrade').length){
	                            $('.js_grade_select_link').text('');
	                            var gradesTxt = '';
	                            var cnt = 0;
	                            $("#gradeSelectionFormContainer #gradeSelectionForm .selectdGrade").each(function () {
	                                if (gradesTxt){
	                                    gradesTxt += ", " + grade.name;
	                                }else{
	                                    gradesTxt = grade.name;
	                                }
	                                cnt += 1;
	                            });

	                            var s = '';
	                            if (cnt > 1) {
	                                s = 's';
	                            }
	                            $('.js_grade_select_link').text('grade' + s + ' ' + gradesTxt.replace(/(.*),/, "$1 and "));
	                        }else{
	                            $('.js_grade_select_link').text('these grades');
	                        }
            			}
                    } else if (parseInt($('#selectUserRole').data('role-id'), 10) === 7) {
                    	var grade = memberGrades[0]
                        var superscript = '';
                        $('#gradeSelectionFormContainer #gradeSelectionForm #' + grade.id).addClass('selectdGrade');
                        if (grade.name === 'Kindergarten') {
                            $('.js_grade_select_link').text(grade.name);
                        } else {
                            if(grade.name === '1') {
                                superscript = 'st';
                            } else if(grade.name === '2') {
                                superscript = 'nd';
                            } else if(grade.name === '3') {
                                superscript = 'rd';
                            } else {
                                superscript = 'th';
                            }
                            $('.js_grade_select_link').text(grade.name + superscript + ' grade');
                        }
                    }
                }
            }
            function renderShareNotifaction(){
                $('#shareNotificationModal').foundation('reveal', 'open');
            }

            function shouldComponentRender(){
                var shouldRender = true;
                var location  = window.location.href;

                // Soft Reg related Issue
                // if( localStorage.getItem('disableSoftReg')||sessionStorage.getItem('disableSoftReg') ){
                //     return false;
                // }


                // expect this config to be an array of regex or regex
                var profileBuilderConfig =  window._profileBuilderConfig;
                if( profileBuilderConfig instanceof Array){
                    var rule;

                    for ( var i = 0, len = profileBuilderConfig.length; i < len ; i++ ){
                        rule =  profileBuilderConfig[i];
                        if( rule.test( location )){
                            shouldRender = false;
                            break;
                        }
                    }

                }else if ( profileBuilderConfig instanceof RegExp){
                        if ( profileBuilderConfig.test( location )){
                            shouldRender = false;
                        }
                }

                return shouldRender;
            }
            function hasRole(roles){
                return roles.some(function(role){
                    return role.name === 'student' || role.name === 'teacher';
                });
            }
            function isDashboard(){
                return /dashboard/.test(window.location.href);
            }
            function render(result,container) {
                if(! shouldComponentRender() || (hasRole(result.member.roles) && !isDashboard())) {
                    return
                };

            	var role;
                require(['profilebuilder/controllers/profile.builder', 'text!profilebuilder/templates/profile.builder.html'], function (controller, pageTemplate) {
                    function launchRenderProfileInfo(){
        		        profileBuilderController = controller;
        		        $('#'+container).html(pageTemplate);
    		            $('#profileBuilderModal').foundation('reveal', 'open');
                        renderProfileInformation(result);
                    }
                    if (result && result.member){
                        for(var i=0; i<result.member.roles.length; i++ ){
                        	if(result.member.roles[i].id === 16){
                        		role = "mentor";
                        		break
                        	}
                        }
                        if(window.location.href.match(/stu/) && !window.location.href.match(/dashboard/) && role !== "mentor"){
                    		$.cookie('ck12_no_profilebuilder', 'true');
                    		$.ajax({
                                url: "/auth/update/member/role/"+ result.member.id + "/16",
                                type: "POST",
                                success: function (result) {
                                	var member = {
                                            'roleID': 5
                                        };
                                		controller.saveUserProfile(function(){
                    			            console.log("updated profile updated for mentor flow");
                    			        }, member);
                                },
                                error: function () {
                                	console.log("error adding mentor");
                                }
                            });

                    	 }
                        if (result.member.isProfileUpdated === 1){
                            return false;
                        }
                        if ($.cookie('ck12_no_profilebuilder')){
        		            try{
            			        // From LTI launch role should already be set
            			        var member = {'roleID': result.member.role.id};
            			        controller.saveUserProfile(function(){
            			            console.log("updated profile");
            			            $.removeCookie('ck12_no_profilebuilder', {path:'/'});
            			        }, member);
        		            }catch (error){
        			            console.log("Could not update profile: " + error);
                                launchRenderProfileInfo();
        		            }
                        }else{
                            launchRenderProfileInfo();
                        }
                    }
                });
            }

            function shareOnEmail(event){
                $('#done_btn').trigger('click');
                if (! emailTemplate){
                    require(['text!profilebuilder/templates/share.registration.email.html'], function (template) {
                        emailTemplate = template;
                        emailTemplate = emailTemplate.replace('@@userName@@', memberName);
                        ShareEmailView.open({
                            'shareTitle': 'I joined CK-12!',
                            'shareUrl': window.location.href,
                            'shareBody': emailTemplate,
                            'userSignedIn': window.ck12_signed_in || false,
                            'context': 'Share CK-12 Foundation',
                            'payload': {
                                'memberID': ads_userid,
                            },
                            'userEmail': userDetails.user_email,
                            '_ck12': true
                        });
                    });
                } else {
                    ShareEmailView.open({
                        'shareTitle': 'I joined CK-12!',
                        'shareUrl': window.location.href,
                        'shareBody': emailTemplate,
                        'userSignedIn': window.ck12_signed_in || false,
                        'context': 'Share CK-12 Foundation',
                        'payload': {
                            'memberID': ads_userid,
                        },
                        'userEmail': userDetails.user_email
                    });
                }
            }

            function roleChanged(){
                var roleName = $("#selectUserRole").text();
                if (roleName === 'teacher'){
                    $('#gradeSelector').removeClass('hide_within_PB');
                    $('#gradeSelector .message').text('I teach');
                    $('.js_grade_select_link').text('these grades');
                }else if (roleName === 'parent'){
                    $('#gradeSelector').removeClass('hide_within_PB');
                    $('#gradeSelector .message').text("I'm interested in resources for:");
                }else if (roleName === 'student'){
                    $('#gradeSelector').removeClass('hide_within_PB');
                    $('#gradeSelector .message').text("I'm in");
                    $('.js_grade_select_link').text('select grade');
                } else {
                    $('#gradeSelector').addClass('hide_within_PB');
                }
            }

            function toggleLocationForm() {
                $('#internationalLocationContainer').toggle();
                $('#usLocationContainer').toggle();
            }

            function isTeacherCreatedAccount(email) {
                var result = email.match(/^(student-).*(@partners\.ck12\.org)$/g);
                if(result && result.length > 0){
                    return true;
                }
                return false;
            }

            function bindEvents() {
                function continueCallback() {
                    $('.close-reveal-modal', '#profileBuilderModal').trigger('click');
                    var js_profileImage = $('#profileImage').attr('src');
                    if (js_profileImage && js_profileImage.indexOf('flx/show') !== -1) {
                        js_profileImage = js_profileImage.replace('thumb_large', 'thumb_small');
                    }
                    $(".js_profile_image").attr('src',js_profileImage);
                    // renderShareNotifaction();
                }

                $('.js_international_location_select_link').off('click').on('click', function () {
                    toggleLocationForm();
                    return false;
                });
                $('.js_us_location_select_link').off('click').on('click', function () {
                    toggleLocationForm();
                    return false;
                });

                $('.image_upload_holder').off('click').on('click', function(e){
                    e.stopPropagation();
                });

                $('#locationSelectionFormContainer').off('click').on('click', function(e){
                    e.stopPropagation();
                });

                $('.js_location_select_link').off('click').on('click', function () {
                    $('#roleOptions').css({'display':'none'});
                    $('#gradeSelectionFormContainer').css({'display':'none'});
                    if($('#locationSelectionFormContainer').css('display') === 'none'){
                        $('#locationSelectionFormContainer').css({'display':'block'});
                    }else{
                        $('#locationSelectionFormContainer').css({'display':'none'});
                    }
                    return false;
                });

                User.getUser().done(function(userInfo){
                    if(!isTeacherCreatedAccount(userInfo.userInfoDetail.email)){
                        $('.role_container').off('click').on('click', function(){
                            if ($('#roleOptions').css('display') === 'none'){
                                $('#roleOptions').css({'display':'inline'});
                            }else{
                                $('#roleOptions').css({'display':'none'});
                            }
                            $('#gradeSelectionFormContainer').css({'display':'none'});
                            $('#locationSelectionFormContainer').css({'display':'none'});
                            return false;
                        });
                    }else{
                        $('.arrow-down-custom').addClass('hide_within_PB');
                        $('#selectUserRole').css({
                            cursor: 'default',
                            'font-weight': 'bold'
                        }).attr('class','');
                    }
                });

                $('.grade_container').off('click').on('click', function(){
                    if ($('#gradeSelectionFormContainer').css('display') === 'none'){
                        $('#gradeSelectionFormContainer').css({'display':'inline'});
                    }else{
                        //$('#gradeSelectionFormContainer').css({'display':'none'});
                    }
                    $('#roleOptions').css({'display':'none'});
                    $('#locationSelectionFormContainer').css({'display':'none'});
                    return false;
                });

                $('#profileBuilderModal').off('click').on('click', function(){
                    $('#roleOptions').css({'display':'none'});
                    $('#gradeSelectionFormContainer').css({'display':'none'});
                    $('#locationSelectionFormContainer').css({'display':'none'});
                    return false;
                });

                /*$('.js_grade_select_link').off('click').on('click', function () {
                    $('#gradeSelectionFormContainer').toggleClass('close').toggleClass('open');
                    return false;
                });*/

                $('.roleOption').off('click').on('click', function () {
                    $('#selectUserRole').text($(this).text());
                    $('#selectUserRole').data('role-id',$(this).attr('id'));
                    $('#roleOptions').css({'display':'none'});
                    $('.selectdGrade').removeClass('selectdGrade');
                    $('#next_btn').removeClass('grey disabled').removeAttr('disabled');
                    roleChanged();
                    return false;
                });

                $('.grades').off('click').on('click', function () {
                    if (parseInt($('#selectUserRole').data('role-id'), 10) === 5) {
                        $(this).toggleClass('selectdGrade');

                        if ($('#gradeSelectionForm .selectdGrade').length){
                            $('.js_grade_select_link').text('');
                            var gradesTxt = '';
                            var cnt = 0;
                            $("#gradeSelectionForm .selectdGrade").each(function () {
                                if (gradesTxt){
                                    gradesTxt += ", " + $(this).text();
                                }else{
                                    gradesTxt = $(this).text();
                                }
                                cnt += 1;
                            });

                            var s = '';
                            if (cnt > 1) {
                                s = 's';
                            }
                            $('.js_grade_select_link').text('grade' + s + ' ' + gradesTxt.replace(/(.*),/, "$1 and "));
                        }else{
                            $('.js_grade_select_link').text('these grades');
                        }
                    } else if (parseInt($('#selectUserRole').data('role-id'), 10) === 7) {
                        var superscript = '';
                        $('.selectdGrade').removeClass('selectdGrade');
                        $(this).addClass('selectdGrade');
                        if ($(this).text() === 'Kindergarten') {
                            $('.js_grade_select_link').text($(this).text());
                        } else {
                            if($(this).text() === '1') {
                                superscript = 'st';
                            } else if($(this).text() === '2') {
                                superscript = 'nd';
                            } else if($(this).text() === '3') {
                                superscript = 'rd';
                            } else {
                                superscript = 'th';
                            }
                            $('.js_grade_select_link').text($(this).text() + superscript + ' grade');
                        }
                    }
                });

                $('#next_btn').off('click.create').on('click.create', updateProfile);
                $('#shareOnEmail').off('click.create').on('click.share', shareOnEmail);

                var locationChangedCallback = function(address) {
                    userLocation = address;
                    var shrtAddressTxt = '';
                    var country = userLocation.country.split(': ');
                    if (country[0] === 'US') {
                        shrtAddressTxt = userLocation.city + ', ' + userLocation.state;
                    }
                    else {
                        shrtAddressTxt = userLocation.city + ', ' + country[1];
                    }
                    $('.js_location_select_link').text(shrtAddressTxt);
                    $('#locationSelectionFormContainer').css({'display':'none'});
                };
                profileBuilderController.setLocationChangedCallback(locationChangedCallback);

                function updateProfile(e) {
                    e.preventDefault();
                    var roleID, imageURL, member;
                    var grades = new Array();
                    roleID = $('#selectUserRole').data('role-id');
                    if (!roleID){
                        alert("Please select a role. This is the only information that we require.");
                        return false;
                    }
                    userRoleName = $('#selectUserRole').text();
                    $("#gradeSelectionForm .selectdGrade").each(function () {
                        grades[grades.length] = $(this).attr("id");
                    });

                    member = {
                        'roleID': roleID
                    };

                    if ($('#profileImage').data('default-image') === 'false'){
                        imageURL = $('#profileImage').data('image-url');
                        member.imageURL = imageURL;
                    }

                    if (userLocation) {
                        $.each(userLocation,function(key, value){
                            member[key] = value;
                        });
                        // ADS tracks FBS_LOCATION_INFO
                        var payload = {};
                        payload.referrer = 'profile_builder';
                        if (window._ck12){
                            _ck12.logEvent('FBS_LOCATION_INFO', payload);
                        }
                    }

                    if (grades){
                        member.gradeIDs = JSON.stringify(grades);
                    }
                    profileBuilderController.saveUserProfile(continueCallback, member);

                    $('.close-reveal-modal', '#shareNotificationModal').trigger('click');
                    $('.reveal-modal-bg').css({'display':'none'});
                    $.event.trigger('profile.builder.post.processing', userRoleName);
                }
            }

            function fetchUserInfo() {
                var user = new User();
                user.fetch({
                    'success': function(model, userInfo) {
                        userDetails = {
                                'user_email': userInfo.email || '',
                                'loggedin': true,
                        };

                    }
                });
            }

            this.render = render;

            this.profileImageUploadCallback = function(image){
                if (image.uri){
                    $('#profileImage').attr('src', image.display_uri);
                    $('#profileImage').data('image-url', image.uri);
                    $('#profileImage').data('default-image', 'false');
                    $("#ajaxLoadingWait").addClass('hide_within_PB');
                    $("#profileImage").removeClass('hide_within_PB');
                }
            }

        }

        return new profileBuilderView();
    });
