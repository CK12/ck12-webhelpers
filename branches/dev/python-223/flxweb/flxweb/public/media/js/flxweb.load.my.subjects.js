define([
    'jquery',
    'common/utils/user',
    'data/branchesNameData',
    'common/utils/utils'
],function($, User, branchNameMapping, util){
    return function(){
        var $mySubjectsContainer = $('#resources'),
            $categories = $mySubjectsContainer.find('.browse-subject-container'),
            $allSubjectsLinks = $mySubjectsContainer.find('[id^=browse]'),
            subjectsTitle = 'My Subjects',
            subjectsCount = 0,
            totalSubjectCount = 23,
            isAuthenticatedUser = false,
            target = 'my_subjects';


        $('.mySubject-click-link').off('click').on('click', function(){
            var $icon = $(this).find('i');
            $('.mySubject-title').next('.indicator').toggleClass('hide');
            if(!$mySubjectsContainer.find('.browse-content .columns').hasClass('enable-transition')){
                $mySubjectsContainer.find('.browse-content .columns').addClass('enable-transition');
                $categories.addClass('enable-transition');
            }
            if($icon.hasClass('rotate-down')){
                $icon.removeClass('rotate-down');
                $categories.removeClass('hideCategory');
                $allSubjectsLinks.parent().removeClass('hideContainer');
                $('.mySubject-click-link .indicator').attr('class', target==='my_subjects'? 'indicator icon-star':'indicator icon-view');
                $('.mySubject-title').html('All Subjects');
                $('.mySubject-click-link .link-name').html('Show '+ subjectsTitle).attr('data-dx-desc', 'show_' + subjectsTitle.toLowerCase().split(' ').join('_')+'_link');
                $('.mySubject-click-link .subjects-count').html(subjectsCount);
                $('.all-subjects-container-small').show();
            }else{
                $icon.addClass('rotate-down');
                hideUnmarkedSubjects();
                $('.mySubject-title').html(subjectsTitle);
                $('.mySubject-click-link .link-name').html('Show All Subjects ').attr('data-dx-desc', 'show_all_subjects_link');
                $('.mySubject-click-link .indicator').addClass('hide');
                $('.mySubject-click-link .subjects-count').html(totalSubjectCount);
                $('.all-subjects-container-small').hide();
            }
            $('#my-subjects-content').toggleClass('hide');
        });
        // $('.subjects-sigin-container > .signin').off('click').on('click', function(){
        //     require(['common/views/login.popup.view'], function(loginPopup){
        //         loginPopup.showLoginDialogue();
        //     });
        // });
        function markSubjectsInAllSubjects(subjects, isLoggedIn){
            var hasGrade = false;
            var selectors = [];
            subjects.forEach(function(subject){
                if(subject.name.indexOf('grade') === -1){
                    selectors.push('#browse-'+subject.name.split(' ').join('-'), '#browse-small-'+subject.name.split(' ').join('-'));
                }else{
                    hasGrade = true;
                }
            });
            if(target==='my_subjects'){
                $mySubjectsContainer.find(selectors.join(', ')).addClass('marked-subject').append('<i class="icon-star"></i>');
            }else{
                $mySubjectsContainer.find(selectors.join(', ')).addClass('marked-subject').append('<i class="icon-view"></i>');
            }
            if(hasGrade){
                if(target==='my_subjects'){
                    $mySubjectsContainer.find('#browse-elementary').addClass('marked-subject').append('<i class="icon-star"></i>');
                }else{
                    $mySubjectsContainer.find('#browse-elementary').addClass('marked-subject').append('<i class="icon-view"></i>');
                }
            }
        }
        function hideUnmarkedSubjects(){
            $mySubjectsContainer.find('.subject-link:not(.marked-subject)').parent().addClass('hideContainer');
            $categories.each(function(index, category){
                var $category = $(category);
                if($category.find('.columns:not(.hideContainer)').length === 0){
                     $category.addClass('hideCategory');
                }
            });
        }
        function renderSubjectsMobile(subjects, isLoggedIn){
            var subjectsHTML = '',
                referrer = 'recently_viewed_subjects';
            subjects.forEach(function(subject){
                subjectsHTML += '<div class="large-4 columns">'+
                            '<a class="subject-link-small" href="/'+subject.name.split(' ').join('-')+'/?referrer='+referrer+'" title="'+util.toTitleCase(subject.name)+'">'+
                                '<span class="subject-icon">'+
                                    '<span class="'+subject.name.split(' ').join('-')+'"></span>'+
                                    '</span>'+
                                '<span class="browse-title">'+ subject.name +'</span>'+
                                (target==='my_subjects'? '<i class="icon-star"></i>': '<i class="icon-view"></i>')+
                            '</a>'+
                        '</div>';
            });
            $('#my-subjects-content').html(subjectsHTML);
        }
        function showSubjects(title, subjects, isLoggedIn, icon){
            subjectsCount = subjects.length;
            subjectsTitle = title;

            $('.mySubject-title-container').removeClass('hide');
            $('.mySubject-title').html(subjectsTitle);
            if (icon) {
            	$('.mySubject-title').next('.indicator').attr('class', target==='my_subjects'? 'indicator icon-star':'indicator icon-view');
            }
            renderSubjectsMobile(subjects, isLoggedIn);
            markSubjectsInAllSubjects(subjects, isLoggedIn);
            hideUnmarkedSubjects();
            $('.all-subjects-container-small').hide();
            $mySubjectsContainer.css('visibility','visible');
        }

        User.getUser().done(function(userData){
            if(userData.isLoggedIn()){
                var mySubjectDefer = util.ajax({
                    url: '/flx/get/member/subjects',
                    dataType: 'json',
                    method: 'get'
                });
                isAuthenticatedUser = true;
                mySubjectDefer.then(function(data){
                    var subjectsArr = data.response.result;
                    if(subjectsArr.length > 0){
                        target = 'my_subjects';
                        showSubjects('My Subjects', subjectsArr, true, false);
                    }else{
                        var mostRecentViewedDefer = util.ajax({
                            url: '/flx/analytics/member/viewed-branches',
                            dataType: 'json',
                            method: 'get'
                        });
                        mostRecentViewedDefer.then(function(data){
                            if(data.response.viewedBranches.length > 0){
                                var subjectsArr = [];
                                data.response.viewedBranches.filter(function(branch){ return branch._id.branch && branch._id.subject }).slice(0,6).forEach(function(branch){
                                    var encodedId = branch._id.subject+'.'+branch._id.branch;
                                    var name = branchNameMapping[encodedId];
                                    subjectsArr.push({name:name.toLowerCase()});
                                });
                                target = 'recently_viewed_subjects';
                                showSubjects('Recently Viewed Subjects', subjectsArr, true, true);
                            }else{
                                $mySubjectsContainer.css('visibility','visible');
                            }
                        });
                    }
                });
            }else{
                $('.subjects-sigin-container').removeClass('hide');

                var mostRecentViewedDefer = util.ajax({
                    url: '/flx/analytics/member/viewed-branches',
                    dataType: 'json',
                    method: 'get'
                });
                mostRecentViewedDefer.then(function(data){
                    if(data.response.viewedBranches.length > 0){
                        var subjectsArr = [];
                        data.response.viewedBranches.filter(function(branch){ return branch._id.branch && branch._id.subject }).slice(0,6).forEach(function(branch){
                            var encodedId = branch._id.subject+'.'+branch._id.branch;
                            var name = branchNameMapping[encodedId];
                            subjectsArr.push({name:name.toLowerCase()});
                        });
                        target = 'recently_viewed_subjects';
                        showSubjects('Recently Viewed Subjects', subjectsArr, false, true);
                    }else{
                        $mySubjectsContainer.css('visibility','visible');
                    }
                });
            }
        })
    }
});
