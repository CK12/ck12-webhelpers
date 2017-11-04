define(['jquery', 'underscore', 'backbone', 'search/templates/search.templates', 'common/utils/modality', 'common/utils/utils'],
    function ($, _, Backbone, TMPL, modalityUtil, util) {
        'use strict';

        function searchView(controller) {

            var searchMainView, searchPaginationView, searchResultsHeaderView, searchResultsListView, countryFilterView, countryFilterSmallView, cbseIntroView, cbseIntroSmallView,
                gradeFilterView, gradeFilterSmallView, subjectFilterView, subjectFilterSmallView, contentFilterView, categoryFilterView, categoryFilterSmallView,
                searchMainInstance, countryFilterInstance, gradeFilterInstance, categoryFilterInstance, subjectFilterInstance, contentFilterInstance, searchPaginationInstance,
                gradeFilterSmallInstance, categoryFilterSmallInstance, subjectFilterSmallInstance,
                searchResultsInstance, searchResultsHeaderInstance,
                changeOnly = false,
                number_of_pages_show = 3,
                pageNum = 1,
                recentFilterState = '',
                defaultCoverImages = {
                    'domain': '/media/images/modality_generic_icons/concept_gicon.png',
                    'book': '/media/images/thumb_dflt_flexbook_sm.png',
                    'chapter': '/media/images/thumb_dflt_chapter_sm.png',
                    'lesson': '/media/images/thumb_dflt_lesson_sm.png',
                    'concept': '/media/images/thumb_dflt_concept_sm.png',
                    'default': '/media/images/thumb_dflt_lesson_sm.png'
                },
                filterState = {
                    'grade': '',
                    'subject': '',
                    'category': ''
                },
                location = util.getLocation();

            /*function disableFacets(filters) {
                try {
                    var filterGroup, index;
                    for (filterGroup in filters) {
                        if (filters.hasOwnProperty(filterGroup)) {
                            if (filterGroup.match('grade')) {
                                $('.js-grade-filter').find('input').prop('disabled', true);
                                for (index = 0; index < filters[filterGroup].length; index++) {
                                    if (parseInt(filters[filterGroup][index][1], 10) > 0) {
                                        $('#grade' + filters[filterGroup][index][0] + '_large').prop('disabled', false);
                                        $('#grade' + filters[filterGroup][index][0] + '_small').prop('disabled', false);
                                    }
                                }
                            }
                            if (filterGroup.match('subject')) {
                                $('.js-subject-filter').find('input').prop('disabled', true);
                                for (index = 0; index < filters[filterGroup].length; index++) {
                                    if (parseInt(filters[filterGroup][index][1], 10) > 0) {
                                        $('#' + filters[filterGroup][index][0].toLowerCase().replace(/[\s]/g, '-') + '_large').prop('disabled', false);
                                        $('#' + filters[filterGroup][index][0].toLowerCase().replace(/[\s]/g, '-') + '_small').prop('disabled', false);
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.log('Something is not right in facets.');
                    console.log(e);
                    $('.js-grade-filter').find('input').prop('disabled', false);
                    $('.js-subject-filter').find('input').prop('disabled', false);
                }
            }*/

            function customTrim(string, delimiter) {
                string = (string || '').toString();
                string = string.split(delimiter);
                string.pop();
                return string.join(delimiter);
            }

            function renderFilters (model) {
                if (categoryFilterInstance) {
                    categoryFilterInstance.dispose();
                }
                if (categoryFilterSmallInstance) {
                    categoryFilterSmallInstance.dispose();
                }
                categoryFilterInstance = new categoryFilterView({
                    'el': $('#category-filter'),
                    'model': model
                });
                categoryFilterSmallInstance = new categoryFilterSmallView({
                    'el': $('#category-filter_small'),
                    'model': model
                });

              /*$.when(location).done(function(ip_info) {
                  if (ip_info.country_long === "india") {
                    $('.country-filter-container').add('.country-filter-container+.border').removeClass('hide');

                    countryFilterInstance = new countryFilterView({
                        'el': $('#country-filter'),
                        'model': tempParams
                    });
                    new countryFilterSmallView({
                        'el': $('#country-filter_small'),
                        'model': tempParams
                    });
                    new cbseIntroView();
                    new cbseIntroSmallView();
                  }
                });*/

                if (gradeFilterInstance) {
                    gradeFilterInstance.dispose();
                }
                if (gradeFilterSmallInstance) {
                    gradeFilterSmallInstance.dispose();
                }
                gradeFilterInstance = new gradeFilterView({
                    'el': $('#grade-filter'),
                    'model': model
                });
                gradeFilterSmallInstance = new gradeFilterSmallView({
                    'el': $('#grade-filter_small'),
                    'model': model
                });

                if (subjectFilterInstance) {
                    subjectFilterInstance.dispose();
                }
                if (subjectFilterSmallInstance) {
                    subjectFilterSmallInstance.dispose();
                }
                subjectFilterInstance = new subjectFilterView({
                    'el': $('#subject-filter'),
                    'model': model
                });
                subjectFilterSmallInstance = new subjectFilterSmallView({
                    'el': $('#subject-filter_small'),
                    'model': model
                });
            }
            
            function updateFilters (filters, filterType) {
                var filterToBeUpdated = [],
                    tempParams;
                delete filters[filterType];
                switch (filterType) {
                case 'gradeLevels.ext':
                    filterToBeUpdated.push('subject', 'category');
                    break;
                case 'subjects.ext':
                    filterToBeUpdated.push('grade', 'category');
                    break;
                case 'typeStr':
                    filterToBeUpdated.push('grade', 'subject');
                    break;
                default:
                    filterToBeUpdated.push('grade', 'subject', 'category');
                }
                filterToBeUpdated.forEach(function (filter) {
                    switch (filter) {
                    case 'grade':
                        tempParams = gradeFilterInstance.model;
                        delete tempParams.allGradeFilters.count;
                        gradeFilterInstance.dispose();
                        gradeFilterSmallInstance.dispose();
                        controller.addCounts(filters, tempParams);
                        gradeFilterInstance = new gradeFilterView({
                            'el': $('#grade-filter'),
                            'model': tempParams
                        });
                        gradeFilterSmallInstance = new gradeFilterSmallView({
                            'el': $('#grade-filter_small'),
                            'model': tempParams
                        });
                        break;
                    case 'subject':
                        tempParams = subjectFilterInstance.model;
                        for (var sub in tempParams.allSubjectFilters) {
                            delete tempParams.allSubjectFilters[sub].count;
                        }
                        subjectFilterInstance.dispose();
                        subjectFilterSmallInstance.dispose();
                        controller.addCounts(filters, tempParams);
                        subjectFilterInstance = new subjectFilterView({
                            'el': $('#subject-filter'),
                            'model': tempParams
                        });
                        subjectFilterSmallInstance = new subjectFilterSmallView({
                            'el': $('#subject-filter_small'),
                            'model': tempParams
                        });
                        break;
                    case 'category':
                        tempParams = categoryFilterInstance.model;
                        delete tempParams.allTypeGroups.count;
                        categoryFilterInstance.dispose();
                        categoryFilterSmallInstance.dispose();
                        controller.addCounts(filters, tempParams);
                        categoryFilterInstance = new categoryFilterView({
                            'el': $('#category-filter'),
                            'model': tempParams
                        });
                        categoryFilterSmallInstance = new categoryFilterSmallView({
                            'el': $('#category-filter_small'),
                            'model': tempParams
                        });
                        break;
                    }
                });
            }
            
            function resultCommon(result, tempParams, isPagination) {
                if ($('.mobile-filters-wrapper').is(':visible')) {
                    $('.js-back-icon').trigger('click');
                }
                $('html, body').animate({
                    scrollTop: 0
                });
                if (tempParams.total) {
                    recentFilterState = tempParams.url.href;
                    if (tempParams.suggestedTerm) {
                        recentFilterState = recentFilterState.replace('q=' + tempParams.suggestedTerm, 'q=' + tempParams.originalTerm);
                    }
                }
                if (!isPagination) {
                    searchMainInstance.updateURL(tempParams);
                    gradeFilterInstance.updateURL(tempParams);
                    subjectFilterInstance.updateURL(tempParams);
                    categoryFilterInstance.updateURL(tempParams);
                    contentFilterInstance.updateURL(tempParams);
                    //                    disableFacets(result.filters);
                    searchResultsHeaderInstance.updateModel(tempParams);
                    searchResultsHeaderInstance.initialize();
                    if (searchPaginationInstance) {
                        searchPaginationInstance.$el.empty();
                    }
                    if ((result.total / result.limit) > 1) {
                        if (!searchPaginationInstance) {
                            searchPaginationInstance = new searchPaginationView({
                                'el': $('#search-pagination-container'),
                                'model': tempParams
                            });
                        } else {
                            searchPaginationInstance.updateModel(tempParams);
                            searchPaginationInstance.initialize();
                        }
                    }
                }
                if (tempParams.suggestedTerm) {
                    $('#suggestion-container').removeClass('hide');
                } else {
                    $('#suggestion-container').addClass('hide');
                }
                searchResultsInstance.updateModel(result);
                searchResultsInstance.initialize({
                    'searchableBookTypes': tempParams.searchableBookTypes
                });
            }

            function addFilterURL(data, key) {
                if (data instanceof Array) {
                    var index,
                        url = '';
                    for (index = 0; index < data.length; index++) {
                        url += key + data[index];
                    }
                    return url;
                }
                return '';
            }

            function camelCase(match) {
                return match.toUpperCase();
            }

            function getDataGrid(data) {
                try {
                    if (data instanceof Array) {
                        var index, temp,
                            dataString = '';
                        for (index = 0; index < data.length; index++) {
                            temp = data[index] instanceof Array ? data[index][1] : data[index];
                            temp = temp || '';
                            if ('mathematics' !== temp.toString().toLowerCase() && 'science' !== temp.toString().toLowerCase()) {
                                dataString += temp.toString().replace(/(?:^|\s)\w/g, camelCase) + ', ';
                            }
                        }
                        return customTrim(dataString, ', ');
                    }
                    return '';
                } catch (e) {
                    console.log('error in domain ' + e);
                    return '';
                }
            }

            function changeFilters(tempParams, isPagination, result) {
                try {
                    changeOnly = true;
                    $('.js-grade-filter').find('input').prop('checked', false).filter(function () {
                        return tempParams.grade && -1 !== tempParams.grade.indexOf(this.id.split('grade')[1].split('_')[0]);
                    }).prop('checked', true);
                    $('.js-category-filter').find('input').prop('checked', false).filter(function () {
                        return tempParams.searchType && -1 !== tempParams.searchType.indexOf(this.id.split('category')[1].split('_')[0]);
                    }).prop('checked', true);
                    $('.js-content-filter').find('a[data-value=' + tempParams.source + ']').addClass('selected').siblings('.selected').removeClass('selected');
                    $('.js-subject-filter').find('input').prop('checked', false).filter(function () {
                        return tempParams.subject && -1 !== tempParams.subject.indexOf(this.id.split('_')[0]);
                    }).prop('checked', true);
                    if (isPagination) {
                        if (searchPaginationInstance) {
                            searchPaginationInstance.$el.empty();
                        }
                        if ((result.total / result.limit) > 1) {
                            if (!searchPaginationInstance) {
                                searchPaginationInstance = new searchPaginationView({
                                    'el': $('#search-pagination-container'),
                                    'model': tempParams
                                });
                            } else {
                                searchPaginationInstance.initialize();
                            }
                        }
                    }
                    changeOnly = false;
                } catch (e) {
                    console.log('could not update filters');
                    console.log(e);
                }
            }

            searchPaginationView = Backbone.View.extend({
                'events': {
                    'click a': 'changePageNum'
                },
                'initialize': function () {
                    try {
                        this.model.total = parseInt(this.model.total, 10);
                        this.model.pageNum = parseInt(this.model.pageNum, 10);
                        this.model.pageSize = parseInt(this.model.pageSize, 10);
                        pageNum = this.model.pageNum;
                        var total_pages = Math.ceil(this.model.total / this.model.pageSize);
                        this.$el.html(searchPaginationView.template({
                            'pages_to_show': this.getPagesToShow(total_pages, this.model.pageNum),
                            'current': this.model.pageNum,
                            'isBeginning': this.model.pageNum === 1,
                            'isEnd': this.model.pageNum === total_pages,
                            'href': this.processHREF()
                        }));
                    } catch (e) {
                        alert('Something is not right');
                        console.log(e);
                    }
                },
                'updateModel': function (tempParams) {
                    this.model = tempParams;
                },
                'processHREF': function () {
                    var href = controller.processURLForSpecialSearch(this.model.searchTerm);
                    if (false !== href) { // inequality to ONLY false is what this is supposed to do
                        href = this.model.url.pathname + '?q=' + href;
                    } else {
                        return false;
                    }
                    if (this.model.searchType) {
                        href += addFilterURL(this.model.searchType, '&type=');
                    }
                    if (this.model.subject) {
                        href += addFilterURL(this.model.subject, '&subject=');
                    }
                    if (this.model.grade) {
                        href += addFilterURL(this.model.grade, '&grade=');
                    }
                    if (this.model.source) {
                        href += '&source=' + this.model.source;
                    }
                    href += '&pageNum=';
                    return href;
                },
                'getPagesToShow': function (total_pages, current) {
                    var sidePages, index,
                        pages_to_show = {};
                    pages_to_show.label = [];
                    pages_to_show.value = [];
                    if (total_pages < number_of_pages_show + 2) {
                        // add 2 for first and last page
                        // total pages are less than most to be shown
                        for (index = 1; index <= total_pages; index++) {
                            pages_to_show.label.push('number');
                            pages_to_show.value.push(index);
                        }
                    } else {
                        sidePages = Math.floor(number_of_pages_show / 2);
                        if (current <= sidePages + 2) {
                            // current page is near to beginning
                            for (index = 1; index <= number_of_pages_show; index++) {
                                pages_to_show.label.push('number');
                                pages_to_show.value.push(index);
                            }
                            if (current === sidePages + 2) {
                                pages_to_show.label.push('number');
                                pages_to_show.value.push(current + 1);
                            }
                            pages_to_show.label.push('dots');
                            pages_to_show.value.push('...');
                            pages_to_show.label.push('number');
                            pages_to_show.value.push(total_pages);
                        } else if (current >= total_pages - sidePages - 1) {
                            // current page is near to end
                            pages_to_show.label.push('number');
                            pages_to_show.value.push(1);
                            pages_to_show.label.push('dots');
                            pages_to_show.value.push('...');
                            if (current === total_pages - sidePages - 1) {
                                pages_to_show.label.push('number');
                                pages_to_show.value.push(current - 1);
                            }
                            for (index = total_pages - number_of_pages_show + 1; index <= total_pages; index++) {
                                pages_to_show.label.push('number');
                                pages_to_show.value.push(index);
                            }
                        } else {
                            // current page is somewhere in middle
                            pages_to_show.label.push('number');
                            pages_to_show.value.push(1);
                            pages_to_show.label.push('dots');
                            pages_to_show.value.push('...');
                            for (index = current - sidePages; index <= current + sidePages; index++) {
                                pages_to_show.label.push('number');
                                pages_to_show.value.push(index);
                            }
                            pages_to_show.label.push('dots');
                            pages_to_show.value.push('...');
                            pages_to_show.label.push('number');
                            pages_to_show.value.push(total_pages);
                        }
                    }
                    return pages_to_show;
                },
                'changePageNum': function (e) {
                    var This = $(e.target).closest('a')[0],
                        self = this;
                    if ($(This).hasClass('disabled') || $(This).hasClass('selected') || $(This).hasClass('dots')) {
                        return false;
                    }
                    controller.loadResults({
                        'href': This.href
                    }).done(function (result, tempParams) {
                        $(This).addClass('selected').siblings('.selected').removeClass('selected');
                        resultCommon(result, tempParams, true);
                        this.model = tempParams;
                        self.initialize();
                    });
                    return false;
                }
            }, {
                'template': _.template(TMPL.search_pagination, null, {
                    'variable': 'data'
                })
            });

            searchResultsListView = Backbone.View.extend({
                'events': {
                    'click a': 'searchHitADS',
                    'click #nextResults a': 'changeContent',
                    'click #previousResults a': 'loadResults',
                    'click .js-search-icon': 'showTooltip',
                    'click .exactmatch-item': 'hoverMatch',
                    'click .js-modality-reveal': 'showModalities'
                },
                'initialize': function (options) {
                    var results,
                        index,
                        collectionData,
                        collectionIndex,
                        foundCanonical;
                    
                    try {
                        if (this.model.total > 0) {
                            for (index = 0; index < this.model.result.length; index++) {
                                this.model.result[index].defaultImage = 'true';
                                this.model.result[index].collectionHandle = '';
                                this.model.result[index].conceptCollectionAbsoluteHandle = '';
                                this.model.result[index].conceptCollectionTitle = '';
                                foundCanonical = false;

                                collectionData = this.model.result[index].collections;
                                if (collectionData && collectionData.length) {
                                    for (collectionIndex = 0; collectionIndex < collectionData.length; collectionIndex++) {
                                        if (collectionData[collectionIndex].isCanonical && collectionData[collectionIndex].exactMatch) {
                                            this.model.result[index].collectionHandle = collectionData[collectionIndex].collectionHandle;
                                            this.model.result[index].collectionTitle = collectionData[collectionIndex].collectionTitle;
                                            this.model.result[index].conceptCollectionAbsoluteHandle = collectionData[collectionIndex].conceptCollectionAbsoluteHandle;
                                            this.model.result[index].conceptCollectionTitle = collectionData[collectionIndex].conceptCollectionTitle;
                                            if(collectionData[collectionIndex].ck12ModalityCount){
                                                this.model.result[index].modalityCount = collectionData[collectionIndex].ck12ModalityCount;
                                            }
                                            break;
                                        } else if (collectionData[collectionIndex].isCanonical && !foundCanonical) {
                                            this.model.result[index].collectionHandle = collectionData[collectionIndex].collectionHandle;
                                            this.model.result[index].collectionTitle = collectionData[collectionIndex].collectionTitle;
                                            this.model.result[index].conceptCollectionAbsoluteHandle = collectionData[collectionIndex].conceptCollectionAbsoluteHandle;
                                            this.model.result[index].conceptCollectionTitle = collectionData[collectionIndex].conceptCollectionTitle;
                                            if(collectionData[collectionIndex].ck12ModalityCount){
                                                this.model.result[index].modalityCount = collectionData[collectionIndex].ck12ModalityCount;
                                            }
                                            foundCanonical = true;
                                        }

                                    }
                                }

                                if ('domain' === this.model.result[index].type) {
                                    this.model.result[index].modalityGroups = controller.processModalityGroups(this.model.result[index]);
                                    this.model.result[index].previewImageUrl = this.model.result[index].previewImageUrl || defaultCoverImages.domain;
                                    if (this.model.result[index].subjectGrid) {
                                        this.model.result[index].subjectGrid = getDataGrid(this.model.result[index].subjectGrid);
                                    }
                                    if (this.model.result[index].gradeGrid) {
                                        this.model.result[index].gradeGrid = getDataGrid(this.model.result[index].gradeGrid);
                                    }
                                } else {
                                    if (-1 !== options.searchableBookTypes.indexOf(this.model.result[index].artifactType)) {
                                        this.model.result[index].isBookType = true;
                                    }
                                    this.model.result[index].icon = controller.getModalityIcon(this.model.result[index].artifactType);
                                    if (this.model.result[index].coverImageSatelliteUrl) {
                                        this.model.result[index].coverImage = this.model.result[index].coverImageSatelliteUrl.replace(/COVER_PAGE/g, 'COVER_PAGE_THUMB_LARGE_TINY').replace(/IMAGE/g, 'IMAGE_THUMB_LARGE_TINY');
                                        this.model.result[index].coverImage = this.model.result[index].coverImage.replace(/show\/(default\/)?/, 'show/THUMB_LARGE/');
                                    } else if (this.model.result[index].coverImage) {
                                        this.model.result[index].coverImage = this.model.result[index].coverImage.replace(/COVER_PAGE/g, 'COVER_PAGE_THUMB_LARGE_TINY').replace(/IMAGE/g, 'IMAGE_THUMB_LARGE_TINY');
                                        this.model.result[index].coverImage = this.model.result[index].coverImage.replace(/show\/(default\/)?/, 'show/THUMB_LARGE/');
                                    } else {
                                        this.model.result[index].defaultImage = 'camera';
                                        this.model.result[index].coverImage = '/media/images/camera.png';
                                    }
                                    if (this.model.result[index].subjectGrid) {
                                        // allow for case: data in old format
                                        this.model.result[index].subjectGrid = getDataGrid(this.model.result[index].subjectGrid);
                                    }
                                    if (this.model.result[index].gradeGrid) {
                                        // allow for case: data in old format
                                        this.model.result[index].gradeGrid = getDataGrid(this.model.result[index].gradeGrid);
                                    }
                                }
                                if (this.model.result[index].artifactType === 'plix') {
                                    // Use default summary - since the actual summary is HTML + MATH
                                    this.model.result[index].summary = '';
                                    if (this.model.result[index].domain.name) {
                                        this.model.result[index].summary = this.model.result[index].domain.name + ' Interactive';
                                    }
                                }
                                this.model.result[index].url = this.getURLForSearchItem(this.model.result[index]);
                                if (this.model.result[index].level) {
                                    this.model.result[index].level = this.model.result[index].level.replace(/(?:^|\s)\w/g, camelCase);
                                }
                                this.model.result[index].artifactGroup = modalityUtil.getModalityType(this.model.result[index].artifactType);
                            }
                            if (this.model.specialMatches && window.location.search.indexOf('referrer=special') === -1) {
                                this.model.specialMatches = this.model.specialMatches.map(function (match) {
                                    if (match.entry && match.entry.URL) {
                                        // Add referrer=special
                                        var param = match.entry.URL.indexOf("?") !== -1 ? '&referrer=special' : '?referrer=special';
                                        match.entry.URL += param;
                                    }
                                    match.isSpecial = true;
                                    return match;
                                });
                                results = this.model.specialMatches.concat(this.model.result);
                            } else {
                                results = this.model.result;
                            }
                            this.$el.html(searchResultsListView.resultsTemplate(results));
                            $('.exactmatch-item .modality_group_list').filter(function () {
                                return 5 < $(this).children().length;
                            }).next('.modality-reveal').removeClass('hide');
                            
                        } else {
                            
                            this.noResults();
                            index = $('#content-filter').find('a.selected').next();
                            if (index.length) {
                                controller.getNextResults({
                                    'href': index.prop('href')
                                }).done(function (result) {
                                    if (result.total) {
                                        $('#nextResults').removeClass('hide').find('a').text(index.text());
                                    } else {
                                        index = index.next();
                                        if (index.length) {
                                            controller.getNextResults({
                                                'href': index.prop('href')
                                            }).done(function (result) {
                                                if (result.total) {
                                                    $('#nextResults').removeClass('hide').find('a').text(index.text());
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    } catch (e) {
                        alert('Something is not right');
                        console.log(e);
                    }
                },
                'updateModel': function (tempParams) {
                    this.model = tempParams;
                },
                'getURLForSearchItem': function (artifact) {
                    var branchHandle, handle, modalityType, realm, modalityHandle;
                    modalityType = artifact.artifactType;
                    realm = artifact.realm;
                    realm = realm ? realm + '/' : '';
                    modalityHandle = encodeURIComponent(artifact.handle);
                    try {
                        if ('domain' === artifact.type) {
                            branchHandle = artifact.branchInfo ? (artifact.branchInfo.handle || '').toString().toLowerCase().replace(/[\s]/g, '-') : '';
                            branchHandle = branchHandle.match(/user-generated-content/gi) ? '' : branchHandle;
                            branchHandle = branchHandle || 'na';
                            handle = artifact.handle.toString();
                            if (artifact.collectionHandle && artifact.conceptCollectionAbsoluteHandle) {
                                return (
                                    '/c/' + 
                                    artifact.collectionHandle.toLowerCase() + 
                                    '/' + 
                                    artifact.conceptCollectionAbsoluteHandle
                                    ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                            }
                            return ('/' + branchHandle + '/' + handle).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                        }
                        if (
                            'book' === modalityType ||
                            'tebook' === modalityType ||
                            'workbook' === modalityType ||
                            'labkit' === modalityType ||
                            'quizbook' === modalityType ||
                            'section' === modalityType
                        ) {
                            if (!modalityType || !modalityHandle) {
                                return '';
                            }
                            return ('/' + realm + modalityType + '/' + modalityHandle + '/').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                        }
                        if (artifact.domain) {
                            branchHandle = artifact.domain.branchInfo ? (artifact.domain.branchInfo.handle || '').toString().toLowerCase().replace(/[\s]/g, '-') : '';
                            branchHandle = branchHandle.match(/user-generated-content/gi) ? '' : branchHandle;
                            branchHandle = branchHandle || 'na';
                            handle = artifact.domain.handle.toString();
                            if (artifact.collectionHandle && artifact.conceptCollectionAbsoluteHandle) {
                                return ( '/c/' + 
                                    artifact.collectionHandle + 
                                    '/' + artifact.conceptCollectionAbsoluteHandle +
                                    '/' + modalityType +
                                    '/' + realm + modalityHandle + '/'
                                ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                            }
                            if (!handle || !modalityType || !modalityHandle) {
                                return '';
                            }
                            return ('/' + branchHandle + '/' + handle + '/' + modalityType + '/' + realm + modalityHandle + '/').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                        }
                        if (!modalityType || !modalityHandle) {
                            return '';
                        }
                        return ('/' + realm + modalityType + '/' + modalityHandle).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                    } catch (e) {
                        console.log(e);
                        return '';
                    }
                },
                'searchHitADS': function (e) {
                    if ('nextResults' !== $(e.target).closest('a').parent()[0].id && 'previousResults' !== $(e.target).closest('a').parent()[0].id) {
                        controller.searchHitADS($(e.target).closest('a')[0].href);
                    }
                },
                'changeContent': function (e) {
                    $('#content-filter').find('a').filter(function () {
                        return $(e.target).text() === $(this).text();
                    }).trigger('click');
                    return false;
                },
                'loadResults': function () {
	                $.when( 
	                    controller.loadResults({ 
	                        'href': recentFilterState 
	                    })
	                ).done(function (result, tempParams) {
                        controller.getResultsCount({ 
                            'href': recentFilterState 
                        }).done(function(){
                            try {
  	                            changeOnly = true;
  	                            renderFilters(tempParams);
  	                            $('#grade-filter_small').add('#grade-filter').find('input').prop('checked', false).filter(function () {
  	                                return -1 !== (tempParams.grade || []).indexOf(this.id.replace('grade', '').split('_')[0]);
  	                            }).prop('checked', true);
  	                            $('#category-filter_small').add('#category-filter').find('input').prop('checked', false).filter(function () {
  	                                return -1 !== (tempParams.searchType || []).indexOf(this.id.replace('category', '').split('_')[0]);
  	                            }).prop('checked', true);
  	                            $('#subject-filter_small').add('#subject-filter').find('input').prop('checked', false).filter(function () {
  	                                return -1 !== (tempParams.subject || []).indexOf(this.id.replace('subject', '').split('_')[0]);
  	                            }).prop('checked', true);
  	                            $('#content-filter').find('a[data-value=' + (tempParams.source || 'ck12') + ']').trigger('click');
  	                            changeOnly = false;
  	                        } catch (e) {
  	                            console.log(e);
  	                        }
  	                    });
                        recentFilterState = '';
                        resultCommon(result, tempParams);
                    });
                    return false;
                },
                'showTooltip': function (e) {
                    $(e.target).next().removeClass('hide');
                    setTimeout(function () {
                        $(e.target).next().addClass('hide');
                    }, 2000);
                },
                'hoverMatch': function (e) {
                    var $target = $(e.target);
                    if ($target.closest('.modality_group_list').length === 0 && $target.closest('.js-modality-reveal').length === 0) {
                        window.location.href = $target.closest('.listitem').find('a.listitemtitle').attr('href');
                    }
                },
                'showModalities': function (e) {
                    $(e.target).closest('.js-modality-reveal').toggleClass('expand').prev('.modality_group_list').toggleClass('expand');
                },
                'noResults': function () {
                    $('#suggestion-container').addClass('hide');
                    this.$el.html(searchResultsListView.noResultsTemplate());
                    if (recentFilterState) {
                        $('#previousResults').removeClass('hide');
                    }
                    $('#nextResults').addClass('hide');
                    if (this.model.specialMatches) {
                        this.model.specialMatches = this.model.specialMatches.map(function (match) {
                            match.isSpecial = true;
                            return match;
                        });
                        this.$el.prepend(searchResultsListView.resultsTemplate(this.model.specialMatches));
                    }
                }
            }, {
                'resultsTemplate': _.template(TMPL.search_list, null, {
                    'variable': 'data'
                }),
                'noResultsTemplate': _.template(TMPL.search_zero_results, null, {
                    'variable': 'data'
                })
            });

            searchResultsHeaderView = Backbone.View.extend({
                'events': {
                    'click .js-filter-link-container': 'showFilters'
                },
                'initialize': function () {
                    this.$el.html(searchResultsHeaderView.template(this.model));
                },
                'updateModel': function (tempParams) {
                    this.model = tempParams;
                },
                'addScrollEffect': function () {
                    var headerHeight, footerHeight, bodyHeight, windowHeight;
                    headerHeight = $('.js-mobile-filters-header').outerHeight();
                    footerHeight = $('.js-mobile-clear-all').outerHeight();
                    windowHeight = $(window).height();
                    bodyHeight = windowHeight - headerHeight - footerHeight;
                    $('.js-mobile-filter-container').css({
                        'height': bodyHeight + 'px'
                    });
                },
                'showFilters': function () {
                    var self = this;
                    $('.js-search-container').hide();
                    $('.js-mobile-filters-wrapper').show(500);
                    $('.js-mobile-filters-wrapper').addClass('filters-expanded');
                    $('body').addClass('filter-view');
                    self.addScrollEffect();
                    $(window).off('resize.scrollEffect').on('resize.scrollEffect', function () {
                        self.addScrollEffect();
                    });
                    filterState.grade = '';
                    filterState.subject = '';
                    filterState.category = '';
                    $('#grade-filter_small').find('input:checked').each(function () {
                        filterState.grade += this.id + ',';
                    });
                    $('#subject-filter_small').find('input:checked').each(function () {
                        filterState.subject += this.id + ',';
                    });
                    $('#category-filter_small').find('input:checked').each(function () {
                        filterState.category += this.id + ',';
                    });
                    filterState.grade = customTrim(filterState.grade, ',');
                    filterState.subject = customTrim(filterState.subject, ',');
                    filterState.category = customTrim(filterState.category, ',');
                }
            }, {
                'template': _.template(TMPL.search_header, null, {
                    'variable': 'data'
                })
            });

            subjectFilterView = Backbone.View.extend({
                'events': {
                    'change input': 'changeSubject',
                    'click .js-subject-heading': 'expandSubjects'
                },
                'initialize': function () {
                    try {
                        this.$el.html(subjectFilterView.template({
                            'selected': this.model.subject,
                            'filters': this.model.allSubjectFilters
                        }));

                    } catch (e) {
                        console.log(e);
                    }
                },
                'updateURL': function (tempParams) {
                    this.model = tempParams;
                },
                'changeSubject': function (e) {
                    if (changeOnly) {
                        return false;
                    }
                    var href = controller.processURLForSpecialSearch(this.model.searchTerm);
                    if (false !== href) { // inequality to ONLY false is what this is supposed to do
                        href = this.model.url.pathname + '?q=' + href;
                    } else {
                        return false;
                    }
                    if (this.model.searchType) {
                        href += addFilterURL(this.model.searchType, '&type=');
                    }
                    if (this.model.grade) {
                        href += addFilterURL(this.model.grade, '&grade=');
                    }
                    if (this.model.source) {
                        href += '&source=' + this.model.source;
                    }
                    this.$el.find('input:checked').each(function () {
                        href += '&subject=' + this.id.replace('_large', '');
                    });
                    controller.loadResults({
                        'href': href
                    }).done(function (result, tempParams) {
                        resultCommon(result, tempParams);
                        if ($.isEmptyObject(result.filters)) {
                            controller.getResultsCount().done(renderFilters);
                        } else {
                            if (!tempParams.subject || $.isEmptyObject(result.filters['subjects.ext'])) {
                                updateFilters(result.filters);
                            } else {
                                updateFilters(result.filters, 'subjects.ext');
                            }
                        }
                    });
                    if ($($(e.currentTarget).parent().parent()).find('input:checked').length) {
                        $($(e.currentTarget).parent().parent().siblings()).find('span.filter-clear-wrap').removeClass('hide');
                    } else {
                        $($(e.currentTarget).parent().parent().siblings()).find('span.filter-clear-wrap').addClass('hide');
                    }
                    $('#' + e.target.id.replace('large', 'small')).next().trigger('click');
                },
                'expandSubjects': function (event) {
                    $(event.currentTarget).toggleClass('expanded').next().toggleClass('hide');
                    if ($(event.currentTarget).next().find('input:checked').length && $(event.currentTarget).hasClass('expanded')) {
                        $(event.currentTarget).find('span.filter-clear-wrap').removeClass('hide');
                    } else {
                        $(event.currentTarget).find('span.filter-clear-wrap').addClass('hide');
                    }
                }
            }, {
                'template': _.template(TMPL.subject_filter, null, {
                    'variable': 'data'
                })
            });
            subjectFilterSmallView = Backbone.View.extend({
                'events': {
                    'click .js-subject-heading': 'expandSubjects',
                    'change input': 'changeSubject'

                },
                'initialize': function () {
                    try {
                        this.$el.html(subjectFilterSmallView.template({
                            'selected': this.model.subject,
                            'filters': this.model.allSubjectFilters
                        }));
                    } catch (e) {
                        console.log(e);
                    }
                },
                'updateURL': function (tempParams) {
                    this.model = tempParams;
                },
                'changeSubject': function (e) {
                    if ($($(e.currentTarget).parent().parent()).find('input:checked').length) {
                        $($(e.currentTarget).parent().parent().siblings()).find('span.filter-clear-wrap-small').removeClass('hide');
                    } else {
                        $($(e.currentTarget).parent().parent().siblings()).find('span.filter-clear-wrap-small').addClass('hide');
                    }
                },
                'expandSubjects': function (event) {
                    if ($(event.target).hasClass('js-clear-individual-filters-small')) {
                        return;
                    }
                    $(event.currentTarget).toggleClass('expanded').next().toggleClass('hide');
                    if ($(event.currentTarget).next().find('input:checked').length && $(event.currentTarget).hasClass('expanded')) {
                        $(event.currentTarget).find('span.filter-clear-wrap-small').removeClass('hide');
                    } else {
                        $(event.currentTarget).find('span.filter-clear-wrap-small').addClass('hide');
                    }
                }
            }, {
                'template': _.template(TMPL.subject_filter_small, null, {
                    'variable': 'data'
                })
            });

            countryFilterView = Backbone.View.extend({
                'template': _.template(TMPL.country_filter, null, {
                    'variable': 'data'
                }),
                'events': {
                    'change input': 'changeCountry'
                },
                'initialize': function () {
                    try {
                        this.$el.html(this.template({
                            'filters': this.model.allCountryFilters
                        }));
                        if (this.model.grade) {
                            this.$el.parent().find('span.filter-clear-wrap').removeClass('hide');
                        } else {
                            this.$el.parent().find('span.filter-clear-wrap').addClass('hide');
                        }
                    } catch (e) {
                        console.log(e);
                    }
                },
                'changeCountry': function (e) {

                }
            });

            countryFilterSmallView = Backbone.View.extend({
                'template': _.template(TMPL.grade_filter_small, null, {
                    'variable': 'data'
                }),
                'events': {
                    'change input': 'changeCountry'
                },
                'initialize': function () {
                    try {
                        this.$el.html(this.template({
                            'filters': this.model.allCountryFilters
                        }));
                    } catch (e) {
                        console.log(e);
                    }
                },
                'changeCountry': function () {
                    if (this.$el.find('input:checked').length) {
                        this.$el.parent().find('span.filter-clear-wrap-small').removeClass('hide');
                    } else {
                        this.$el.parent().find('span.filter-clear-wrap-small').addClass('hide');
                    }
                },
                'updateURL': function (tempParams) {
                    this.model = tempParams;
                }
            });

            cbseIntroView = Backbone.View.extend({
                'el': '#cbse-intro-container',
                'events': {
                    'click .got-it-btn' : 'removeIntroContainer'
                },
                'template': '<div class="cbse-introduction-container"><div class="bold">Introducing CK-12 CBSE Flexbooks for India</div><div class="select-filter-text">Select filter to view books.</div><span class="standard button turquoise got-it-btn">Got it</span></div>',
                'initialize': function() {
                    this.$el.append(this.template);
                },
                'removeIntroContainer': function() {
                    this.remove();
                }
            });

            cbseIntroSmallView = Backbone.View.extend({
                'el': '#search-container',
                'events': {
                    'click .got-it-btn' : 'removeIntroContSmall',
                    'click .js-filter-link-container' : 'moveIntroContainer'
                },
                'template': '<div class="cbse-introduction-container-small"><div class="bold">Introducing CK-12 CBSE Flexbooks for India</div><div class="select-filter-text">Select filter "Country > India" to view books.</div><span class="bold got-it-btn right">GOT IT</span></div>',
                'initialize': function() {
                    this.$el.append(this.template);
                },
                'removeIntroContSmall': function() {
                    this.$el.find('.cbse-introduction-container-small').remove();
                },
                'moveIntroContainer': function() {
                    this.$el.find('.country-filter-container').append(this.$el.find('.cbse-introduction-container-small'));
                }
            });

            gradeFilterView = Backbone.View.extend({
                'events': {
                    'change input': 'changeGrade'
                },
                'initialize': function () {
                    var hasGrades;
                    try {
                        this.$el.html(gradeFilterView.template({
                            'selected': this.model.grade,
                            'filters': this.model.allGradeFilters
                        }));
                        if (this.model.grade) {
                            this.$el.parent().find('span.filter-clear-wrap').removeClass('hide');
                        } else {
                            this.$el.parent().find('span.filter-clear-wrap').addClass('hide');
                        }
                        hasGrades = !this.model.allGradeFilters.count || this.model.allGradeFilters.count.some(function (grade) {
                            return !!grade;
                        });
                        this.$el.prev().toggleClass('expanded', hasGrades);
                        this.$el.toggleClass('hide', !hasGrades);
                    } catch (e) {
                        console.log(e);
                    }
                },
                'updateURL': function (tempParams) {
                    this.model = tempParams;
                },
                'changeGrade': function (e) {
                    if (changeOnly) {
                        return false;
                    }
                    var href = controller.processURLForSpecialSearch(this.model.searchTerm);
                    if (false !== href) { // inequality to ONLY false is what this is supposed to do
                        href = this.model.url.pathname + '?q=' + href;
                    } else {
                        return false;
                    }
                    if (this.model.searchType) {
                        href += addFilterURL(this.model.searchType, '&type=');
                    }
                    if (this.model.subject) {
                        href += addFilterURL(this.model.subject, '&subject=');
                    }
                    if (this.model.source) {
                        href += '&source=' + this.model.source;
                    }
                    this.$el.find('input:checked').each(function () {
                        href += '&grade=' + this.id.replace('grade', '').replace('_large', '');
                    });
                    controller.loadResults({
                        'href': href
                    }).done(function (result, tempParams) {
                        resultCommon(result, tempParams);
                        if ($.isEmptyObject(result.filters)) {
                            controller.getResultsCount().done(renderFilters);
                        } else {
                            if (!tempParams.grade || $.isEmptyObject(result.filters['gradeLevels.ext'])) {
                                updateFilters(result.filters);
                            } else {
                                updateFilters(result.filters, 'gradeLevels.ext');
                            }
                        }
                    });
                    if (this.$el.find('input:checked').length !== 0) {
                        this.$el.parent().find('span.filter-clear-wrap').removeClass('hide');
                    } else {
                        this.$el.parent().find('span.filter-clear-wrap').addClass('hide');
                    }
                    $('#' + e.target.id.replace('large', 'small')).next().trigger('click');
                }
            }, {
                'template': _.template(TMPL.grade_filter, null, {
                    'variable': 'data'
                })
            });
            gradeFilterSmallView = Backbone.View.extend({
                'events': {
                    'change input': 'changeGrade'
                },
                'initialize': function () {
                    try {
                        this.$el.html(gradeFilterSmallView.template({
                            'selected': this.model.grade,
                            'filters': this.model.allGradeFilters
                        }));
                    } catch (e) {
                        console.log(e);
                    }
                },
                'changeGrade': function () {
                    if (this.$el.find('input:checked').length) {
                        this.$el.parent().find('span.filter-clear-wrap-small').removeClass('hide');
                    } else {
                        this.$el.parent().find('span.filter-clear-wrap-small').addClass('hide');
                    }
                },
                'updateURL': function (tempParams) {
                    this.model = tempParams;
                }
            }, {
                'template': _.template(TMPL.grade_filter_small, null, {
                    'variable': 'data'
                })
            });

            categoryFilterView = Backbone.View.extend({
                'events': {
                    'change input': 'changeCategory'
                },
                'initialize': function () {
                    var hasType;
                    this.$el.html(categoryFilterView.template({
                        'selected': this.model.searchType,
                        'filters': this.model.allTypeGroups,
                        'href': this.processHREF() + '&type='
                    }));
                    if (this.model.searchType) {
                        this.$el.parent().find('span.filter-clear-wrap').removeClass('hide');
                    } else {
                        this.$el.parent().find('span.filter-clear-wrap').addClass('hide');
                    }
                    hasType = !this.model.allTypeGroups.count || this.model.allTypeGroups.count.some(function (type) {
                        return !!type;
                    });
                    this.$el.prev().toggleClass('expanded', hasType);
                    this.$el.toggleClass('hide', !hasType);
                },
                'updateURL': function (tempParams) {
                    this.model = tempParams;
                },
                'processHREF': function () {
                    var href = controller.processURLForSpecialSearch(this.model.searchTerm);
                    if (false !== href) { // inequality to ONLY false is what this is supposed to do
                        href = this.model.url.pathname + '?q=' + href;
                    } else {
                        return false;
                    }
                    if (this.model.grade) {
                        href += addFilterURL(this.model.grade, '&grade=');
                    }
                    if (this.model.subject) {
                        href += addFilterURL(this.model.subject, '&subject=');
                    }
                    if (this.model.source) {
                        href += '&source=' + this.model.source;
                    }
                    return href;
                },
                'changeCategory': function (e) {
                    if (changeOnly) {
                        return false;
                    }
                    var href = this.processHREF();
                    this.$el.find('input:checked').each(function () {
                        href += '&type=' + this.id.replace('category', '').replace('_large', '');
                    });
                    controller.loadResults({
                        'href': href
                    }).done(function (result, tempParams) {
                        resultCommon(result, tempParams);
                        if ($.isEmptyObject(result.filters)) {
                            controller.getResultsCount().done(renderFilters);
                        } else {
                            if (!tempParams.types || $.isEmptyObject(result.filters['typeStr'])) {
                                updateFilters(result.filters);
                            } else {
                                updateFilters(result.filters, 'typeStr');
                            }
                        }
                    });
                    if (this.$el.find('input:checked').length) {
                        this.$el.parent().find('span.filter-clear-wrap').removeClass('hide');
                    } else {
                        this.$el.parent().find('span.filter-clear-wrap').addClass('hide');
                    }
                    $('#' + e.target.id.replace('large', 'small')).next().trigger('click');
                },
                'clearCategory': function (e) {
                    if (changeOnly) {
                        return false;
                    }
                    var self = this;
                    controller.loadResults({
                        'href': e.target.href
                    }).done(function (result, tempParams) {
                        changeOnly = true;
                        self.$el.find('input').prop('checked', false);
                        changeOnly = false;
                        resultCommon(result, tempParams);
                    });
                    return false;
                }
            }, {
                'template': _.template(TMPL.category_filter, null, {
                    'variable': 'data'
                })
            });
            categoryFilterSmallView = Backbone.View.extend({
                'events': {
                    'change input': 'changeCategory'
                },
                'initialize': function () {
                    this.$el.html(categoryFilterSmallView.template({
                        'selected': this.model.searchType,
                        'filters': this.model.allTypeGroups
                    }));
                    if (this.model.searchType) {
                        this.$el.parent().find('span.filter-clear-wrap-small').removeClass('hide');
                    } else {
                        this.$el.parent().find('span.filter-clear-wrap-small').addClass('hide');
                    }
                },
                'updateURL': function (tempParams) {
                    this.model = tempParams;
                },
                'changeCategory': function () {
                    if (this.$el.find('input:checked').length) {
                        this.$el.parent().find('span.filter-clear-wrap-small').removeClass('hide');
                    } else {
                        this.$el.parent().find('span.filter-clear-wrap-small').addClass('hide');
                    }
                }
            }, {
                'template': _.template(TMPL.category_filter_small, null, {
                    'variable': 'data'
                })
            });

            contentFilterView = Backbone.View.extend({
                'events': {
                    'click a': 'changeContent'
                },
                'initialize': function () {
                    this.$el.html(contentFilterView.template({
                        'selected': this.model.source,
                        'href': this.processHREF(),
                        'user': $('header').data('user')
                    }));
                },
                'updateURL': function (tempParams) {
                    try {
                        this.model = tempParams;
                        var href = this.processHREF();
                        this.$el.find('a').each(function () {
                            this.href = href + $(this).attr('data-value');
                        });
                    } catch (e) {
                        console.log(e);
                    }
                },
                'processHREF': function () {
                    var href = controller.processURLForSpecialSearch(this.model.searchTerm);
                    if (false !== href) { // inequality to ONLY false is what this is supposed to do
                        href = this.model.url.pathname + '?q=' + href;
                    } else {
                        return false;
                    }
                    if (this.model.grade) {
                        href += addFilterURL(this.model.grade, '&grade=');
                    }
                    if (this.model.subject) {
                        href += addFilterURL(this.model.subject, '&subject=');
                    }
                    if (this.model.searchType) {
                        href += addFilterURL(this.model.searchType, '&type=');
                    }
                    href += '&source=';
                    return href;
                },
                'changeContent': function (e) {
                    var This = $(e.target).closest('a');
                    if (changeOnly || This.hasClass('selected')) {
                        This.addClass('selected').siblings('.selected').removeClass('selected');
                        return false;
                    }
                    controller.loadResults({
                        'href': This.prop('href')
                    }).done(function (result, tempParams) {
                        This.addClass('selected').siblings('.selected').removeClass('selected');
                        resultCommon(result, tempParams);
                        if ($.isEmptyObject(result.filters)) {
                            controller.getResultsCount({
                                'href': This.prop('href')
                            }).done(renderFilters);
                        } else {
                            updateFilters(result.filters);
                        }
                    });
                    $('#content-filter_small').children('[data-value="' + $(e.target).data('value') + '"]').trigger('click');
                    return false;
                }
            }, {
                'template': _.template(TMPL.content_filter, null, {
                    'variable': 'data'
                })
            });

            searchMainView = Backbone.View.extend({
                'events': {
                    'click .searchOriginal': 'searchOriginal',
                    'click .js-expandable-filter': 'expandFilters',
                    'click .js-back-icon': 'showSearchResults',
                    'click .js-clear-all': 'clearFilters',
                    'click .js-mobile-clear-all': 'clearFiltersSmall',
                    'click #apply-filters': 'applyFilters',
                    'click .js-clear-individual-filters': 'clearIndividualFilters',
                    'click .js-clear-individual-filters-small': 'clearIndividualFiltersSmall',
                    'click .js_suggested_link': 'suggestedLink'
                },
                'initialize': function () {
                    try {
                        this.$el.html(searchMainView.template({
                            'originalTerm': this.model.originalTerm,
                            'suggestedTerm': this.model.suggestedTerm
                        }));
                        if (this.model.suggestedTerm) {
                            recentFilterState = '';
                        }
                    } catch (e) {
                        console.log(e);
                    }
                },
                'suggestedLink': function () {
                    var href = controller.processURLForSpecialSearch(this.model.suggestedTerm);
                    if (false !== href) { // inequality to ONLY false is what this is supposed to do
                        href = this.model.url.pathname + '?q=' + href;
                    } else {
                        return false;
                    }
                    if (this.model.searchType) {
                        href += addFilterURL(this.model.searchType, '&type=');
                    }
                    if (this.model.grade) {
                        href += addFilterURL(this.model.grade, '&grade=');
                    }
                    if (this.model.subject) {
                        href += addFilterURL(this.model.subject, '&subject=');
                    }
                    if (this.model.source) {
                        href += '&source=' + this.model.source;
                    }
                    controller.loadResults({
                        'href': href
                    }).done(function (result, tempParams) {
                        delete tempParams.suggestedTerm;
                        resultCommon(result, tempParams);
                        $('#suggestion-container').addClass('hide');
                    });
                },
                'updateURL': function (tempParams) {
                    this.model = tempParams;
                },
                'searchOriginal': function (event) {
                    var source = $(event.target).closest('a').data('source') || 'ck12';
                    controller.searchOriginalTerm({
                        'source': source,
                        'q': this.model.originalTerm || ''
                    }).done(function (result, tempParams) {
                        changeOnly = true;
                        $('#content-filter').children('a[data-value=' + source + ']').trigger('click');
                        $('#suggestion-container').addClass('hide');
                        changeOnly = false;
                        resultCommon(result, tempParams);
                    });
                },
                'expandFilters': function (event) {
                    if ($(event.target).hasClass('js-clear-individual-filters')) {
                        return false;
                    }
                    if ($(event.target).hasClass('js-clear-individual-filters-small')) {
                        return false;
                    }
                    var $this = $(event.currentTarget);
                    $this.toggleClass('expanded');
                    if (!$this.hasClass('expanded')) {
                        $this.find('span.filter-clear-wrap').addClass('hide');
                        $this.find('span.filter-clear-wrap-small').addClass('hide');
                    }
                    $this.next().toggleClass('hide');
                    if ($this.next().find('input:checked').length && $this.hasClass('expanded')) {
                        $this.find('span.filter-clear-wrap').removeClass('hide');
                        $this.find('span.filter-clear-wrap-small').removeClass('hide');
                    }
                },
                'showSearchResults': function () {
                    $('body').removeClass('filter-view');
                    $('.js-search-container').show(500);
                    $('.js-mobile-filters-wrapper').removeClass('filters-expanded');
                    $('.js-mobile-filters-wrapper').hide();
                    var key, index;
                    changeOnly = true;
                    for (key in filterState) {
                        if (filterState.hasOwnProperty(key)) {
                            $('#' + key + '-filter_small').find('input').prop('checked', false);
                            filterState[key] = filterState[key].split(',');
                            for (index = 0; index < filterState[key].length; index++) {
                                $('#' + filterState[key][index]).prop('checked', true);
                            }
                            filterState[key] = '';
                        }
                    }
                    changeOnly = false;
                },
                'clearFilters': function () {
                    var href = controller.processURLForSpecialSearch(this.model.searchTerm);
                    if (false !== href) { // inequality to ONLY false is what this is supposed to do
                        href = this.model.url.pathname + '?q=' + href;
                    } else {
                        return false;
                    }
                    href += '&source=' + $('#content-filter').find('a.selected').data('value');
                    href += '&type=all';
                    controller.loadResults({
                        'href': href
                    }).done(function (result, tempParams) {
                        changeOnly = true;
                        $('#grade-filter').find('input').prop('checked', false);
                        $('#subject-filter').find('input').prop('checked', false);
                        $('#category-filter').find('[data-value="all"]').addClass('selected').end().find('input').prop('checked', false);
                        changeOnly = false;
                        $('.js-clear-individual-filters').parent().addClass('hide');
                        resultCommon(result, tempParams);
                        if ($.isEmptyObject(result.filters)) {
                            controller.getResultsCount().done(renderFilters);
                        } else {
                            updateFilters(result.filters);
                        }
                    });
                },
                'clearFiltersSmall': function () {
                    $('#grade-filter_small').find('input').prop('checked', false);
                    $('#subject-filter_small').find('input').prop('checked', false);
                    $('#content-filter_small').find('[data-value="all"]').addClass('selected').siblings('.selected').removeClass('selected');
                    $('#category-filter_small').find('[data-value="all"]').addClass('selected').end().find('input').prop('checked', false);
                    $('.js-clear-individual-filters-small').parent().addClass('hide');
                },
                'clearIndividualFilters': function (e) {
                    if (changeOnly) {
                        return false;
                    }
                    var curr,
                        href = controller.processURLForSpecialSearch(this.model.searchTerm),
                        changed = $(e.currentTarget).closest('.each-filter-container').data('filter');
                    //var self = this;
                    if (false !== href) { // inequality to ONLY false is what this is supposed to do
                        href = this.model.url.pathname + '?q=' + href;
                    } else {
                        return false;
                    }
                    if (changed !== 'GRADES') {
                        if (this.model.grade) {
                            href += addFilterURL(this.model.grade, '&grade=');
                        }
                    }
                    if (changed !== 'CATEGORIES') {
                        if (this.model.searchType) {
                            href += addFilterURL(this.model.searchType, '&type=');
                        }
                    }
                    if (changed !== 'SUBJECTS') {
                        curr = $('#subject-filter').children().children().find('input:checked');
                        curr.each(function () {
                            href += '&subject=' + this.id.replace('_large', '');
                        });
                    }
                    if (this.model.source) {
                        href += '&source=' + this.model.source;
                    }
                    if (changed === 'CATEGORIES') {
                        href += '&type=all';
                        $('#category-filter').find('input').prop('checked', false);
                    } else if (changed === 'GRADES') {
                        $('#grade-filter').find('input').prop('checked', false);
                    } else if (changed === 'SUBJECTS') {
                        $(e.currentTarget).parent().parent().siblings().find('input').prop('checked', false);
                        curr = $('#subject-filter').children().children().find('input:checked');
                        curr.each(function () {
                            href += '&subject=' + this.id.replace('_large', '');
                        });
                    }
                    $(e.currentTarget).parent().addClass('hide');
                    controller.loadResults({
                        'href': href
                    }).done(function (result, tempParams) {
                        resultCommon(result, tempParams);
                        if ($.isEmptyObject(result.filters)) {
                            controller.getResultsCount().done(renderFilters);
                        } else {
                            updateFilters(result.filters);
                        }
                    });
                    return false;
                },
                'clearIndividualFiltersSmall': function (e) {
                    if (changeOnly) {
                        return false;
                    }
                    $(e.target).parent().parent().siblings().find('input').prop('checked', false);
                    $(e.target).parent().addClass('hide');
                },
                'applyFilters': function () {
                    var href = controller.processURLForSpecialSearch(this.model.searchTerm);
                    if (false !== href) { // inequality to ONLY false is what this is supposed to do
                        href = this.model.url.pathname + '?q=' + href;
                    } else {
                        return false;
                    }
                    changeOnly = true;

                    filterState.grade = '';
                    filterState.subject = '';
                    filterState.category = '';
                    $('#category-filter').find('input').prop('checked', false);
                    if ($('#category-filter_small').children('[data-value="all"]').hasClass('selected')) {
                        href += '&type=' + $('#category-filter_small').children('[data-value="all"]').attr('data-value');
                        $('#category-filter').children('[data-value="all"]').trigger('click');
                    } else {
                        $('#category-filter_small').find('input:checked').each(function () {
                            href += '&type=' + this.id.replace('category', '').replace('_small', '');
                            $('#' + this.id.replace('small', 'large')).next().trigger('click');
                            filterState.category += this.id + ',';
                        });
                    }

                    href += '&source=' + $('#content-filter').find('.selected').attr('data-value');

                    $('#subject-filter').find('input').prop('checked', false);
                    $('#subject-filter_small').find('input:checked').each(function () {
                        href += '&subject=' + this.id.replace('_small', '');
                        $('#' + this.id.replace('small', 'large')).next().trigger('click');
                        filterState.subject += this.id + ',';
                    });

                    $('#grade-filter').find('input').prop('checked', false);
                    $('#grade-filter_small').find('input:checked').each(function () {
                        href += '&grade=' + this.id.replace('grade', '').replace('_small', '');
                        $('#' + this.id.replace('small', 'large')).next().trigger('click');
                        filterState.grade += this.id + ',';
                    });

                    filterState.grade = customTrim(filterState.grade, ',');
                    filterState.subject = customTrim(filterState.subject, ',');
                    filterState.category = customTrim(filterState.category, ',');

                    changeOnly = false;
                    controller.loadResults({
                        'href': href
                    }).done(function (result, tempParams) {
                        resultCommon(result, tempParams);
                        if ($.isEmptyObject(result.filters)) {
                            controller.getResultsCount().done(renderFilters);
                        } else {
                            updateFilters(result.filters);
                        }
                    });
                }
            }, {
                'template': _.template(TMPL.main, null, {
                    'variable': 'data'
                })
            });

            function init(container, result, tempParams) {
                    searchMainInstance = new searchMainView({
                        'el': container,
                        'model': tempParams
                    });

                    renderFilters(tempParams);
                    
                    contentFilterInstance = new contentFilterView({
                        'el': $('#content-filter'),
                        'model': tempParams
                    });

                    searchResultsHeaderInstance = new searchResultsHeaderView({
                        'el': $('#search-result-header'),
                        'model': tempParams
                    });
                    searchResultsInstance = new searchResultsListView({
                        'el': $('#search-list'),
                        'model': result,
                        'searchableBookTypes': tempParams.searchableBookTypes
                    });
                    recentFilterState = tempParams.url.href;
                    if (tempParams.suggestedTerm) {
                        recentFilterState = recentFilterState.replace('q=' + tempParams.suggestedTerm, 'q=' + tempParams.originalTerm);
                    }
                    //                disableFacets(result.filters);
                    if ((result.total / result.limit) > 1) {
                        searchPaginationInstance = new searchPaginationView({
                            'el': $('#search-pagination-container'),
                            'model': tempParams
                        });
                    }

                    $(window).off('resize.searchView').on('resize.searchView', function () {
                        if ($('.mobile-filters-wrapper').is(':visible') && $(window).width() >= 768) {
                            $('.js-back-icon').trigger('click');
                        }
                    }).off('popstate.search').on('popstate.search', function () {
                        controller.loadResults({
                            'href': location.href,
                            'popState': true
                        }).done(function (result, params) {
                            var isPagination = pageNum !== parseInt(params.pageNum, 10);
                            changeFilters(params, isPagination, result);
                            resultCommon(result, params, isPagination);
                            controller.getResultsCount({
                                'href': location.href
                            }).done(renderFilters);
                        });
                    }).off('hashchange.search').on('hashchange.search', function () {
                        controller.loadResults({
                            'href': location.href,
                            'popState': true
                        }).done(function (result, params) {
                            var isPagination = pageNum !== parseInt(params.pageNum, 10);
                            changeFilters(params, isPagination, result);
                            resultCommon(result, params, isPagination);
                            controller.getResultsCount({
                                'href': location.href
                            }).done(renderFilters);
                        });
                    });
            }

            this.init = init;
            this.renderFilters = renderFilters;
        }

        return searchView;
    });
