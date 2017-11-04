define([
    'jquery',
    'underscore',
    'common/utils/utils',
    'modality/services/services',
], function ($, _, util, ModalityServices) {
    'use strict';

    var book_types = ['book', 'tebook', 'workbook', 'labkit', 'quizbook'];
    var book_label = 'FlexBook® Textbooks';
    var library_categories = [{
        displayText: book_label,
        artifactTypes: book_types,
        alias: 'book'
    }];
    var excludedCategoryGroups = ['all', 'attachment', 'other'];
    var excludedArtifactTypes = ['concept'];

    //MODALITY CONFIGURATION related code...
    //TODO: This logic should be moved to it's own model
    var library_modality_groups = [];
    var library_modality_types = [];

    //The new API has a new data structure. A data transformation is required to make old code work.
    var convertDataStructure = function(data){
        var artifacts = data.response.artifacts;
        data.response.artifacts = [];
        if(artifacts && artifacts.length > 0){
            artifacts.forEach(function(artifact){
                var gradeGrid = artifact.browseTerms.filter(function(browseTerm){
                    return browseTerm.type.name === 'grade level';
                }).map(function(grade){
                    return [grade.id, grade.name];
                });
                var coverImageResource = artifact.resources.filter(function(resource){
                    return resource.type.id === 2; // 2 is cover image
                });
                var domain = artifact.browseTerms.filter(function(browseTerm){
                    return browseTerm.type.name ==='domain' || browseTerm.type.name ==='pseudodomain';
                });
                if (!domain.length && artifact.domainCollectionContexts) {
                    try {
                        if (artifact.domainCollectionContexts.length > 0 && artifact.domainCollectionContexts[0].domain){
                            domain = [artifact.domainCollectionContexts[0].domain];
                        }
                    } catch(e){
                        console.log('convertDataStructure: failed to set domain - '+str(e));
                    }
                }
                var newArtifact = {
                    artifactID: artifact.id,
                    artifactType: artifact.type.name,
                    authors: artifact.authors,
                    handle: artifact.handle,
                    created:  artifact.createdTime,
                    creator: artifact.creator,
                    description: artifact.description,
                    gradeGrid: gradeGrid,
                    modified: artifact.updatedTime.replace(' ', 'T'),
                    revisions: [{
                        revision: artifact.revisions[0].no
                    }],
                    revision: artifact.revisions[0].no,
                    title: artifact.title,
                    hasDraft: artifact.hasDraft,
                    perma: '/' + artifact.type.name + '/' + artifact.handle + '/user:' + artifact.creator.login,
                    subjects: artifact.browseTerms.filter(function(browseTerm){ return browseTerm.type.name.toLowerCase() === 'subject' && browseTerm.name.toLowerCase() !== 'engineering'})
                }
                if(artifact.revisions){
                    newArtifact.revisions = artifact.revisions;
                }
                if(artifact.lmsContext){
                    newArtifact.lmsContext = artifact.lmsContext;
                }
                if(artifact.coverImageSatelliteUrl){
                    newArtifact.coverImageSatelliteUrl = artifact.coverImageSatelliteUrl;
                }else if(artifact.coverImage){
                    newArtifact.coverImageSatelliteUrl = artifact.coverImage;
                }
                if(artifact.creator.id !== 3){
                    newArtifact.realm =  'user:' + artifact.creator.login;
                }
                if(domain.length > 0){
                    newArtifact.domain = {
                      encodedID: domain.encodedID || (domain[0].encodedID ? domain[0].encodedID :"")
                    };
                }
                if(artifact.revisions && artifact.revisions.length > 0){
                    newArtifact.artifactRevisionID = artifact.revisions[0].id;
                }
                if(artifact.domainCollectionContexts){
                    newArtifact.domainCollectionContexts = artifact.domainCollectionContexts;
                    try {
                        newArtifact.collection = newArtifact.domainCollectionContexts[1] && 
                                                  newArtifact.domainCollectionContexts[1].collectionContext;
                    } catch(e) {
                        console.log("convertDataStructure could net set collection " + str(e));
                    }
                }
                data.response.artifacts.push(newArtifact);
            });
        }
    };
    var buildCategoriesFromModalityGroups = function (groups) {
        var group, i, l,
            categories = [];
        if (!groups && groups.length) {
            return false;
        }
        for (i = 0, l = groups.length; i < l; i++) {
            group = groups[i];
            if (!_(excludedCategoryGroups).contains(group.group_classname)) {
                categories.push({
                    displayText: group.display_text,
                    artifactTypes: _.without.apply(_, [group.artifact_types].concat(excludedArtifactTypes)),
                    alias: group.group_classname,
                    sequence: group.sequence
                });
            }
        }
        categories = _(categories).sortBy(function (g) {
            return g.sequence;
        });
        library_categories = library_categories.concat(categories);
    };

    var processModalityConfig = function (config) {
        var book_type, i, l;
        buildCategoriesFromModalityGroups(config.modality_groups);
        library_modality_types = config.modalities;
        for (i = 0, l = book_types.length; i < l; i++) {
            book_type = book_types[i];
            library_modality_types[book_type] = {
                artifact_type: book_type,
                display_label: book_label
            };
        }
        library_modality_groups = config.modality_groups;
    };

    var getGroupByArtifactType = function (artifactType) {
        var g, i, l;
        for (i = 0, l = library_modality_groups.length; i < l; i++) {
            g = library_modality_groups[i];
            if (_(g.artifact_types).contains(artifactType)) {
                return g;
            }
        }
    };

    // Return a list that only contains the filters specified
    // I check against the alias name and not the displayed name
    var processShownCategoryFilters = function (categories, shownFilters) {
	var filtered_categories = [];
        filtered_categories = _.filter(categories,function(item){
	    return shownFilters.indexOf(item.alias)!=-1;
        });
        return filtered_categories;
    };

    var config_fetch_deferred = ModalityServices.getModalityConfig().done(processModalityConfig);

    var GRADESOBJECT = {
        'K': 'Kindergarten',
        '1': '1st Grade',
        '2': '2nd Grade',
        '3': '3rd Grade',
        '4': '4th Grade',
        '5': '5th Grade',
        '6': '6th Grade',
        '7': '7th Grade',
        '8': '8th Grade',
        '9': '9th Grade',
        '10': '10th Grade',
        '11': '11th Grade',
        '12': '12th Grade'
    };

    var protectedLabels = ['archived'];

    var _dfd = util.deferredFunction,
        ck12ajax = util.ck12ajax,
        api_library = util.getApiUrl('flx/get/mylib/info/'),
        api_delete_label = util.getApiUrl('flx/delete/mylib/label'),
        api_create_label = util.getApiUrl('flx/create/mylib/label'),
        api_apply_label = util.getApiUrl('flx/add/mylib/objects'),
        api_gdt_auth_status = util.getApiUrl('flx/get/status/google/auth'),
        api_google_auth_url = util.getApiUrl('flx/get/authURL/google'),
        api_gdt_get_doclist = util.getApiUrl('flx/get/documents/google'),
        api_gdt_get_collist = util.getApiUrl('flx/get/folders/google'),
        //api_gdt_get_doclist = '/media/library/js/models/library.google.list.json',
        api_task_status = '/task/status/',
        api_import_gdt_task_status = util.getApiUrl('flx/get/status/task/'),
        api_correlated_subjects = util.getApiUrl('flx/get/info/subjects/correlated'),
        api_correlated_standardboards = util.getApiUrl('flx/get/info/standardboards/correlated/'),
        api_correlated_grades = util.getApiUrl('flx/get/info/grades/correlated/'),
        api_correlated_grades_alternate = util.getApiUrl('flx/get/info/grades/correlated_alternate/'),
        api_get_chapters = util.getApiUrl('flx/search/standard/'),
        api_assemble_book = util.getApiUrl('flx/assemble/artifact'),
        api_import_gdt = util.getApiUrl('flx/import/gdt/artifact'),
        api_update_resource = util.getApiUrl('flx/update/resource'),
        api_fetch_artifact = util.getApiUrl('flx/get/detail');


    var LibraryService = {
        fetchItems: _dfd(function (_d, options) {
            var api_url = api_library,
                str_artifact_types,
                params = {};

            options = $.extend({
                itemType: 'artifacts',
                artifact_types: [],
                labels: [],
                grades: [],
                sort: 'updateTime,desc',
                filters: '',
                ownership: 'owned',

                pageSize: 5,
                pageNum: 1
            }, options);

            if (options.itemType === 'resources') {
                api_url += '/resources/';
                options.artifact_types = ['resource'];
            }

            if (options.archived) {
                if (!options.labels) {
                    options.labels = [];
                }
                options.labels.push('archived');
            }

            params.ownership = options.ownership;
            params.pageNum = options.pageNum;
            params.pageSize = options.pageSize;
            params.sort = options.sort;
            params.includeRevisionsInState = options.includeRevisionsInState;


            str_artifact_types = options.artifact_types.join(',');
            api_url += str_artifact_types;

            if (options.labels && options.labels.length) {
                api_url += '/' + options.labels.join(',');
            }

            return ck12ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_url,
                responseType: 'json',
                data: params
            }).done(function (data) {
                convertDataStructure(data);
                config_fetch_deferred.done(function () { //this is a dependency
                    var i, l,
                        res = {},
                        items = data.response[options.itemType],
                        item, artifactType;
                    res.currentPage = 1 + Math.floor(data.response.offset / options.pageSize);
                    res.totalPages = Math.ceil(data.response.total / options.pageSize);
                    //process items, add group and modalityType info
                    //only if it's an artifact
                    if (options.itemType === 'artifacts') {
                        for (i = 0, l = items.length; i < l; i++) {
                            item = items[i];
                            artifactType = item.artifactType;
                            item.modalityTypeInfo = library_modality_types[artifactType];
                            item.modalityGroupInfo = getGroupByArtifactType(artifactType);
                        }
                    }
                    res.items = items;
                    res.archived = options.archived;
                    res.xhrResponse = data;
                    _d.resolve(res);
                });
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        fetchLabels: _dfd(function (_d, options) {
            options = $.extend({
                pageSize: 50
            }, options);
            return ck12ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_library + 'labels',
                data: options
            }).done(function (data) {
                var labels = data.response.labels;
                labels = _(labels).reject(function (l) {
                    return _(protectedLabels).contains(l.label);
                });
                _d.resolve(labels);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        fetchCategories: _dfd(function (_d, options) {
            config_fetch_deferred.done(function () {
                var categories = library_categories;
                if (options.excludeBooks){
                    categories.splice(0,1);
                }
		if (options.shownFilters) {
		    //
		    var shownFilters = ["book"];
		    if (options.excludeBooks){
		        shownFilters.pop();
		    }
		    shownFilters = _.union(options.shownFilters,shownFilters);
		    //
		    categories = processShownCategoryFilters(categories,shownFilters);
		}
                _d.resolve(categories);
            }).fail(function () {
                _d.reject("couldn't fetch modaality configuration");
            });
        }),
        deleteLabel: _dfd(function (_d, options) {
            return ck12ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_delete_label,
                data: options
            }).done(function (data) {
                _d.resolve(data);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        createLabel: _dfd(function (_d, options) {
            return ck12ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_create_label,
                data: options
            }).done(function (data) {
                _d.resolve(data);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        applyLabels: _dfd(function (_d, options) {
            return ck12ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_apply_label,
                type: 'POST',
                responseType: 'json',
                data: options
            }).done(function (data) {
                _d.resolve(data);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        gdtAuthStatus: _dfd(function (_d) {
            return util.ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_gdt_auth_status
            }).done(function (data) {
                _d.resolve(data);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        getGoogleAuthURL: _dfd(function (_d) {
            return util.ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_google_auth_url
            }).done(function (data) {
                _d.resolve(data);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        loadDocList: _dfd(function (_d, options, docList) {
            var api_url = docList ? api_gdt_get_doclist : api_gdt_get_collist;
            return util.ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_url,
                data: options
            }).done(function (data) {
                if (data.response.message) {
                    _d.reject(data);
                } else {
                    data.response.currentPage = 1 + Math.floor(data.response.offset / options.pageSize);
                    data.response.totalPages = Math.ceil(data.response.total / options.pageSize);
                    _d.resolve(data.response);
                }
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        checkTaskStatus: _dfd(function (_d, options) {
            var api_url = options.gdtImport ? api_import_gdt_task_status + options.task_id : api_task_status + options.task_id + '/';
            return util.ajax({
                url: api_url
            }).done(function (data) {
                if (options.gdtImport) {
                    data = data.response;
                }
                _d.resolve(data);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        fetchSubjects: _dfd(function (_d, options) {
            return ck12ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_correlated_subjects,
                data: options
            }).done(function (data) {
                _d.resolve(data.response.subjects);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        fetchStandardboards: _dfd(function (_d, options) {
            return ck12ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_correlated_standardboards + options.subject
            }).done(function (data) {
                _d.resolve(data.response.standardBoards);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        fetchGrades: _dfd(function (_d, options) {
            var api_url = options.aletrnateGrade ? api_correlated_grades_alternate : api_correlated_grades;
            api_url += options.subject + '/' + options.standardBoardID;
            return util.ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_url
            }).done(function (data) {
                var index, gradeList = data.response.grades;
                for (index = 0; index < gradeList.length; index++) {
                    if (GRADESOBJECT.hasOwnProperty(gradeList[index].name)) {
                        gradeList[index].longname = GRADESOBJECT[gradeList[index].name];
                    }
                }
                data.response.grades = gradeList;
                _d.resolve(data);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        getChaptersByStandards: _dfd(function (_d, options, params, include_raw_response) {
            return ck12ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_get_chapters + options.artifactTypeName + '/' + options.state + '/' + options.grade + '/' + options.subject,
                data: params
            }).done(function (data) {
            	var i, artifacts_list = [], artifact = {};
                if (data.response && data.response.Artifacts) {
                    data = data.response.Artifacts;
                    for (i = 0; i < data.result.length; i++) {
                        artifact.artifactType = 'chapter';
                        artifact.title = data.result[i].chapterTitle;
                        artifact.artifactRevisionID = 'new';
                        artifact.children = data.result[i].artifacts;
                        delete artifact.artifacts;
                        artifact.xhtml = '';
                        artifacts_list.push($.parseJSON(JSON.stringify(artifact)));
                    }
                }
                if (include_raw_response) {
                    _d.resolve(artifacts_list, data);
                } else {
                    _d.resolve(artifacts_list);
                }
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        assembleBook: _dfd(function (_d, options) {
          // CHANGED BY pratyush : NEW SAVE API
          if( window.toggleForOldAPI ){

            return ck12ajax({
              isPageDisable: true,
              isShowLoading: true,
              url: api_assemble_book,
              type: 'POST',
              data: options
          }).done(function (data) {
              _d.resolve(data);
          }).fail(function (err) {
              _d.reject(err);
          });

          }else{
            require(['flxwebSaveAdaptor', 'js/flxwebSave/APIUtil'], function(flxwebSaveAdaptor, APIUtil){
              var data  =  flxwebSaveAdaptor.saveAdaptor( JSON.parse( window.atob(options.artifact)) );
              return APIUtil.requestSaveAPI( null, 'POST',
                              function(artifact, data){
                                    _d.resolve(
                                      {
                                        response:
                                          {
                                            artifact: data
                                          }
                                        }
                                      )},
                              function(artifact, data){
                                _d.reject( data )
                              },  data );
            })
          }

        }),
        importGoogleDocs: _dfd(function (_d, options) {
            return util.ajax({
                url: api_import_gdt,
                type: 'POST',
                data: options
            }).done(function (data) {
                _d.resolve(data);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        updateResource: _dfd(function (_d, options) {
            var data = $.extend({
                'isAttachment': options.isAttachment || true,
                'isPublic': options.isPublic || false,
                'isExternal': options.isExternal || false
            }, options);
            return ck12ajax({
                isPageDisable: true,
                isShowLoading: true,
                url: api_update_resource,
                data: data,
                type: 'POST'
            }).done(function (data) {
                _d.resolve(data);
            }).fail(function (err) {
                _d.reject(err);
            });
        }),
        fetchArtifact: _dfd(function (_d, options) {
            return util.ajax({
                url: api_fetch_artifact + '/' + options.artifactID
            }).done(function (data) {
                _d.resolve(data.response.artifact);
            }).fail(function (err) {
                _d.reject(err);
            });
        })
    };

    return LibraryService;

});
