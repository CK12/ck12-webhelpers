/* global default_values,gradesMap,userSchool,loggedInUserID,_ck12 */
define(['jquery',
    'common/utils/utils',
    'profilebuilder/services/ck12.locationService',
    'profilebuilder/services/image.upload'
], function ($, util, locationService, imageService) {

    'use strict';

    var usLocationService,
        intLocationService,
        cache = [],
        cacheTerm = [],
        userLocation,
        teacher_prof_progress = {
            'editImageURL': 16.67,
            'editRole': 16.67,
            'editLocation': 16.67,
            'editGrades': 16.67,
            'editSubjects': 16.67,
            'editSchool': 16.67
        },
        student_prof_progress = {
            'editImageURL': 16.67,
            'editRole': 16.67,
            'editLocation': 16.67,
            'editGrades': 16.67,
            'editSubjects': 16.67,
            'editSchool': 16.67
        };

    function drawProgress(canvasID, percent, lineColor, lineWidth, textColor, textFont) {
        lineColor = lineColor || 'black';
        lineWidth = lineWidth || 14;
        textColor = textColor || 'white';
        textFont = textFont || 'bold 18px ProximaNova';

        var context, x, y, radius, deg, startAngle, endAngle, counterClockwise,
            canvas = document.getElementById(canvasID);
        if (canvas) {
            context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            x = canvas.width / 2;
            y = canvas.height / 2;
            radius = y - parseInt((lineWidth / 2), 10) - 2;

            deg = ((360 * percent) / 100);
            startAngle = (-90 * Math.PI) / 180;
            endAngle = ((deg - 90) * Math.PI) / 180;
            endAngle = Math.round(endAngle * 100) / 100;
            counterClockwise = false;

            context.beginPath();
            context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
            context.lineWidth = lineWidth;

            // line color
            context.strokeStyle = lineColor;
            context.stroke();

            context.font = textFont;
            context.fillStyle = textColor;
            // textAlign aligns text horizontally relative to placement
            context.textAlign = 'center';
            // textBaseline aligns text vertically relative to font style
            context.textBaseline = 'middle';
            context.fillText(percent + '%', x, y);
        }
    }

    function calculateProfileProgress() {
        default_values.editRole = ($('.profile-item .role-name').text() || '').trim();
        var key,
            incomp_key = '',
            progress = 0,
            progress_ref = default_values.editRole === 'Teacher' ? teacher_prof_progress : student_prof_progress;
        for (key in progress_ref) {
            if (progress_ref.hasOwnProperty(key)) {
                if (default_values[key]) {
                    progress += progress_ref[key];
                } else {
                    if (incomp_key === '') {
                        incomp_key = key;
                    }
                }
            }
        }

        if (incomp_key) {
            if (default_values.editRole === 'Student') {
                $('#hintGrades').find('a').text('Add a grade');
            } else {
                $('#hintGrades').find('a').text('Add grades');
            }
            $('#profileIncomplete').removeClass('hide');
            $('#profileIncomplete .hint-link').addClass('hide');
            $('#hint' + (incomp_key.replace('edit', ''))).removeClass('hide');
            $('#profileComplete').addClass('hide');
        } else {
            $('#profileIncomplete').addClass('hide');
            $('#profileComplete').removeClass('hide');
        }
        return Math.round(progress);
    }

    function setProfileProgressRing() {
        drawProgress('progress-ring-profile', calculateProfileProgress(), '#B8D543', 7, '#FFFFFF', 'bold 18px ProximaNova');
    }

    function imageUploadDone(image) {
        if (image.uri) {
            var s = '/flx/show/thumb_small/image',
                l = '/flx/show/thumb_large/image';
            $('.user-info img.image-user').attr('src', image.uri.replace('/flx/show/image', s));
            $('#profileImage').attr('src', image.uri.replace('/flx/show/image', l));
            default_values.editImageURL = image.uri.replace('/flx/show/image', l);
            setProfileProgressRing();
            removeProfileLocalStorage();
            $('#ajaxLoadingWait').addClass('hide');
            $('#profileImage').removeClass('hide');
        }
    }

    function locationInputChanegd() {
        if ((!($('#usLocation').text() || '').trim()) && (!($('#internationalLocation').text() || '').trim())) {
            $('#saveLocation').find('span').removeClass('change-handle').addClass('inactive-handle');
        }
    }

    function extractLocation() {
        var zip, country, state,
            location = false;
        userLocation = default_values.editLocation;
        if (userLocation && userLocation !== 'null') {
            location = {};

            zip = userLocation.zip || userLocation.postalCode;
            country = userLocation.country.split(': ');
            location.countryCode = country[0];
            location.shortAddr = userLocation.city;
            location.longAddr = userLocation.city;
            if (country[0] === 'US') {
                state = userLocation.state || userLocation.province;
                location.shortAddr += ', ' + state;
                location.longAddr += ', ' + state;
            } else {
                location.shortAddr += ', ' + country[1];
                location.longAddr += ', ' + (userLocation.province || userLocation.state);
            }
            location.longAddr += ', ' + country[1];
            if (zip) {
                location.longAddr += ', ' + zip;
            }
        }
        return location;
    }

    function locationChangedCallback(address) {
        default_values.editLocation = userLocation = address;
        $('#lblUserLocation').text(extractLocation().shortAddr);
        $('#saveLocation').find('span').removeClass('inactive-handle').addClass('change-handle');
    }

    /*function toggleLocationForm() { // not used in this file
        $('#internationalLocationContainer').toggleClass('hidden');
        $('#usLocationContainer').toggleClass('hidden');
    }*/

    function setLocation() {
        var location, $lbl = $('#lblUserLocation');
        if ($lbl) {
            location = extractLocation();
            $lbl.text('somewhere, some state');
            if (location) {
                $lbl.text(location.shortAddr);

                if (location.countryCode === 'US') {
                    $('#usLocation').val(location.longAddr);
                    $('#internationalLocation').val('');
                    $('#usLocationContainer').removeClass('hidden');
                    $('#internationalLocationContainer').addClass('hidden');
                } else {
                    $('#usLocation').val('');
                    $('#internationalLocation').val(location.longAddr);
                    $('#usLocationContainer').addClass('hidden');
                    $('#internationalLocationContainer').removeClass('hidden');
                }
            }
        }
    }

    function resetField(editTo) {
        var _grades, _subjects,
            $this = $('#' + editTo);
        if (editTo === 'editGrades') {
            $('#grades-container').addClass('hidden');
            $this.siblings().filter('#saveGrades').addClass('hidden');
            $this.siblings().filter('#saveGrades').find('span').removeClass('change-handle').addClass('inactive-handle');

            _grades = [];
            if (default_values[editTo] !== '') {
                _grades = default_values[editTo].split(',');
                $this.removeClass('hidden');
            } else {
                $this.addClass('hidden');
                if ($this.parent().attr('data-roleid') === '5') {
                    $('.grade-text').remove();
                    $this.parent().prepend('<span class="grade-text">Who teaches grade</span><span id="grade_plural" class="grade-text"></span> <span id="memberGrades" class="grade-text"></span>');
                    $this.siblings().filter('#add-grade').addClass('hidden');
                } else {
                    $('.grade-text').remove();
                    $this.siblings().filter('#add-grade').removeClass('hidden');
                }
            }
            if ($this.parent().attr('data-roleid') === '5') {
                $this.removeClass('hidden');
            }
            if (_grades.length === 1) {
                $('#grade_plural').text('');
            } else {
                $('#grade_plural').text('s');
            }
            $.each($('#grades-container li.grade'), function (index, value) {
                if ($.inArray(gradesMap[value.id], _grades) !== -1) {
                    $(value).addClass('selectedGrade');
                } else {
                    $(value).removeClass('selectedGrade');
                }
            });
        } else if (editTo === 'editSchool') {
            $('#school-container').addClass('hidden');
            $this.siblings().filter('#saveSchool').addClass('hidden');
            $this.siblings().filter('#saveSchool').find('span').removeClass('change-handle').addClass('inactive-handle');

            $('#schoolAutosuggest').addClass('hidden');
            $('#schoolAutosuggest li').remove();
            $('#schoolInfo').val('');
            $('#schoolInfo').removeAttr('data-id');
            $('#schoolInfo').removeAttr('data-name');

            if (!(default_values[editTo]) || $.isEmptyObject(default_values[editTo])) {
                $this.siblings().filter('#add-school').removeClass('hidden');
                $('#add-school-at').addClass('hide');
                $this.addClass('hidden');
            } else {
                $this.removeClass('hidden');
                if ($('#memberSchool').length) {
                    $('#memberSchool').removeClass('hidden');
                    $('#memberSchool').prev().removeClass('hidden');
                } else {
                    $('#add-school').after('<span id="add-school-at">at </span><span id="memberSchool">' + default_values[editTo] + '</span>');
                }
            }
        } else if (editTo === 'editSubjects') {
            $('#subjects-container').addClass('hidden');
            $this.siblings().filter('#saveSubjects').addClass('hidden');
            $this.siblings().filter('#saveSubjects').find('span').removeClass('change-handle').addClass('inactive-handle');

            _subjects = [];
            if (default_values[editTo] !== '') {
                _subjects = default_values[editTo].split(',');
                $this.removeClass('hidden');
            } else {
                $this.siblings().filter('#add-subjects').removeClass('hidden');
                $('#memberSubjects').prev('span').remove();
                $('#memberSubjects').remove();
                $this.addClass('hidden');
            }
            $.each($('#subjects-container li.js-subject-list-item'), function (index, value) {
                if ($.inArray($(this).text().toLowerCase(), _subjects) !== -1) {
                    $(value).addClass('selectedSubject');
                    $(value).find('.select-icon').addClass('icon-checkmark');
                } else {
                    $(value).removeClass('selectedSubject');
                    $(value).find('.select-icon').removeClass('icon-checkmark');
                }
            });
        } else if (editTo === 'editWebsite') {
            $this.siblings().filter('#website').val(default_values[editTo]);
            $this.siblings().filter('#website').addClass('hidden');
            $this.siblings().filter('#saveWebsite').addClass('hidden');
            $this.siblings().filter('#saveWebsite').find('span').removeClass('change-handle').addClass('inactive-handle');
            if (default_values[editTo] === '') {
                $this.siblings().filter('.website-item').addClass('hidden');
                $this.siblings().filter('#add-website').removeClass('hidden');
                $this.addClass('hidden');
            } else {
                $this.siblings().filter('.website-item').addClass('hidden');
                $this.siblings().filter('.website').removeClass('hidden');
                //$this.siblings().filter('.website').text(default_values[editTo].replace(/http:\/\/|https:\/\/(.*)/, '$1'));
                $this.siblings().filter('.website').text(default_values[editTo]);
                $this.siblings().filter('.website').attr('href', default_values[editTo]);
                $this.removeClass('hidden');
            }
        } else if (editTo === 'editLocation') {
            userLocation = default_values[editTo];
            setLocation();
            $('#location-container').addClass('hidden');
            $this.siblings().filter('#saveLocation').find('span').removeClass('change-handle').addClass('inactive-handle');
            $this.siblings().filter('#saveLocation').addClass('hidden');
            $this.removeClass('hidden');
        } else if (editTo === 'editName') {
            $this.siblings().filter('#member-name').val($('<div/>').html(default_values[editTo]).text());
            $this.siblings().filter('.member-name').text(default_values[editTo]);
            $this.siblings().filter('#member-name').addClass('hidden');
            $this.siblings().filter('.member-name').removeClass('hidden');
            $this.siblings().filter('#saveName').addClass('hidden');
            $this.siblings().filter('#saveName').find('span').removeClass('change-handle').addClass('inactive-handle');
            $this.removeClass('hidden');
            $this.siblings().filter('#member-name').removeClass('error');
            $('#member-name-error').text('');
        } else if (editTo === 'editRole') {
            $this.siblings().filter('#roleList').addClass('hidden').find('.roleOption').removeClass('selected-role');
            $this.siblings().filter('.role-name').removeClass('hidden');
            $this.siblings().filter('#saveRole').addClass('hidden').find('span').removeClass('change-handle').addClass('inactive-handle');
            $this.removeClass('hidden');
        }
    }

    function resetEditForm() {
        /*
        $('#saveLocation').addClass('hidden');
        $('#saveGrades').addClass('hidden');
        $('#saveWebsite').addClass('hidden');

        $('#editLocation').removeClass('hidden');
        $('#editGrades').removeClass('hidden');
        $('#editWebsite').removeClass('hidden');

        $('#website').addClass('hidden');
        $('#grades-container').addClass('hidden');
        $('#location-container').addClass('hidden');
        $('.website-item').removeClass('hidden');
        */
        resetField('editName');
        resetField('editWebsite');
        resetField('editGrades');
        resetField('editSchool');
        resetField('editSubjects');
        resetField('editLocation');
        resetField('editRole');
    }

    function validateEl(el, evt, handle) {
        var $this,
            editHandle = 'edit' + handle,
            saveHandle = 'save' + handle,
            charCode = evt.which || evt.keyCode;
        if (charCode === 27) {
            // ESC key
            resetField(editHandle);
            //if (evt.preventDefault) evt.preventDefault();
        } else {
            $this = $(el);
            if (editHandle === 'editName' && !($this.val() || '').trim()) {
                $('#member-name-error').text('Enter your name.');
                $('#member-name').addClass('error');
                $('#' + saveHandle).find('span').removeClass('change-handle').addClass('inactive-handle');
                return false;
            }
            if (editHandle === 'editName' && ($this.val() || '').trim()) {
                $('#member-name-error').text('');
                $('#member-name').removeClass('error');
            }

            if ($this.val() !== default_values[editHandle]) {
                $('#' + saveHandle).find('span').removeClass('inactive-handle').addClass('change-handle');
                if (charCode === 13) {
                    $('.icon-checkmark.change-handle').trigger('click');
                }
            } else {
                $('#' + saveHandle).find('span').removeClass('change-handle').addClass('inactive-handle');
                if (charCode === 13) {
                    resetField(editHandle);
                }
            }
        }
    }

    function dummyEvent(e) {
        e.stopPropagation();
        return false;
    }

    function handleEdit(editTo) {
        var $this = $('#' + editTo);
        if (editTo === 'editGrades') {
            $('#grades-container').removeAttr('style');
            $this.siblings().filter('ul').removeClass('hidden');
            $this.siblings().filter('#saveGrades').removeClass('hidden');
            $this.siblings().filter('#add-grade').addClass('hidden');
            $this.addClass('hidden');
            if (window.innerWidth < 768) {
                $('#grades-container').foundation('reveal', 'open');
            }
        } else if (editTo === 'editSchool') {
            $('#school-container').removeAttr('style');
            $('#school-container').removeClass('hidden');
            if (userSchool.schoolType !== 'home') {
                $('#schoolInfo').val(default_values.editSchool);
                $('#masterSchool').prop('checked', 'checked');
            } else {
                $('#schoolInfo').val('');
                $('#homeSchool').prop('checked', 'checked');
            }
            $('#saveSchool').removeClass('hidden');
            $this.siblings().filter('#add-school').addClass('hidden');
            $this.addClass('hidden');
            if (window.innerWidth < 768) {
                $('#school-container').foundation('reveal', 'open');
            }
        } else if (editTo === 'editSubjects') {
            $('#subjects-container').removeAttr('style');
            $this.siblings().filter('ul').removeClass('hidden');
            $this.siblings().filter('#saveSubjects').removeClass('hidden');
            $this.siblings().filter('#add-subjects').addClass('hidden');
            $this.addClass('hidden');
            if (window.innerWidth < 768) {
                $('#subjects-container').foundation('reveal', 'open');
            }
        } else if (editTo === 'editWebsite') {
            $this.siblings().filter('#saveWebsite').removeClass('hidden');
            $this.addClass('hidden');
            $this.siblings().filter('.website-item').addClass('hidden');
            $this.siblings().filter('#add-website').addClass('hidden');
            $this.siblings().filter('input').removeClass('hidden');
            $this.siblings().filter('input').focus();
            /*
            if (($this.siblings().filter('.website-item').text() || '').trim() !== '+ add a website'){
                $this.siblings().filter('input').val($this.siblings().filter('.website-item').text());
            }else{
                $this.siblings().filter('input').attr('placeholder',$this.siblings().filter('.website-item').text());
            }
            */
        } else if (editTo === 'editLocation') {
            $('#location-container').removeAttr('style');
            $('#location-container').removeClass('hidden');
            $this.siblings().filter('#saveLocation').removeClass('hidden');
            $this.addClass('hidden');
            if (window.innerWidth < 768) {
                $('#location-container').foundation('reveal', 'open');
            }
        } else if (editTo === 'editName') {
            $this.siblings().filter('#saveName').removeClass('hidden');
            $this.addClass('hidden');
            $this.siblings().filter('.member-name').addClass('hidden');
            $this.siblings().filter('input').removeClass('hidden');
            $this.siblings().filter('input').focus();
        } else if (editTo === 'editRole') {
            $this.siblings().filter('#saveRole').removeClass('hidden');
            $this.addClass('hidden');
            $('#roleList').removeClass('hidden');
            $this.siblings().filter('.role-name').addClass('hidden');
        }
    }

    function bindEventsForSubjects() {
        $('.js-subject-list-item').off('click.select').on('click.select', function (e) {
            e.stopPropagation();
            $(this).toggleClass('selectedSubject').find('.select-icon').toggleClass('icon-checkmark');
            var subjectsText = '';
            $('#subjects-container .selectedSubject').each(function () {
                subjectsText += subjectsText ? ', ' + ($(this).text() || '').trim() : ($(this).text() || '').trim();
            });
            subjectsText = subjectsText.replace(/(.*),/, '$1 and');
            if (subjectsText.replace(/and/g, ',').replace(/ /g, '') === default_values.editSubjects) {
                $('#saveSubjects').find('span').addClass('inactive-handle').removeClass('change-handle');
            } else {
                $('#saveSubjects').find('span').removeClass('inactive-handle').addClass('change-handle');
            }
        });

        $('#subjects-container').off('click.select').on('click.select', function (e) {
            e.stopPropagation();
        });

        if (window.innerWidth < 768) {
            $('#editSubjects').find('.icon-edit').attr('data-reveal-id', 'subjects-container');
            $('#subjects-container').addClass('reveal-modal');
        }

        $(window).off('resize.subject').on('resize.subject', function () {
            if ($(window).width() < 768) {
                $('#editsubjects').find('.icon-edit').attr('data-reveal-id', 'subjects-container');
                $('#subjects-container').addClass('reveal-modal');
            } else {
                $('#editSubjects').find('.icon-edit').removeAttr('data-reveal-id');
                $('#subjects-container').removeClass('reveal-modal');
                $('#subjects-container').removeAttr('style');
            }
        });

        $('#subjects-container').bind('closed', function () {
            $('body').trigger('click.save');
        });
    }

    function renderSubjects(subjects) {
        var index, temp = '';
        for (index = 0; index < subjects.length; index++) {
            temp = temp + '<li data-encodedid="' + subjects[index].subjectID + '.' + subjects[index].shortname + '" class="subject-list-item js-subject-list-item"><span class="select-icon"></span><span>' + subjects[index].name + '</span></li>';
        }
        $('#add-subjects').after('<ul id="subjects-container" class="hidden"></ul>');
        $('#subjects-container').html(temp);
        bindEventsForSubjects();
    }

    function getSubjects(branch, params) {
        return util.ajax({
            url: util.getApiUrl('taxonomy/get/info/branches/' + branch),
            data: params
        }).then(function (subjects) {
            return subjects.response.branches;
        });
    }

    function loadSubjects() {
        var params = {
            'pageNum': '1',
            'pageSize': '20'
        };
        $.when(getSubjects('MAT', params), getSubjects('SCI', params), getSubjects('ELA', params)).done(function (mat, sci, ela) {
            renderSubjects(mat.concat(sci, ela));
        }).fail(function () {
            console.log('Sorry, we could not load the subjects. Please try again later.');
        });
    }

    function updateSchool() {
        var school, schoolID, schoolType, schoolName;
        schoolID = $('#schoolInfo').attr('data-id');
        schoolName = ($('#schoolInfo').val() || '').trim();
        if ($('#masterSchool').is(':checked')) {
            if (schoolID) {
                schoolType = 'usmaster';
                school = {
                    'schoolID': schoolID,
                    'schoolType': schoolType,
                    'invalidate_client': true
                };
            } else {
                schoolType = 'other';
                school = {
                    'schoolName': encodeURI(schoolName),
                    'schoolType': schoolType,
                    'invalidate_client': true
                };
            }
        } else {
            schoolType = 'home';
            schoolName = 'a homeschool';
            school = {
                'schoolType': schoolType,
                'invalidate_client': true
            };
        }
        util.ajax({
            url: util.getApiUrl('auth/update/member/' + loggedInUserID),
            data: school,
            type: 'POST',
            success: function (result) {
                if (result && result.response) {
                    $('#memberSchool').text(schoolName);
                    if (schoolType === 'home') {
                        userSchool.schoolType = 'home';
                    } else {
                        userSchool.schoolType = '';
                    }
                    default_values.editSchool = schoolName;
                    resetField('editSchool');
                }
                setProfileProgressRing();
                removeProfileLocalStorage();
            }
        });
    }

    function renderSchools(value, schools) {
        var index, htmlString, re, $schoolInfo, $schoolAutosuggest, str = '';
        $schoolInfo = $('#schoolInfo');
        $schoolAutosuggest = $('#schoolAutosuggest');
        $schoolAutosuggest.removeClass('hidden');
        $('#schoolAutosuggest li').remove();
        $schoolAutosuggest = $('#schoolAutosuggest');
        value = value.toUpperCase();
        for (index = 0; index < schools.length; index++) {
            re = new RegExp(value);
            htmlString = schools[index].name.replace(re, '<span style="font-weight:bold">' + value + '</span>');
            str += '<li data-id="' + schools[index].id + '" data-name="' + schools[index].name + '">' + htmlString + '<span class="school-state"> (' + schools[index].city + ',' + schools[index].state + ')</span></li>';
        }
        $schoolAutosuggest.append(str);
        $('#schoolAutosuggest li').off('click.select').on('click.select', function () {
            $('#saveSchool').find('span').removeClass('inactive-handle').addClass('change-handle');
            $('#schoolAutosuggest').addClass('hidden');
            $schoolInfo.val($(this).attr('data-name'));
            $schoolInfo.attr('data-id', $(this).attr('data-id'));
            $schoolInfo.attr('data-name', $(this).attr('data-name'));
            $schoolInfo.focus();
        });
    }

    function schoolAutoComplete(thisElement) {
        var city, country, state, value, url;
        value = ($(thisElement).val() || '').trim();
        if (userLocation && userLocation !== 'null') {
            country = userLocation.country.split(': ');
            city = userLocation.city;
            if (country[0] === 'US') {
                state = userLocation.state || userLocation.province;
            }
        }
        url = util.getApiUrl('auth/search/school/' + value);
        if (value) {
            url += state ? '?state=' + state + '&city=' + city : '';
            util.ajax({
                url: url,
                success: function (result) {
                    if (result && result.response && result.response.schools) {
                        cache[value] = result.response.schools;
                        value = ($(thisElement).val() || '').trim();
                        if (cache.hasOwnProperty(value)) {
                            renderSchools(value, cache[value]);
                        }
                    }
                },
                error: function () {
                    console.log('error');
                }
            });
        }
    }

    function handleLocationKeyup(evt) {
        var charCode = evt.which || evt.keyCode;
        if (charCode === 27) {
            // ESC key
            resetField('editLocation');
            //if (evt.preventDefault) evt.preventDefault();
        } else if (charCode === 13) {
            if ($('.icon-checkmark.change-handle').length) {
                $('.icon-checkmark.change-handle').trigger('click');
            } else {
                resetField('editLocation');
            }
        }
    }

    function saveGrades(context, reset) {
        var gradeIDs, grades = '';
        $('#grades-container .selectedGrade').each(function () {
            grades += grades ? ',' + ($(this).attr('id') || '').trim() : ($(this).attr('id') || '').trim();
        });
        if (reset && grades.length > 1) {
            grades = '';
        }
        //TODO : Add check skip, if member role is student
        gradeIDs = {
            'gradeIDs': grades
        };
        util.ajax({
            url: util.getApiUrl('auth/set/member/grades'),
            data: gradeIDs,
            type: 'POST',
            success: function (result) {
                $('#grades-container').addClass('hidden');
                $(context).parent().siblings().filter('#editGrades').removeClass('hidden');
                $(context).parent().addClass('hidden');
                if (result && result.result && result.result.length) {
                    var gradesText = '',
                        gradeName;
                    $.each(result.result, function (index, grade) {
                        gradesText += gradesText ? ', ' + grade.name : grade.name;
                    });
                    if ($(context).parents('.profile-item').attr('data-roleid') === '7') {
                        if (reset) {
                            $('.grade-text').remove();
                        }
                        if (!$('#memberGrades').length) {
                            $('#add-grade').after('<span class="grade-text">in </span><span class="grade-text" id="memberGrades"></span>');
                        }
                        gradeName = result.result[0].name;
                        if (gradeName === 'Kindergarten') {
                            $('#memberGrades').text('Kindergarten');
                        } else if (gradeName === '1') {
                            $('#memberGrades').text('1st grade');
                        } else if (gradeName === '2') {
                            $('#memberGrades').text('2nd grade');
                        } else if (gradeName === '3') {
                            $('#memberGrades').text('3rd grade');
                        } else {
                            $('#memberGrades').text(gradeName + 'th grade');
                        }
                    } else {
                        if (reset) {
                            $('.grade-text').remove();
                        }
                        if (!$('#memberGrades').length) {
                            $('#grades-container').parent('.profile-item').prepend('<span class="grade-text">Who teaches grade</span><span id="grade_plural" class="grade-text"></span> <span id="memberGrades" class="grade-text"></span>');
                        }
                        $('#memberGrades').text(gradesText.replace(/(.*),/, '$1 and '));
                    }
                    default_values.editGrades = gradesText.replace(/ /g, '');
                    resetField('editGrades');
                } else {
                    $.each($('#grades-container li.grade'), function (index, value) {
                        $(value).removeClass('selectedGrade');
                    });
                    default_values.editGrades = '';
                    resetField('editGrades');
                }
                setProfileProgressRing();
                removeProfileLocalStorage();
            }
        });
    }

    function removeProfileLocalStorage() {
        var smartcache_instance, userDetailCacheOptions = {
                region: 'daily',
                key: 'userProfileData',
                namespace: 'userProfile',
                cacheSpace: 'session',
                encrypt: true
            };
        smartcache_instance = new window.SmartCache();
        smartcache_instance.remove('userProfileData', userDetailCacheOptions);
    }

    function bindEvents() {
        $('.back-icon').off('click.back').on('click.back', function () {
            window.history.back();
        });

        $(window).off('resize.grade').on('resize.grade', function () {
            if ($(window).width() < 768) {
                $('#editGrades').find('.icon-edit').attr('data-reveal-id', 'grades-container');
                $('#grades-container').addClass('reveal-modal');

                $('#editLocation').find('.icon-edit').attr('data-reveal-id', 'location-container');
                $('#location-container').addClass('reveal-modal');

                $('#editSchool').find('.icon-edit').attr('data-reveal-id', 'school-container');
                $('#school-container').addClass('reveal-modal');
            } else {
                $('.reveal-modal').foundation('reveal', 'close');
                $('#editGrades').find('.icon-edit').removeAttr('data-reveal-id');
                $('#grades-container').removeClass('reveal-modal');
                $('#grades-container').removeAttr('style');

                $('#editLocation').find('.icon-edit').removeAttr('data-reveal-id');
                $('#location-container').removeClass('reveal-modal');
                $('#location-container').removeAttr('style');

                $('#editSchool').find('.icon-edit').removeAttr('data-reveal-id');
                $('#school-container').removeClass('reveal-modal');
                $('#school-container').removeAttr('style');
            }
        });

        $('#school-container label').off('click.select').on('click.select', function () {
            $(this).prev('input').prop('checked', true);
            $('#saveSchool').find('span').removeClass('inactive-handle').addClass('change-handle');
        });

        $('#hintRole a').off('click.save').on('click.save', function (e) {
            e.stopPropagation();
            handleEdit('editRole');
        });
        $('#hintImageURL a').off('click.save').on('click.save', function () {
            $('#resourcePath').trigger('click');
        });
        $('#hintLocation a').off('click.save').on('click.save', function (e) {
            e.stopPropagation();
            handleEdit('editLocation');
        });
        $('#hintGrades a').off('click.save').on('click.save', function (e) {
            e.stopPropagation();
            handleEdit('editGrades');
        });
        $('#hintWebsite a').off('click.save').on('click.save', function (e) {
            e.stopPropagation();
            handleEdit('editWebsite');
        });
        $('#hintSubjects a').off('click.save').on('click.save', function (e) {
            e.stopPropagation();
            handleEdit('editSubjects');
        });
        $('#hintSchool a').off('click.save').on('click.save', function (e) {
            e.stopPropagation();
            handleEdit('editSchool');
        });
        $('#hintClose').off('click.save').on('click.save', function () {
            $('.progress-hint-wrap').hide();
            if ($(window).width() < 768) {
                $('.card-wrap .profile-img-wrap').addClass('no-progress');
            }
        });

        $('.icon-edit').off('click.save').on('click.save', function (e) {
            e.stopPropagation();
            resetEditForm();
            handleEdit($(this).parent().attr('id'));
            return false;
        });

        $('#schoolInfo').off('keyup.school').on('keyup.school', function (evt) {
            var value, thisElement = this;
            if ((evt.which || evt.keyCode) === 13) {
                $('.icon-checkmark.change-handle').trigger('click');
            } else {
                $('#saveSchool').find('span').removeClass('inactive-handle').addClass('change-handle');
                value = ($(thisElement).val() || '').trim();
                if (value !== '') {
                    if (cache.hasOwnProperty(value)) {
                        renderSchools(value, cache[value]);
                    } else {
                        setTimeout(function () {
                            value = ($(thisElement).val() || '').trim();
                            if (value !== '' && cacheTerm.indexOf(value) === -1) {
                                cacheTerm.push(value);
                                schoolAutoComplete(thisElement);
                            }
                        }, 500);
                    }
                } else {
                    $('#schoolAutosuggest').addClass('hidden');
                    $('#schoolAutosuggest li').remove();
                }
            }
        });

        $('.icon-checkmark').off('click.save').on('click.save', function (e) {
            e.stopPropagation();
            if ($(this).hasClass('inactive-handle')) {
                resetField($(this).parent().siblings().filter('.edit').attr('id'));
                return false;
            }
            var error, val, member, arr, $role, subjects, context, saveTo = $(this).parent().attr('id');

            if (saveTo === 'saveGrades') {
                context = this;
                saveGrades(context);
            } else if (saveTo === 'saveSchool') {
                updateSchool();
            } else if (saveTo === 'saveSubjects') {
                subjects = '';
                $('#subjects-container .selectedSubject').each(function () {
                    subjects += subjects ? ',' + ($(this).text().toLowerCase() || '').trim() : ($(this).text().toLowerCase() || '').trim();
                });
                subjects = {
                    'subjects': subjects
                };
                context = this;
                util.ajax({
                    url: util.getApiUrl('flx/set/member/subjects'),
                    data: subjects,
                    type: 'POST',
                    success: function (result) {
                        $('#subjects-container').addClass('hidden');
                        $(context).parent().siblings().filter('#editSubjects').removeClass('hidden');
                        $(context).parent().addClass('hidden');
                        if (result && result.response.result) {
                            var subjectsText = '';
                            $.each(result.response.result, function (index, subject) {
                                subjectsText += subjectsText ? ',' + subject.name : subject.name;
                            });
                            if (!$('#memberSubjects').length) {
                                $('#add-subjects').after('<span>interested in </span><span id="memberSubjects"></span>');
                            }
                            $('#memberSubjects').text(subjectsText.replace(/(.*),/, '$1 and ').replace(/,/g, ', '));
                            default_values.editSubjects = subjectsText;
                            resetField('editSubjects');
                        }
                        setProfileProgressRing();
                        removeProfileLocalStorage();
                    }
                });

            } else {
                error = false;
                val = '';
                member = {};
                if (saveTo === 'saveWebsite') {
                    val = ($(this).parent().siblings().filter('input').val() || '').trim();
                    if (val && val.indexOf('http://') === -1 && val.indexOf('https://') === -1) {
                        val = 'http://' + val;
                    }
                    member.website = val;
                } else if (saveTo === 'saveLocation') {
                    if (userLocation) {
                        val = userLocation;
                        $.each(userLocation, function (key, value) {
                            member[key] = value;
                        });
                        member.countryCode = extractLocation().countryCode;
                        // ADS tracks FBS_LOCATION_INFO
                        if (window._ck12) {
                            _ck12.logEvent('FBS_LOCATION_INFO', {
                                'referrer': 'profile_settings'
                            });
                        }
                    }
                    member.invalidate_client = true;
                } else if (saveTo === 'saveName') {
                    val = ($(this).parent().siblings().filter('#member-name').val() || '').trim();
                    arr = val.split(' ');
                    if (arr.length < 1) {
                        alert('Please enter full name.');
                        error = true;
                    } else {
                        member.givenName = arr.splice(0, 1)[0];
                        member.lastName = arr.join(' ');
                    }
                    member.invalidate_client = true;
                } else if (saveTo === 'saveRole') {
                    $role = $('.roleOption.selected-role');
                    val = ($role.text() || '').trim();
                    member.roleID = $role.attr('id');
                    member.invalidate_client = true;
                }
                if (!$.isEmptyObject(member) && error === false) {
                    context = this;
                    util.ajax({
                        url: util.getApiUrl('auth/update/member/' + loggedInUserID),
                        data: member,
                        type: 'POST',
                        success: function (result) {
                            if (result.responseHeader.status === 0) {
                                var user_name, editTo = $(context).parent().siblings().filter('.edit').attr('id'),
                                    $gradeRow = $('#grades-container').parent('.profile-item'),
                                    from_role,
                                    to_role;
                                if (editTo === 'editLocation') {
                                    cache = [];
                                    cacheTerm = [];
                                }
                                default_values[editTo] = val;
                                resetField(editTo);
                                setProfileProgressRing();
                                if (saveTo === 'saveName') {
                                    user_name = member.givenName;
                                    if (member.lastName) {
                                        user_name += ' ' + member.lastName;
                                    }
                                    user_name = user_name.length > 18 ? user_name.substring(0, 18) + '...' : user_name;
                                    $('.js_user_name').text(user_name);
                                }
                                if (saveTo === 'saveRole') {
                                    saveGrades($('#grades-container').parent('.profile-item').find('.icon-checkmark')[0], true);
                                    if ($gradeRow.attr('data-roleid') === '5') {
                                        $gradeRow.attr('data-roleid', '7');
                                        $('.role-name').attr('data-roleid', '7').text('Student');
                                        from_role = 'teacher';
                                        to_role = 'student';
                                        $.cookie('flxweb_role', 'student', {
                                            path: '/'
                                        });
                                        window.flxweb_role = 'student';
                                    } else {
                                        $gradeRow.attr('data-roleid', '5');
                                        $('.role-name').attr('data-roleid', '5').text('Teacher');
                                        from_role = 'student';
                                        to_role = 'teacher';
                                        $.cookie('flxweb_role', 'teacher', {
                                            path: '/'
                                        });
                                        window.flxweb_role = 'teacher';
                                    }
                                    if (window._ck12) {
                                        _ck12.logEvent('FBS_MEMBER_ROLE_CHANGE', {
                                            'memberID': result.response.id,
                                            'from_role': from_role,
                                            'to_role': to_role
                                        });
                                    }
                                }
                            } else {
                                console.log(result);
                            }
                            removeProfileLocalStorage();
                            /*
                            $(context).parent().siblings().filter('#editWebsite').removeClass('hidden');
                            $(context).parent().addClass('hidden');
                            $(context).parent().siblings().filter('.website-item').removeClass('hidden');
                            $(context).parent().siblings().filter('input').addClass('hidden');
                            $(context).parent().siblings().filter('.website-item').attr('href',member.website);
                            $(context).parent().siblings().filter('.website-item').text(member.website);
                            $(context).parent().siblings().filter('.website-item').attr('target','_blank');
                            if($('#add-website')){
                                $('#add-website').off('click');
                            }
                            */
                        }
                    });
                }
            }
            return false;
        });

        $('#add-website').off('click.save').on('click.save', function (e) {
            $($(this).siblings().filter('#editWebsite')).find('span').click();
            e.stopPropagation();
            return false;
        });

        $('#add-grade').off('click.save').on('click.save', function (e) {
            $($(this).siblings().filter('#editGrades')).find('span').click();
            e.stopPropagation();
            return false;
        });

        $('#add-school').off('click.save').on('click.save', function (e) {
            $($(this).siblings().filter('#editSchool')).find('span').click();
            e.stopPropagation();
            return false;
        });

        $('#add-subjects').off('click.save').on('click.save', function (e) {
            $($(this).siblings().filter('#editSubjects')).find('span').click();
            e.stopPropagation();
            return false;
        });

        $('.grade').off('click.save').on('click.save', function () {
            if ($(this).parents('.profile-item').attr('data-roleid') === '7') {
                $('.selectedGrade').removeClass('selectedGrade');
                $(this).addClass('selectedGrade');
            } else {
                $(this).toggleClass('selectedGrade');
            }
            var gradesText = '';
            $('#grades-container .selectedGrade').each(function () {
                gradesText += gradesText ? ', ' + ($(this).text() || '').trim() : ($(this).text() || '').trim();
            });
            gradesText = gradesText.replace(/(.*),/, '$1 and');
            if (gradesText.replace(/and/g, ',').replace(/ /g, '') === default_values.editGrades) {
                $('#saveGrades').find('span').addClass('inactive-handle').removeClass('change-handle');
            } else {
                $('#saveGrades').find('span').removeClass('inactive-handle').addClass('change-handle');
            }
            if ($(this).parents('.profile-item').attr('data-roleid') === '7') {
                if (window.innerWidth < 768) {
                    $('#grades-container').foundation('reveal', 'close');
                    return;
                }
                $('body').trigger('click.save');
            }
        });

        $('.js_international_location_select_link').off('click.save').on('click.save', function () {
            $('#internationalLocationContainer').removeClass('hidden');
            $('#usLocationContainer').addClass('hidden');
            return false;
        });

        $('.js_us_location_select_link').off('click.save').on('click.save', function () {
            $('#internationalLocationContainer').addClass('hidden');
            $('#usLocationContainer').removeClass('hidden');
            return false;
        });

        $('#internationalLocation').off('change.save').on('change.save', locationInputChanegd);
        $('#usLocation').off('change.save').on('change.save', locationInputChanegd);

        $('#grades-container').off('click').on('click', dummyEvent);

        $('#location-container').off('click').on('click', dummyEvent);

        $('.profile-img-wrap').off('click').on('click', function (e) {
            dummyEvent(e);
        });

        $('#website').off('click').on('click', dummyEvent);

        $('#member-name').off('click').on('click', dummyEvent);

        $('#school-container').off('click.school').on('click.school', dummyEvent);

        $('#subjects-container').off('click').on('click', dummyEvent);

        $('body').off('click.save').on('click.save', function () {
            if ($('.icon-checkmark.change-handle').parent().attr('id')) {
                $('.icon-checkmark.change-handle').trigger('click');
            } else {
                resetField('editGrades');
                resetField('editSchool');
                resetField('editSubjects');
                resetField('editLocation');
                resetField('editName');
                resetField('editWebsite');
                resetField('editRole');
            }
        });

        $('.content-wrap').off('click.save').on('click.save', function (e) {
            $('body').trigger('click');
            e.stopPropagation();
        });

        $('body').off('click.hideSchool').on('click.hideSchool', function (ev) {
            if (!($(ev.target).closest('#schoolAutosuggest').length || $(ev.target).closest('#schoolInfo').length)) {
                $('#schoolAutosuggest').addClass('hidden');
            }
        });
        $('#usLocation').off('keyup.location').on('keyup.location', handleLocationKeyup);
        $('#internationalLocation').off('keyup.location').on('keyup.location', handleLocationKeyup);

        $('#website').off('keyup.website').on('keyup.website', function (evt) {
            evt.stopPropagation();
            validateEl(this, evt, 'Website');
        });

        $('#member-name').off('keyup.member').on('keyup.member', function (evt) {
            evt.stopPropagation();
            validateEl(this, evt, 'Name');
        });

        $('#grades-container').bind('closed', function () {
            $('body').trigger('click.save');
        });

        $('#location-container').bind('closed', function () {
            $('body').trigger('click.save');
        });

        $('#school-container').bind('closed', function () {
            $('body').trigger('click.save');
        });
        $('.roleOption').off('click.save').on('click.save', function () {
            var roleText = '';
            roleText = ($(this).text() || '').trim();
            $(this).addClass('selected-role');
            if (roleText.toLowerCase() === default_values.editRole.toLowerCase()) {
                $('#saveRole').find('span').addClass('inactive-handle').removeClass('change-handle');
            } else {
                $('#saveRole').find('span').removeClass('inactive-handle').addClass('change-handle');
            }
            //roleChanged();
        });
    }

    function domReady() {

        if (window.innerWidth < 768) {
            $('#editGrades').find('.icon-edit').attr('data-reveal-id', 'grades-container');
            $('#grades-container').addClass('reveal-modal');
            $('#editLocation').find('.icon-edit').attr('data-reveal-id', 'location-container');
            $('#location-container').addClass('reveal-modal');

            $('#editSchool').find('.icon-edit').attr('data-reveal-id', 'school-container');
            $('#school-container').addClass('reveal-modal');
        }
        imageService.initImageUploader(imageUploadDone);
        if (userSchool) {
            if (userSchool.name === '') {
                default_values.editSchool = '';
            }
        }
        $('div.member-name').text($('div.member-name').attr('data-name'));
        $('#memberSchool').text(default_values.editSchool);
        if (default_values.editLocation === 'null') {
            default_values.editLocation = '';
        }
        setProfileProgressRing();
        if (default_values.editLocation) {
            setLocation();
        }

        bindEvents();

        usLocationService = locationService;
        intLocationService = locationService;
        usLocationService.load('usLocation', 'US');
        intLocationService.load('internationalLocation');
        usLocationService.setLocationChangedCallback(locationChangedCallback);
        intLocationService.setLocationChangedCallback(locationChangedCallback);

        loadSubjects();
    }

    $(document).ready(domReady);

    $('#countryID').change(function () {
        var action = $(this).val();

        if (action === '1') {
            $('#stateDiv').css('display', 'block');
            $('#zipDiv').css('display', 'block');
            $('#provinceDiv').css('display', 'none');
            $('#postalCodeDiv').css('display', 'none');
        } else {
            $('#stateDiv').css('display', 'none');
            $('#zipDiv').css('display', 'none');
            $('#provinceDiv').css('display', 'block');
            $('#postalCodeDiv').css('display', 'block');
        }
    });

});
