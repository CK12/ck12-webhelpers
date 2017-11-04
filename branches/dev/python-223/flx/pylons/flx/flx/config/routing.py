"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from routes import Mapper

def make_map(config):
    """Create, configure and return the routes Mapper"""
    map = Mapper(directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'], explicit=True)
    map.minimization = False

    # The ErrorController route (handles 404/500 error pages); it should
    # likely stay at the top, ensuring it can always be resolved
    map.connect('/error/{action}', controller='error')
    map.connect('/error/{action}/{id}', controller='error')
    map.connect('/get/error/{action}/{id}', controller='error')

    ########## User Devices related ##########

    map.connect('/register/device', controller='userDevice', action='registerDevice')
    map.connect('/pushNotification', controller='userDevice', action='pushANotification')
    map.connect('/pushNotification/form', controller='userDevice', action='pushANotificationForm')

    #ArtifactDraft related
    map.connect('/artifactdraft/create', controller='artifactServiceManager', action='createArtifactDraft')
    map.connect('/artifactdraft/update/{artifactDraftID}', controller='artifactServiceManager', action='updateArtifactDraftByID')
    map.connect('/artifactdraft/delete/{artifactDraftID}', controller='artifactServiceManager', action='deleteArtifactDraftByID')
    map.connect('/artifactdraft/artifactDraftType={artifactDraftType}&artifactDraftHandle={artifactDraftHandle}', controller='artifactServiceManager', action='getArtifactDraftByTypeAndHandle')
    map.connect('/artifactdraft/artifactDraftArtifactRevisionID={artifactDraftArtifactRevisionID}', controller='artifactServiceManager', action='getArtifactDraftByArtifactRevisionID')
    map.connect('/artifactdraft/{artifactDraftID}', controller='artifactServiceManager', action='getArtifactDraftByID')
    map.connect('/artifactdrafts', controller='artifactServiceManager', action='getArtifactDrafts')

    #Modality (a property on artifactType) related
    map.connect('/featured-modals/domainHandleOrEncodedID={domainHandleOrEncodedID}', controller='modalityServiceManager', action='getFeaturedModalitiesForDomainHandleOrEncodedID')
    map.connect('/featured-modal-type-counts/domainHandleOrEncodedID={domainHandleOrEncodedID}', controller='modalityServiceManager', action='getFeaturedModalityTypeCountsForDomainHandleOrEncodedID')
    map.connect('/featured-modal-type-counts/collectionHandle={collectionHandle}&collectionCreatorID={collectionCreatorID}', controller='modalityServiceManager', action='getFeaturedModalityTypeCountsForCollectionHandleAndCreatorID')
    map.connect('/featured-modal-type-counts/collectionHandle={collectionHandle}', controller='modalityServiceManager', action='getFeaturedModalityTypeCountsForCollectionHandleAndCreatorID')
    map.connect('/featured-modal-type-counts', controller='modalityServiceManager', action='getFeaturedModalityTypeCountsForCollectionHandleAndCreatorID')

    ## Collection Nodes
    map.connect('/collection/concepts/{encodedIDs}', controller='mongo/collection', action='getConceptCollectionNodesForEID')

    #Artifact related (New APIs)
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}&artifactCreator={artifactCreator}&artifactRevisionNO={artifactRevisionNO}/descendant/{artifactDescendantIdentifier}', controller='artifactServiceManager', action='getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier')        
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}&artifactCreator={artifactCreator}&artifactRevisionNO={artifactRevisionNO}', controller='artifactServiceManager', action='getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier')
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}&artifactRevisionNO={artifactRevisionNO}/descendant/{artifactDescendantIdentifier}', controller='artifactServiceManager', action='getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier')    
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}&artifactRevisionNO={artifactRevisionNO}', controller='artifactServiceManager', action='getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier')    
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}&artifactCreator={artifactCreator}/descendant/{artifactDescendantIdentifier}', controller='artifactServiceManager', action='getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier')        
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}&artifactCreator={artifactCreator}', controller='artifactServiceManager', action='getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier')    
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}/descendant/{artifactDescendantIdentifier}', controller='artifactServiceManager', action='getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier')     
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}', controller='artifactServiceManager', action='getArtifactByTypeHandleCreatorRevisionNOAndDescendantIdentifier')    

    map.connect('/artifact/artifactRevisionID={artifactRevisionID}/descendant/{artifactDescendantIdentifier}', controller='artifactServiceManager', action='getArtifactByRevisionIDAndDescendantIdentifier')    
    map.connect('/artifact/artifactRevisionID={artifactRevisionID}', controller='artifactServiceManager', action='getArtifactByRevisionIDAndDescendantIdentifier')

    map.connect('/artifact/artifactID={artifactID}&artifactRevisionNO={artifactRevisionNO}/descendant/{artifactDescendantIdentifier}', controller='artifactServiceManager', action='getArtifactByIDRevisionNOAndDescendantIdentifier')         
    map.connect('/artifact/artifactID={artifactID}&artifactRevisionNO={artifactRevisionNO}', controller='artifactServiceManager', action='getArtifactByIDRevisionNOAndDescendantIdentifier')
    map.connect('/artifact/artifactID={artifactID}/descendant/{artifactDescendantIdentifier}', controller='artifactServiceManager', action='getArtifactByIDRevisionNOAndDescendantIdentifier')        
    map.connect('/artifact/artifactID={artifactID}', controller='artifactServiceManager', action='getArtifactByIDRevisionNOAndDescendantIdentifier')    
    

    #ArtifactFeedbacks related (New APIs)
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}&artifactCreator={artifactCreator}&artifactRevisionNO={artifactRevisionNO}/descendant/{artifactDescendantIdentifier}/feedbacks', controller='artifactServiceManager', action='getArtifactFeedbacksByTypeHandleCreatorRevisionNOAndDescendantIdentifier')
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}&artifactCreator={artifactCreator}/descendant/{artifactDescendantIdentifier}/feedbacks', controller='artifactServiceManager', action='getArtifactFeedbacksByTypeHandleCreatorRevisionNOAndDescendantIdentifier')        
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}&artifactCreator={artifactCreator}/feedbacks', controller='artifactServiceManager', action='getArtifactFeedbacksByTypeHandleCreatorRevisionNOAndDescendantIdentifier')
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}&artifactRevisionNO={artifactRevisionNO}/descendant/{artifactDescendantIdentifier}/feedbacks', controller='artifactServiceManager', action='getArtifactFeedbacksByTypeHandleCreatorRevisionNOAndDescendantIdentifier')
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}/descendant/{artifactDescendantIdentifier}/feedbacks', controller='artifactServiceManager', action='getArtifactFeedbacksByTypeHandleCreatorRevisionNOAndDescendantIdentifier')    
    map.connect('/artifact/artifactType={artifactType}&artifactHandle={artifactHandle}/feedbacks', controller='artifactServiceManager', action='getArtifactFeedbacksByTypeHandleCreatorRevisionNOAndDescendantIdentifier')    

    map.connect('/artifact/artifactRevisionID={artifactRevisionID}/descendant/{artifactDescendantIdentifier}/feedbacks', controller='artifactServiceManager', action='getArtifactFeedbacksByRevisionIDAndDescendantIdentifier')    
    map.connect('/artifact/artifactRevisionID={artifactRevisionID}/feedbacks', controller='artifactServiceManager', action='getArtifactFeedbacksByRevisionIDAndDescendantIdentifier')    

    map.connect('/artifact/artifactID={artifactID}&artifactRevisionNO={artifactRevisionNO}/descendant/{artifactDescendantIdentifier}/feedbacks', controller='artifactServiceManager', action='getArtifactFeedbacksByIDRevisionNOAndDescendantIdentifier')
    map.connect('/artifact/artifactID={artifactID}/descendant/{artifactDescendantIdentifier}/feedbacks', controller='artifactServiceManager', action='getArtifactFeedbacksByIDRevisionNOAndDescendantIdentifier')        
    map.connect('/artifact/artifactID={artifactID}/feedbacks', controller='artifactServiceManager', action='getArtifactFeedbacksByIDRevisionNOAndDescendantIdentifier')


    #
    # Trending Modalities related
    #
    map.connect('/analytics/get/trending/modalities', controller='mongo/trendingmodalities', action='getTrendingModalities')    

    #Member related
    map.connect('/analytics/member/last-read-modalities', controller='memberServiceManager', action='getLastReadModalities')
    map.connect('/analytics/member/last-read-concepts', controller='memberServiceManager', action='getLastReadConcepts')
    map.connect('/analytics/member/last-read-branches', controller='memberServiceManager', action='getLastReadBranches')
    map.connect('/analytics/member/last-read-subjects', controller='memberServiceManager', action='getLastReadSubjects')
    map.connect('/analytics/member/viewed-modalities', controller='memberServiceManager', action='getViewedModalities')
    map.connect('/analytics/member/viewed-subjects', controller='memberServiceManager', action='getViewedSubjects')
    map.connect('/analytics/member/viewed-branches', controller='memberServiceManager', action='getViewedBranches')
    map.connect('/analytics/member/last-read-standards', controller='memberServiceManager', action='getLastReadStandards')


    #Vistor related
    map.connect('/analytics/visitor/{visitorID}/last-read-modalities', controller='visitorServiceManager', action='getLastReadModalities')
    map.connect('/analytics/visitor/{visitorID}/last-read-concepts', controller='visitorServiceManager', action='getLastReadConcepts')
    map.connect('/analytics/visitor/{visitorID}/last-read-branches', controller='visitorServiceManager', action='getLastReadBranches')
    map.connect('/analytics/visitor/{visitorID}/last-read-subjects', controller='visitorServiceManager', action='getLastReadSubjects')

    #Artifact related
    map.connect('/analytics/artifact/visit-details', controller='artifactAnalyticsManager', action='getArtifactVisitDetails')
    
    #Partner related APIs
    map.connect('/partnerapp/{partnerAppName}/group/assignment/build', controller='partnerServiceManager', action='buildAssignment')    
    map.connect('/partnerapp/{partnerAppName}/group/member/enroll', controller='partnerServiceManager', action='enrollMembersInGroup')
    map.connect('/partnerapp/{partnerAppName}/group/{partnerGroupID}/assignment/{assignmentID}/progress', controller='partnerServiceManager', action='getAssignmentProgress')

    # auto standard related
    map.connect('/get/autoStandard/countries', controller='mongo/standard', action='getAutoStandardCountries')
    map.connect('/get/autoStandard/standards', controller='mongo/standard', action='getAutoStandardStandards')
    map.connect('/get/autoStandard/standardinfo', controller='mongo/standard', action='getAutoStandardStandardInfo')
    map.connect('/add/autoStandard/concept', controller='mongo/standard', action='addAutoStandardConcept')

    # Retrolation
    map.connect('/get/retrolation/{artifactID}', controller='mongo/retrolation', action='getRetrolation')

    # Ask CK-12
    map.connect('/askck12/get/modality', controller='askck12', action='askck12')

    ###################################

    # serve Owner Model as resource
    map.resource('owner', 'owners')

    hideInternal = str(config.get('hide_internal_apis')).lower() == 'true'
    development = str(config.get('deployment_target')).lower() == 'development'

    # CUSTOM ROUTES HERE
    # Domain can have an optional domain field as an additional level.

    #
    #  For development only.
    #
    if not hideInternal:
        if str(config.get('deployment_target')).lower() == 'development':
            map.connect('/search/visual/searchForm', controller='search', action='searchForm')
            map.connect('/import/wikiForm', controller='importer', action='wikiImportForm')
            map.connect('/import/userContentForm', controller='importer', action='userContentImportForm')
            map.connect('/import/conceptMapForm', controller='browseTerm', action='importConceptMapForm')
            map.connect('/export/xdtForm', controller='xdt', action='xdtExportForm')
            map.connect('/import/xdtForm', controller='xdt', action='xdtImportForm')
            map.connect('/import/gdtForm', controller='gdt', action='gdtImportForm')
            map.connect('/gdt2epub/gdt2ePubForm', controller='gdt2epub', action='gdt2ePubForm')
            map.connect('/create/resource/associationForm', controller='resource', action='createAssociationForm')
            map.connect('/create/attachmentForm', controller='resource', action='createAttachmentForm')
            map.connect('/create/customCoverForm', controller='resource', action='createCustomCoverForm')
            map.connect('/create/embeddedobjectproviderForm', controller='embeddedObject', action='createEmbeddedObjectProviderForm')
            map.connect('/create/embeddedobjectForm', controller='embeddedObject', action='createForm')
            map.connect('/create/embeddedobject/associationForm', controller='embeddedObject', action='createAssociationForm')
            #map.connect('/videohelperForm', controller='video', action='getInfoForm')
            #map.connect('/videohelper', controller='video', action='getInfo')
            map.connect('/create/abusereportForm', controller='resource', action='createAbuseReportForm')
            map.connect('/create/browseTermForm', controller='browseTerm', action='createForm')
            map.connect('/create/browseTermSynonymForm', controller='browseTerm', action='createSynonymForm')
            map.connect('/create/browseTerm/associationForm', controller='browseTerm', action='createAssociationForm')
            map.connect('/create/standardForm', controller='standard', action='createForm')
            map.connect('/create/standard/associationForm', controller='standard', action='createAssociationForm')
            map.connect('/create/favoriteForm', controller='favorite', action='createForm')
            map.connect('/create/featuredForm', controller='featured', action='createForm')
            map.connect('/create/feedbackForm', controller='feedback', action='createForm')
            map.connect('/create/artifactForm/{type}', controller='artifact', action='createArtifactForm')
            map.connect('/create/indexForm', controller='search', action='createIndexForm')
            map.connect('/create/reindexForm', controller='search', action='reindexForm')
            map.connect('/create/resourceForm', controller='resource', action='createResourceForm')
            map.connect('/delete/abusereportForm', controller='resource', action='deleteAbuseReportForm')
            map.connect('/delete/artifactForm/{id}', controller='artifact', action='deleteArtifactForm')
            map.connect('/delete/indexForm', controller='search', action='deleteIndexForm')
            map.connect('/delete/resource/associationForm', controller='resource', action='deleteAssociationForm')
            map.connect('/delete/resourceForm', controller='resource', action='deleteResourceForm')
            map.connect('/delete/standard/associationForm', controller='standard', action='deleteAssociationForm')
            map.connect('/delete/{type}/form/{id}', controller='artifact', action='deleteArtifactForm')
            map.connect('/update/abusereportForm/{id}', controller='resource', action='updateAbuseReportForm')
            map.connect('/update/resourceForm/{id}', controller='resource', action='updateResourceForm')
            map.connect('/update/indexForm', controller='search', action='reindexForm')
            map.connect('/update/featuredForm/{id}', controller='featured', action='updateForm')
            map.connect('/update/form/{id}', controller='artifact', action='updateArtifactForm')
            map.connect('/update/{type}/form/{id}', controller='artifact', action='updateArtifactForm')
            map.connect('/load/browseTermsForm', controller='browseTerm', action='loadBrowseTermsForm')
            map.connect('/load/foundationGridForm', controller='browseTerm', action='loadFoundationGridForm')
            map.connect('/load/standardsCorrelationForm', controller='standard', action='loadStandardsCorrelationForm')
            map.connect('/load/stateStandardsForm', controller='standard', action='loadStateStandardsForm')
            map.connect('/load/browseTermCandidatesForm', controller='browseTerm', action='loadBrowseTermCandidatesFromCSVForm')
            map.connect('/translator/xhtmltodocbook/xhtmltodocbookform',controller='translator',action='xhtmlToDocbookForm')
            map.connect('/translator/docbooktoxhtml/docbooktoxhtmlform',controller='translator',action='docbookToXhtmlForm')
            map.connect('/load/modalitiesForm', controller='modality', action='loadModalitiesForm')
            map.connect('/get/embeddedobject/thumbnail', controller='embeddedObject', action='getThumbnail')
            map.connect('/get/embeddedobject/thumbnailForm', controller='embeddedObject', action='getThumbnailForm')
            map.connect('/add/mylib/objectForm', controller='library', action='addToLibraryForm')
            map.connect('/remove/mylib/objectForm', controller='library', action='removeFromLibraryForm')
            map.connect('/load/vocabulariesForm', controller='vocabulary', action='loadVocabulariesForm')
            map.connect('/emails', controller='email', action='emailTemplatesForm')
            map.connect('/render/custom/template', controller='email', action='renderEmailTemplate', templateName=None)
            map.connect('/render/template/{templateName}', controller='email', action='renderEmailTemplate')
            map.connect('/send/email/preview', controller='email', action='sendPreviewEmail')


    ## Annotation related
    map.connect('/annotations', controller='annotator', action='create')
    map.connect('/annotations/{annotationID}', controller='annotator', action='multiPurpose')
    map.connect('/search/annotations', controller='annotator', action='search')
    map.connect('/migrated/annotations', controller='annotator', action='getMigrated')
    map.connect('/popularAnnotations', controller='annotator', action='getPopularAnnotations')


    map.connect('/get/info/my', controller='member', action='getInfo')
    map.connect('/get/detail/my', controller='member', action='getDetail')
    map.connect('/logout/member', controller='auth', action='logout')
    map.connect('/get/cookie/my', controller='auth', action='getLoginCookie')
    map.connect('/refresh/my', controller='member', action='updateMyInfo')
    map.connect('/search/standard/{artifactTypes}/{state}/{grade}/{subject}/{searchTerms:.*?}', controller='artifact', action='searchArtifactsByStandard')
    map.connect('/search/standard/{artifactTypes}/{state}/{grade}/{subject}', controller='artifact', action='searchArtifactsByStandard')
    map.connect('/search/standard/{artifactTypes}/{state}/{grade}', controller='artifact', action='searchArtifactsByStandard')
    map.connect('/search/standard/{artifactTypes}/{state}', controller='artifact', action='searchArtifactsByStandard')

    map.connect('/search/visual/{terms:.*?}', controller='search', action='searchVisual')

    map.connect('/search/my/pseudodomain/{terms:.*?}', controller='browseTerm', action='searchMemberPseudoDomainByName')

    map.connect('/search/custom/{fldsToSearch}/{fldsToReturn}/{terms:.*?}', controller='search', action='searchCustom')
    map.connect('/search/hints/{artifactTypes}/{field}/{term:.*?}', controller='search', action='autoSuggest')

    #Contribution Type
    map.connect('/create/artifactContributionType/{artifactID}/{typeName}', controller='artifact', action='createArtifactContributionType')

    if not hideInternal:
        map.connect('/search/wikipedia/{domain}/{searchTerm:.*?}', controller='artifact', action='searchWikipedia')
        map.connect('/search/wikipedia/{searchTerm:.*?}', controller='artifact', action='searchWikipedia')

    map.connect('/search/domain/{domain}/{searchTerm:.*?}', controller='artifact', action='searchDomain')
    map.connect('/search/domain/{searchTerm:.*?}', controller='artifact', action='searchDomain')

    map.connect('/get/status/task/{taskID}', controller='task', action='getStatus')
    map.connect('/get/usertask/{revisionID}/{taskName}', controller='task', action='getUserTask')

    if not hideInternal:
        map.connect('/get/info/tasks', controller='task', action='getTasksInfo')

        map.connect('/get/status/wikiImport/{taskId}', controller='importer', action='wikiImportStatus')
        map.connect('/import/wiki', controller='importer', action='wikiImport')
        map.connect('/import/userContent', controller='importer', action='userContentImport')
        map.connect('/import/conceptMap', controller='browseTerm', action='importConceptMap')

        map.connect('/export/xdt/{command}/{artifactID}/{revisionID}', controller='xdt', action='xdtExportArtifact')
        map.connect('/export/xdt/{command}/{artifactID}', controller='xdt', action='xdtExportArtifact', revisionID=None)
        map.connect('/export/xdt', controller='xdt', action='xdtExport')

        map.connect('/export/data/system', controller='migration', action='export', system=True, emails='')
        map.connect('/export/data/{emails}', controller='migration', action='export', system=False)
        map.connect('/export/data', controller='migration', action='export', system=False, emails='')

        map.connect('/import/xdt', controller='xdt', action='xdtImport')
        map.connect('/import/xdt/artifact', controller='xdt', action='xdtImportArtifact')

        map.connect('/import/gdt/artifact', controller='gdt', action='gdtImportArtifact')
        map.connect('/import/google/auth', controller='gdt', action='googleAuthToken')
        map.connect('/import/google/logout', controller='gdt', action='googleAuthLogout')
        map.connect('/get/documents/google', controller='gdt', action='listDocuments')
        map.connect('/get/folders/google', controller='gdt', action='listFolders')
        map.connect('/get/status/google/auth', controller='gdt', action='isGoogleDocAuthenticated')
        map.connect('/get/authURL/google', controller='gdt', action='googleAuthURL')

        map.connect('/gdt2epub/gdt/artifact', controller='gdt2epub', action='gdt2ePubConvert')
        map.connect('/gdt/generateRefreshToken', controller='gdt', action='generateRefreshToken')
        map.connect('/gdt/refreshToken', controller='gdt', action='refreshToken')


    map.connect('/get/version', controller='info', action='version')
    map.connect('/get/mylib/info/labels/{includeSystem}', controller='library', action='getLabels')
    map.connect('/get/mylib/info/labels', controller='library', action='getLabels')

    map.connect('/get/mylib/info/resources/{types}/{labels}', controller='library', action='getMyResourceInfo')
    map.connect('/get/mylib/info/resources/{types}', controller='library', action='getMyResourceInfo')
    map.connect('/get/mylib/info/resources', controller='library', action='getMyResourceInfo')

    map.connect('/get/mylib/info/{types}/{labels}', controller='library', action='getMyArtifactInfo')
    map.connect('/get/mylib/info/{types}', controller='library', action='getMyArtifactInfo')
    map.connect('/get/mylib/info', controller='library', action='getMyArtifactInfo')
    map.connect('/check/mylib/objects', controller='library', action='isInLibrary')

    #map.connect('/search/mylib/info/{types}/{searchTerm}', controller='artifact', action='searchMyArtifacts')
    #map.connect('/search/mylib/info/{types}', controller='artifact', action='searchMyArtifacts')
    map.connect('/search/mylib/info/{types}/{searchTerm}', controller='library', action='searchMyArtifacts')
    map.connect('/search/mylib/info/{types}', controller='library', action='searchMyArtifacts')
    
    map.connect('/get/featured/modalities/{types}/{encodedID:.*?}', controller='modality', action='getFeaturedArtifactsForEncodedID', rtype='info')
    
    map.connect('/search/modality/mylib/{rtype}/{types}/{searchTerm}', controller='library', action='searchMyModalities',
            requirements={'rtype':'info|minimal'})
    map.connect('/search/modality/{rtype}/{types}/{searchTerm:.*?}', controller='modality', action='searchModalities',
            requirements={'rtype':'info|minimal'})
    map.connect('/search/direct/modality/{rtype}/{types}/{searchTerm:.*?}', controller='modality', action='searchDirectModalities',
            requirements={'rtype':'info|minimal'})
    map.connect('/search/modality/{types}/{searchTerm:.*?}', controller='modality', action='searchModalities', rtype='info')
    map.connect('/search/group/{searchTerm:.*?}', controller='groups', action='searchGroups')
    map.connect('/search/{rtype}/{types}/{searchTerm:.*?}', controller='artifact', action='searchArtifacts',
            requirements={'rtype': 'info|minimal'})
    map.connect('/search/{types}/{searchTerm:.*?}', controller='artifact', action='searchArtifacts', rtype='info')

    map.connect('/sync/member/{id}', controller='member', action='sync')
    map.connect('/create/member/u13/{groupID}', controller='member', action='createU13InGroup')
    map.connect('/create/member', controller='member', action='create')
    map.connect('/delete/member/{id}', controller='member', action='delete')
    map.connect('/add/student', controller='member', action='addStudent')
    map.connect('/get/my/students', controller='member', action='getMyStudents')
    map.connect('/get/my/added/students', controller='member', action='getMyAddedStudents')

    map.connect('/activate/member/{id}', controller='member', action='activate')
    map.connect('/activate/member', controller='member', action='activate')
    map.connect('/deactivate/member/{id}', controller='member', action='deactivate')
    map.connect('/deactivate/member', controller='member', action='deactivate')
    map.connect('/disable/member/{id}', controller='member', action='disable')
    map.connect('/disable/member', controller='member', action='disable')

    if not hideInternal:
        map.connect('/set/member/notifications', controller='member', action='updateNotifications')
        map.connect('/create/member/notifications', controller='member', action='createNotifications')
        map.connect('/get/member/notifications', controller='member', action='getNotifications')
        map.connect('/get/subscribers/newsletter', controller='member', action='getNewsletterSubscribers')
        map.connect('/set/member/grades', controller='member', action='addMemberGrades')
        map.connect('/get/member/grades', controller='member', action='getGradesByMember')
        map.connect('/set/member/subjects', controller='member', action='addMemberSubjects')
        map.connect('/get/member/subjects', controller='member', action='getSubjectsByMember')

    map.connect('/get/ip/location', controller='mongo/iplocation', action='getIPLocation')
    map.connect('/get/members/{gradeID}', controller='member', action='getMembersByGrade')
    map.connect('/get/member/roles', controller='member', action='getMemberRoles')
    map.connect('/get/member/groups/{id}', controller='member', action='getMemberGroups')
    map.connect('/get/member/groups', controller='member', action='getMemberGroups')
    map.connect('/get/member/favorites/{type}/{id}', controller='member', action='getFavorites')
    map.connect('/get/member/favorites/{type}', controller='member', action='getFavorites')
    map.connect('/get/member/viewed/{type}/{id}', controller='member', action='getViewedArtifacts')
    map.connect('/get/member/viewed/{type}', controller='member', action='getViewedArtifacts')
    map.connect('/get/member/{id}', controller='member', action='get')
    map.connect('/get/member/auth/{id}', controller='member', action='getMemberByAuthID')
    map.connect('/get/member', controller='member', action='get')
    map.connect('/update/member/accesstime/{objectType}', controller='member', action='updateMemberAccessTime')
    map.connect('/restrict/member/access/{objectType}', controller='member', action='restrictMemberAccess')
    map.connect('/get/restricted/members', controller='member', action='getRestrictedMembers')
    map.connect('/get/info/browseTerm/{id}', controller='browseTerm', action='get')
    map.connect('/get/info/tagTerm/{id}', controller='tagTerm', action='get')
    map.connect('/get/info/member/tagTerms', controller='tagTerm', action='getTagTermsByMemberID')
    map.connect('/get/info/searchTerm/{id}', controller='searchTerm', action='get')
    map.connect('/get/info/browseTerms', controller='browseTerm', action='getBrowseTermsByEIDs')
    map.connect('/get/info/domain/{subject}/{branch}/{name}', controller='browseTerm', action='getDomainByName')
    map.connect('/get/info/domain/{handle}', controller='browseTerm', action='getDomain')
    map.connect('/get/info/browseTermAncestors/{id}', controller='browseTerm', action='getAncestors')
    map.connect('/get/info/browseTermSynonyms/{id}', controller='browseTerm', action='getSynonyms', forceID='0')
    map.connect('/get/info/browseTermSynonyms/{id}/{forceID}', controller='browseTerm', action='getSynonyms')
    map.connect('/get/info/browseTerm/descendants/{id}/{levels}', controller='browseTerm', action='getDescendants')
    map.connect('/get/info/browseTerm/descendents/{id}/{levels}', controller='browseTerm', action='getDescendants')
    map.connect('/get/info/browseTerm/descendants/{id}', controller='browseTerm', action='getDescendants')
    map.connect('/get/info/browseTerm/descendents/{id}', controller='browseTerm', action='getDescendants')
    map.connect('/get/neighbor/{id}', controller='browseTerm', action='getNeighbor')
    map.connect('/get/info/subjects', controller='subject', action='getSubjects')
    map.connect('/get/info/languages', controller='language', action='getLanguages')

    if not hideInternal:
        map.connect('/get/map/{id}', controller='artifact', action='getArtifactMap', type='artifact', levels=1)
        map.connect('/get/map/{id}/{levels}', controller='artifact', action='getArtifactMap', levels=1)
        map.connect('/get/map/{id}/{type}/{levels}', controller='artifact', action='getArtifactMap')

    map.connect('/get/latest/{type}', controller='artifact', action='getLatest')
    map.connect('/get/latest', controller='artifact', action='getLatest')
    map.connect('/get/popular/{type}', controller='artifact', action='getPopular')
    map.connect('/get/popular', controller='artifact', action='getPopular')

    map.connect('/get/info/standard/subjects/{standardBoardIDs}/{grades}', controller='standard', action='getStandardSubjects')
    map.connect('/get/info/standard/subjects/{standardBoardIDs}', controller='standard', action='getStandardSubjects')
    map.connect('/get/info/standard/subjects', controller='standard', action='getStandardSubjects')
    map.connect('/get/info/standard/standardboards/{subjects}/{grades}', controller='standard', action='getStandardStandardBoards')
    map.connect('/get/info/standard/standardboards/{subjects}', controller='standard', action='getStandardStandardBoards')
    map.connect('/get/info/standard/standardboards', controller='standard', action='getStandardStandardBoards')
    map.connect('/get/info/standard/grades/{subjects}/{standardBoardIDs}', controller='standard', action='getStandardGrades')
    map.connect('/get/info/standard/grades/{subjects}', controller='standard', action='getStandardGrades')
    map.connect('/get/info/standard/grades', controller='standard', action='getStandardGrades')

    map.connect('/get/info/standardboards/correlated/artifact/{artifactID}/{artifactRevisionID}', controller='standard', action='getCorrelatedStandardBoardsForArtifact')
    map.connect('/get/info/standardboards/correlated/artifact/{artifactID}', controller='standard', action='getCorrelatedStandardBoardsForArtifact')
    map.connect('/get/standard/correlations/{standardBoardID}/{artifactID}/{artifactRevisionID}', controller='standard', action='getCorrelations')
    map.connect('/get/standard/correlations/{standardBoardID}/{artifactID}', controller='standard', action='getCorrelations')
    map.connect('/get/info/standard/{id}', controller='standard', action='getInfo')
    map.connect('/get/info/standard/{state}/{subject}/{section}', controller='standard', action='getStandardInfo')
    map.connect('/browse/standards', controller='standard', action='browseStandards')
    map.connect('/get/standards', controller='mongo/standard', action='getStandards')
    map.connect('/get/standardalignments', controller='mongo/standard', action='getStandardAlignments')
    map.connect('/get/branch/standards', controller='mongo/standard', action='getStandardsForBranchOrSubject')
    map.connect('/get/subject/standards', controller='mongo/standard', action='getStandardsForBranchOrSubject')
    map.connect('/rebuild/cache/concepts', controller='mongo/conceptnode', action='rebuildCache')

     # Url Mappings related
    map.connect('/create/urlmap', controller='mongo/urlmapping', action='createUrlMap')
    map.connect('/update/urlmap', controller='mongo/urlmapping', action='updateUrlMap')
    map.connect('/delete/urlmap', controller='mongo/urlmapping', action='deleteUrlMap')
    map.connect('/get/info/urlmap', controller='mongo/urlmapping', action='getUrlMapInfo')
    map.connect('/browse/info/urlmaps', controller='mongo/urlmapping', action='browseInfoUrlMaps')

    map.connect('/get/info/subjects/correlated', controller='standard', action='getSubjectsWithCorrelations')
    map.connect('/get/info/subjects/correlated/{standardBoardID}', controller='standard', action='getSubjectsWithCorrelations')
    map.connect('/get/info/subjects/correlated/{standardBoardID}/{gradeID}', controller='standard', action='getSubjectsWithCorrelations')
    map.connect('/get/info/grades/correlated/{subject}/{standardBoardID}', controller='standard', action='getGradesWithCorrelations')
    map.connect('/get/info/grades/correlated/{subject}', controller='standard', action='getGradesWithCorrelations')
    map.connect('/get/info/grades/correlated', controller='standard', action='getGradesWithCorrelations')
    map.connect('/get/info/grades/correlated_alternate/{subject}/{standardBoardID}', controller='standard', action='getAlternateGradesWithCorrelations')
    map.connect('/get/info/standardboards/correlated/{subject}/{grade}', controller='standard', action='getStandardBoardsWithCorrelations')
    map.connect('/get/info/standardboards/correlated/{subject}', controller='standard', action='getStandardBoardsWithCorrelations')
    map.connect('/get/info/standardboards/correlated', controller='standard', action='getStandardBoardsWithCorrelations')
    map.connect('/get/info/standardboards', controller='standard', action='getStandardBoards')
    map.connect('/get/info/standardboarddata', controller='standard', action='getStandardBoardData')
    map.connect('/get/info/standards/correlated/{standardBoardID}', controller='standard', action='getCorrelatedStandardsForDomain')

    map.connect('/get/info/countries', controller='location', action='getCountries')
    map.connect('/get/info/country/{id}', controller='location', action='getCountryInfo')
    map.connect('/get/info/states', controller='location', action='getStates')
    map.connect('/get/info/state/{id}', controller='location', action='getStateInfo')
    map.connect('/get/info/resource/checksum/{checksum}', controller='resource', action='getResourceByChecksum')
    map.connect('/get/info/resource/{type}/{id}/{revisionID}', controller='resource', action='getInfo')
    map.connect('/get/info/resource/{type}/{id}', controller='resource', action='getInfo')
    map.connect('/get/info/resource/{id}/{revisionID}', controller='resource', action='getInfo')
    map.connect('/get/info/resource/{id}', controller='resource', action='getInfo')

    map.connect('/get/info/resources/{types}', controller='resource', action='getResourcesInfo')

    if not hideInternal:
        map.connect('/get/info/eventtype/{typeName}', controller='notification', action='getEventTypeByName')
        map.connect('/get/info/eventtypes', controller='notification', action='getEventTypes')
        map.connect('/get/info/notificationrules', controller='notification', action='getNotificationRules')
        map.connect('/get/info/events', controller='notification', action='getEvents')
        map.connect('/get/info/notifications', controller='notification', action='getNotifications')

        map.connect('/get/info/notification/{eventType}/{frequency}/{address}', controller='notification', action='getMyNotification')
        map.connect('/get/info/notification/{eventType}/{frequency}', controller='notification', action='getMyNotification')
        map.connect('/get/info/notification/{id:[0-9]*?}', controller='notification', action='getInfo')

        map.connect('/get/info/embeddedobjectProviders', controller='embeddedObject', action='getEmbeddedObjectProvidersInfo')

    map.connect('/get/maintenance/notification', controller='notification', action='getMaintenanceNotification')
    map.connect('/get/maintenance/notification/{id}', controller='notification', action='getMaintenanceNotification')
    map.connect('/update/maintenance/notification', controller='notification', action='updateMaintenanceNotification')
    map.connect('/get/info/embeddedobjects/{ids}', controller='embeddedObject', action='getInfoMulti') 
    map.connect('/get/info/embeddedobject/{width:[0-9]*?}/{height:[0-9]*?}/{url:.*?}', controller='embeddedObject', action='getInfo')
    map.connect('/get/info/embeddedobject/{url:.*?}', controller='embeddedObject', action='getInfo')
    map.connect('/get/info/embeddedobject', controller='embeddedObject', action='getInfo') ## POST method for embed code

    if not hideInternal:
        map.connect('/get/info/abusereport/{id}', controller='resource', action='getInfoAbuseReport')
        map.connect('/get/info/issue/{id}', controller='resource', action='getInfoAbuseReport')
        map.connect('/get/info/abusereports/{resourceRevisionID}/{status}', controller='resource', action='getAbuseReportInfoForResourceRevision')
        map.connect('/get/info/issues/{resourceRevisionID}/{status}', controller='resource', action='getAbuseReportInfoForResourceRevision')
        map.connect('/get/info/abusereports/artifact/{artifactID}/{status}', controller='resource', action='getAbuseReportInfoForArtifact')
        map.connect('/get/info/issues/artifact/{artifactID}/{status}', controller='resource', action='getAbuseReportInfoForArtifact')
        map.connect('/get/info/abusereports/{resourceRevisionID}', controller='resource', action='getAbuseReportInfoForResourceRevision')
        map.connect('/get/info/issues/{resourceRevisionID}', controller='resource', action='getAbuseReportInfoForResourceRevision')
        map.connect('/get/info/abusereports/artifact/{artifactID}', controller='resource', action='getAbuseReportInfoForArtifact')
        map.connect('/get/info/issues/artifact/{artifactID}', controller='resource', action='getAbuseReportInfoForArtifact')
        map.connect('/get/info/abusereports', controller='resource', action='listAbuseReports')
        map.connect('/get/info/issues', controller='resource', action='listAbuseReports')
        map.connect('/get/info/abuse/reasons', controller='resource', action='getAbuseReasons')
        map.connect('/get/info/issue/reasons', controller='resource', action='getAbuseReasons')
    
    #RWE related
    map.connect('/create/rwe', controller='rwe', action='createRWE')
    map.connect('/update/rwe', controller='rwe', action='updateRWE')
    map.connect('/delete/rwe/{id}', controller='rwe', action='deleteRWE')
    map.connect('/get/info/rwe', controller='rwe', action='getRWE')
    
    ## Retrolation
    map.connect('/get/retrolation/domain/{domainEID}', controller='retrolation', action='getRetrolationByDomainEID')
    map.connect('/get/retrolation/section/{sectionEID}', controller='retrolation', action='getRetrolationBySectionEID')
    map.connect('/load/retrolations', controller='retrolation', action='loadRetrolations')


    ## Modalities
    map.connect('/get/{rtype}/modalities/{type}/{handle:.*?}/{realm:[^/]*?:[^/]*?}', controller='modality', action='getModalitiesByPerma',
            requirements={'type':'lesson|section|concept|domain', 'rtype':'info|minimal'})
    map.connect('/get/{rtype}/modalities/{type}/{handle:.*?}', controller='modality', action='getModalitiesByPerma',
            requirements={'type':'lesson|section|concept|domain', 'rtype':'info|minimal'})
    map.connect('/get/{rtype}/modalities/{level}/{sub}/{brn}/{term}', controller='modality', action='getModalitiesByDomainName',
            requirements={'level':'basic|at-grade|at grade|advanced', 'rtype':'info|minimal'})
    map.connect('/get/{rtype}/modalities/{sub}/{brn}/{term}', controller='modality', action='getModalitiesByDomainName',
            requirements={'rtype':'info|minimal'})
    map.connect('/get/{rtype}/modalities/{level}/{eid}', controller='modality', action='getModalities',
            requirements={'level':'basic|at-grade|at grade|advanced', 'rtype':'info|minimal'})
    map.connect('/get/{rtype}/modalities/{eid}', controller='modality', action='getModalities', level=None,
            requirements={'rtype':'info|minimal'})

    ## Vocabularies
    map.connect('/get/info/vocabulary/{term:.*?}', controller='vocabulary', action='getVocabulariesByTerm')
    map.connect('/get/info/vocabularies/{eid}', controller='vocabulary', action='getVocabularies', languageCode=None)
    map.connect('/get/info/vocabularies/{eid}/{languageCode}', controller='vocabulary', action='getVocabularies')
    map.connect('/get/perma/info/vocabulary/{type}/{handle:.*?}/{realm:[^/]*?:[^/]*?}', controller='perma', action='getVocabularyInfo')
    map.connect('/get/perma/info/vocabulary/{type}/{handle:.*?}', controller='perma', action='getVocabularyInfo')

    map.connect('/get/info/artifactTypes', controller='artifact', action='getArtifactTypes')

    ## Extended artifacts
    map.connect('/get/perma/info/extended/{type}/{handle:.*?}/{realm:[^/]*?:[^/]*?}/{artifactTypes}', controller='perma', action='getExtendedArtifacts')
    map.connect('/get/perma/info/extended/{type}/{handle:.*?}/{artifactTypes}', controller='perma', action='getExtendedArtifacts')
    map.connect('/get/info/extended/{type}/{id}/{artifactTypes}', controller='artifact', action='getExtendedArtifacts')
    map.connect('/get/info/extended/{id}/{artifactTypes}', controller='artifact', action='getExtendedArtifacts')

    ## Resources for artifact
    map.connect('/get/url/status',controller="artifact", action='validateBookmarkURL'),
    map.connect('/get/perma/info/resources/{type}/{handle:.*?}/{realm:[^/]*?:[^/]*?}/{resourceTypes}', controller='perma', action='getResourcesInfo')
    map.connect('/get/perma/info/resources/{type}/{handle:.*?}/{resourceTypes}', controller='perma', action='getResourcesInfo')
    map.connect('/get/info/artifact/resources/{type}/{id}/{revisionID}/{resourceTypes}', controller='artifact', action='getResourcesInfo')
    map.connect('/get/info/artifact/resources/{id}/{revisionID}/{resourceTypes}', controller='artifact', action='getResourcesInfo')
    map.connect('/get/info/artifact/resources/{id}/{resourceTypes}', controller='artifact', action='getResourcesInfo')

    ## Derived from artifact
    map.connect('/get/info/artifact/derived/{id}', controller='artifact', action='getDerivedArtifactInfo')

    ## Revisions for artifact
    map.connect('/get/info/artifact/revisions/{id}/{order}', controller='artifact', action='getRevisionListInfoOfArtifact')
    map.connect('/get/info/artifact/revisions/{id}', controller='artifact', action='getRevisionListInfoOfArtifact', order='desc')
    map.connect('/get/info/artifacts/{ids}', controller='artifact', action='getArtifactListInfo')
    map.connect('/get/info/artifacts', controller='artifact', action='getArtifactListInfo')
    map.connect('/get/info/ugc/artifacts', controller='artifact', action='getUGCArtifactCountInfo')
    map.connect('/get/info/revisions/{ids}', controller='artifact', action='getRevisionListInfo')
    map.connect('/get/info/{type}/standard/{state}/{id}', controller='standard', action='getArtifactInfo')

    map.connect('/get/detail/revision/mathjax/{id}', controller='artifact', action='getRevisionMathjaxDetail')
    map.connect('/get/detail/revision/{id}', controller='artifact', action='getRevisionDetail')
    map.connect('/get/detail/mathjax/{type}/{id}', controller='artifact', action='getMathjaxDetail')
    map.connect('/get/detail/mathjax/{id}', controller='artifact', action='getMathjaxDetail')
    map.connect('/get/{rtype}/featured/{types}/{term}', controller='featured', action='getFeaturedArtifactsByTag',
            requirements={'rtype':'detail|info|minimal'})
    map.connect('/get/featured/{type}', controller='featured', action='get')
    map.connect('/get/featured', controller='featured', action='get')
 
    ## Old artifact handles
    map.connect('/get/handles/artifact/{id}', controller='artifact', action='getArtifactHandles')
    map.connect('/get/handles/{handle}', controller='artifact', action='getArtifactHandles')

    map.connect('/check/{type}/handle/{handle}', controller='artifact', action='checkArtifactHandle')
    map.connect('/check/handle/{handle}', controller='artifact', action='checkArtifactHandle', type='artifact')

    map.connect('/get/detail/{type}/standard/{state}/{id}', controller='standard', action='getArtifactDetail')

    map.connect('/get/related/{type}/{id}', controller='artifact', action='getRelatedArtifacts')
    map.connect('/get/related/{id}', controller='artifact', action='getRelatedArtifacts', type='artifact')
    
    ## Course related
    map.connect('/create/course', controller='course', action='createCourse')
    map.connect('/get/course/{course}', controller='course', action='getCourse')
    map.connect('/get/info/courses', controller='course', action='getInfoCourses')
    map.connect('/delete/course', controller='course', action='deleteCourse')
    map.connect('/update/course', controller='course', action='updateCourse')
    map.connect('/create/artifactCourse', controller='course', action='createArtifactCourse')
    map.connect('/load/courseArtifact', controller='course', action='loadCourseArtifact')

    ##Feedback related
    map.connect('/get/artifactfeedbackreviewdetails', controller='feedback', action='getArtifactFeedbackDetails')
    
    map.connect('/get/feedback/comments/{artifactID:[0-9]*}', controller='feedback', action='getArtifactComments')
    map.connect('/get/feedback/{artifactIDList}', controller='feedback', action='getArtifactsFeedbacks')
    map.connect('/get/myfeedback/{artifactID}', controller='feedback', action='getArtifactFeedbacksByMember')
    map.connect('/get/feedbackreviews', controller='feedback', action='getFeedbackReviews')
    map.connect('/get/abused/feedback', controller='feedback', action='getArtifactAbusedComments')
    map.connect('/get/allfeedbacks/member', controller='feedback', action='getFeedbacksByMember')

    map.connect('/delete/feedback/{artifactID}', controller='feedback', action='deleteAllFeedbackForArtifact')
    map.connect('/delete/myfeedback/{artifactID}', controller='feedback', action='deleteArtifactFeedbackByMember')
    map.connect('/delete/allmyfeedback', controller='feedback', action='deleteAllArtifactFeedbackByMember')
    map.connect('/delete/feedbackreview', controller='feedback', action='deleteFeedbackReview')
    map.connect('/delete/feedbackhelpful', controller='feedback', action='deleteFeedbackHelpful')

    map.connect('/get/rwa', controller='feedback', action='getRWA')
    map.connect('/get/rwas', controller='feedback', action='getRWAs')

    map.connect('/get/perma/resource/info/{stream}/{type:[ a-zA-Z0-9]*?}/{realm:[^/]*?:[^/]*?}/{handle:.*?}', controller='resource', action='getPerma',
            requirements={'stream':'default|DEFAULT|thumb_small|THUMB_SMALL|thumb_large|THUMB_LARGE|thumb_postcard|THUMB_POSTCARD|autoplay'})
    map.connect('/get/perma/resource/info/{stream}/{type:[ a-zA-Z0-9]*?}/{handle:.*?}', controller='resource', action='getPerma',
            requirements={'stream':'default|DEFAULT|thumb_small|THUMB_SMALL|thumb_large|THUMB_LARGE|thumb_postcard|THUMB_POSTCARD|autoplay'})
    map.connect('/get/perma/resource/info/{type:[ a-zA-Z0-9]*?}/{realm:[^/]*?:[^/]*?}/{handle:.*?}', controller='resource', action='getPerma')
    map.connect('/get/perma/resource/info/{type:[ a-zA-Z0-9]*?}/{handle:.*?}', controller='resource', action='getPerma')

    map.connect('/render/perma/resource/{stream}/{type:[ a-zA-Z0-9]*?}/{realm:[^/]*?:[^/]*?}/{handle:.*?}', controller='resource', action='renderPerma',
            requirements={'stream':'default|DEFAULT|thumb_small|THUMB_SMALL|thumb_large|THUMB_LARGE|thumb_postcard|THUMB_POSTCARD|autoplay'})
    map.connect('/render/perma/resource/{stream}/{type:[ a-zA-Z0-9]*?}/{handle:.*?}', controller='resource', action='renderPerma',
            requirements={'stream':'default|DEFAULT|thumb_small|THUMB_SMALL|thumb_large|THUMB_LARGE|thumb_postcard|THUMB_POSTCARD|autoplay'})
    map.connect('/render/perma/resource/{type:[ a-zA-Z0-9]*?}/{realm:[^/]*?:[^/]*?}/{handle:.*?}', controller='resource', action='renderPerma')
    map.connect('/render/perma/resource/{type:[ a-zA-Z0-9]*?}/{handle:.*?}', controller='resource', action='renderPerma')

    map.connect('/get/perma/info/{type}/{handle:.*?}/{realm}', controller='perma', action='get', infoOnly=True)
    map.connect('/get/perma/info/{type}/{handle:.*?}', controller='perma', action='get', infoOnly=True)
    map.connect('/get/perma/parent/{type}/{handle:.*?}/{realm}', controller='perma', action='getParent')
    map.connect('/get/perma/parent/{type}/{handle:.*?}', controller='perma', action='getParent')
    map.connect('/get/perma/descendant/{rtype}/{type}/{handle:.*?}/{realm}', controller='perma', action='getDescendant',
            requirements={'rtype':'detail|info|minimal'})
    map.connect('/get/perma/descendant/{rtype}/{type}/{handle:.*?}', controller='perma', action='getDescendant', 
            requirements={'rtype':'detail|info|minimal'})
    map.connect('/get/perma/descendant/{type}/{handle:.*?}/{realm}', controller='perma', action='getDescendant', rtype='detail')
    map.connect('/get/perma/descendant/{type}/{handle:.*?}', controller='perma', action='getDescendant', rtype='detail')
    map.connect('/get/perma/modality/{rtype}/{type}/{handle:.*?}/{realm:[^/]*?:[^/]*?}/{eid}', controller='modality', action='get',
            requirements={'rtype':'detail|info|minimal'})
    map.connect('/get/perma/modality/{rtype}/{type}/{handle:.*?}/{eid}', controller='modality', action='get',
            requirements={'rtype':'detail|info|minimal'})
    map.connect('/get/perma/modality/{type}/{handle:.*?}/{realm:[^/]*?:[^/]*?}/{eid}', controller='modality', action='get')
    map.connect('/get/perma/modality/{type}/{handle:.*?}/{eid}', controller='modality', action='get')
    map.connect('/get/perma/{type}/{handle:.*?}/{realm}', controller='perma', action='get')
    map.connect('/get/perma/{type}/{handle:.*?}', controller='perma', action='get')

    """
    Assignment and Dashboard related
    """
    map.connect('/create/assignment', controller='assignment', action='createStudyTrack')
    map.connect('/get/my/counts', controller='assignment', action='getCounts')
    map.connect('/get/my/assignments', controller='assignment', action='getMyAssignments', detailed=True)
    map.connect('/get/my/assignment/{id}', controller='assignment', action='getMyAssignment', detailed=True)
    map.connect('/get/my/selfStudies', controller='assignment', action='getMySelfStudies', detailed=True)
    map.connect('/get/my/assigned/modalities/{eid}', controller='assignment', action='getMyAssignedModalities')
    map.connect('/get/my/{subjectEID}/groups', controller='assignment', action='getMyAssignedGroups')
    map.connect('/update/assignment/{id}', controller='assignment', action='update')
    map.connect('/update/my/assignment/status', controller='assignment', action='updateConceptNodeStatus')
    map.connect('/update/my/{appID}/assignment/status', controller='assignment', action='updateLMSConceptNodeStatus')
    map.connect('/assign/assignment/{assignmentID}/{groupID}', controller='assignment', action='assignAssignmentToGroupMembers')
    map.connect('/assign/assignment/{groupID}', controller='assignment', action='assignAssignmentToGroupMembers')
    map.connect('/unassign/assignment/{id}', controller='assignment', action='delete', deleteStudyTrack=False)
    map.connect('/delete/assignment/{id}', controller='assignment', action='delete', deleteStudyTrack=True)
    map.connect('/delete/all/assignments/{id}', controller='assignment', action='deleteAll')
    map.connect('/get/my/group/assignments/{groupID}', controller='assignment', action='getGroupAssignments')
    map.connect('/get/all/assignments', controller='assignment', action='getAllAssignments')
    map.connect('/delete/lmsprovider/assignment/{id}', controller='assignment', action='deleteLMSProviderAssignment')
    map.connect('/get/group/member/assignments/{groupID}', controller='assignment', action='groupMemberAssignments', assignmentType='assignment', detailed=True)
    map.connect('/get/group/assignments/report/{groupID}', controller='assignment', action='getGroupAssignmentsReport')
    map.connect('/get/group/members/assignments/report/{groupID}', controller='assignment', action='getMembersGroupAssignmentsReport')
    map.connect('/get/assignment/{id}', controller='assignment', action='get')
    map.connect('/get/incomplete/assignments', controller='assignment', action='getIncompleteAssignments')
    map.connect('/count/my/studytracks', controller='assignment', action='countMyStudyTracks')

    """
    Google Classroom related
    """
    map.connect('/get/status/googleclassroom/auth', controller='googleClassroom', action='isGoogleClassroomAuthenticated')
    map.connect('/get/authURL/googleclassroom', controller='googleClassroom', action='googleAuthURL')
    map.connect('/get/courses/googleclassroom', controller='googleClassroom', action='listCourses')
    map.connect('/token/googleclassroom/auth', controller='googleClassroom', action='googleAuthToken')

    if not hideInternal:
        map.connect('/browse/adv/{type}/{browseTerms:.*}', controller='artifact', action='browseArtifactInfoByTermGridPaginated')
        map.connect('/browse/adv/{browseTerms:.*}', controller='artifact', action='browseArtifactInfoByTermGridPaginated')

    map.connect('/browse/modality/summary/{types}/{brn}', controller='modality', action='browseModalitiesSummary')
    map.connect('/browse/modality/{types}/{eid}/{all}', controller='modality', action='browseModalities')
    map.connect('/browse/modality/{types}/{eid}', controller='modality', action='browseModalities')

    map.connect('/browse/category/{type}/{id}/{all}', controller='browseTerm', action='browseArtifacts')
    map.connect('/browse/category/{type}/{id}', controller='browseTerm', action='browseArtifacts')
    map.connect('/browse/category/{id}', controller='browseTerm', action='browseArtifacts')
    map.connect('/browse/subject/{types}/{browseTerm:.*?}/{all}', controller='artifact', action='browseArtifactInfoBySubject')
    map.connect('/browse/subject/{types}/{browseTerm:.*?}', controller='artifact', action='browseArtifactInfoBySubject')
    map.connect('/browse/subject/{browseTerm:.*?}', controller='artifact', action='browseArtifactInfoBySubject')
    map.connect('/browse/{rtype}/{types}/{browseTerm:.*?}', controller='artifact', action='browseArtifactInfoPaginated',
            requirements={'rtype':'info|minimal'})
    map.connect('/browse/{types}/{browseTerm:.*?}', controller='artifact', action='browseArtifactInfoPaginated')
    map.connect('/browse/{browseTerm:.*?}', controller='artifact', action='browseArtifactInfoPaginated', type='artifact')

    ## School Artifacts related
    map.connect('/get/schools', controller='mongo/schoolartifacts', action='getSchools')
    map.connect('/get/schools_by_attributes', controller='mongo/schoolartifacts', action='getSchoolsByAttributes')
    map.connect('/get/school/counts', controller='mongo/schoolartifacts', action='getSchoolCounts')
    map.connect('/get/school/artifacts', controller='mongo/schoolartifacts', action='getSchoolArtifacts')
    map.connect('/add/school/artifacts', controller='mongo/schoolartifacts', action='addSchoolArtifact')
    map.connect('/update/school/artifacts', controller='mongo/schoolartifacts', action='updateSchoolArtifact')
    map.connect('/delete/school/artifacts', controller='mongo/schoolartifacts', action='deleteSchoolArtifact')
    map.connect('/create/school', controller='mongo/schoolartifacts', action='createSchool')
    map.connect('/update/school', controller='mongo/schoolartifacts', action='updateSchool')
    map.connect('/get/school/claim', controller='mongo/schoolartifacts', action='getSchoolClaim')
    map.connect('/get/school/claims', controller='mongo/schoolartifacts', action='getSchoolClaims')    
    map.connect('/add/school/claim', controller='mongo/schoolartifacts', action='addSchoolClaim')
    map.connect('/update/school/claim', controller='mongo/schoolartifacts', action='updateSchoolClaim')
    map.connect('/delete/school/claim', controller='mongo/schoolartifacts', action='deleteSchoolClaim')
    map.connect('/delete/school', controller='mongo/schoolartifacts', action='deleteSchool')
    map.connect('/restore/school', controller='mongo/schoolartifacts', action='restoreSchool')        

    #Groups Related
    if not hideInternal:
        map.connect('/group/info/{id}', controller='groups', action='getGroupByID')
        map.connect('/group/info', controller='groups', action='get')
        map.connect('/groups/all', controller='groups', action='getAll')
        map.connect('/forums/all', controller='groups', action='getAllForums')
        map.connect('/group/my', controller='groups', action='getmy')
        map.connect('/create/group', controller='groups', action='create')
        map.connect('/update/group', controller='groups', action='update')
        map.connect('/delete/group', controller='groups', action='delete')
        map.connect('/group/add/members', controller='groups', action='addMembersToGroup')
        map.connect('/group/add/member', controller='groups', action='addMemberToGroup')
        map.connect('/group/add/member/{appID}', controller='groups', action='addLMSMemberToGroup')
        map.connect('/group/delete/member', controller='groups', action='deleteMemberFromGroup')
        map.connect('/group/activate/member', controller='groups', action='activate')
        map.connect('/group/decline/member', controller='groups', action='decline')
        map.connect('/group/details', controller='groups', action='details')
        map.connect('/group/share', controller='groups', action='share')
        map.connect('/group/members', controller='groups', action='members')
        map.connect('/group/member/counts', controller='groups', action='memberCounts')
        map.connect('/group/activity', controller='groups', action='activity')
        map.connect('/group/unshare/{groupID}/{activityID}', controller='groups', action='unshare')
        map.connect('/group/add/activity', controller='groups', action='addGroupActivity')
        map.connect('/group/delete/activity', controller='groups', action='deleteGroupActivity')
        map.connect('/update/activity/status/{activityIDs}', controller='groups', action='updateMemberActivityStatus')
        map.connect('/group/set/qastatus', controller='groups', action='updateGroupQAstatus')
        map.connect('/group/{groupID}/member/{memberID}/update/scores', controller='groups', action='retrieveScores')
        map.connect('/group/{groupID}/update/scores', controller='groups', action='retrieveScores')

    #
    #  Group Editing Related
    #
    map.connect('/create/editing/group/{bookID}', controller='groups', action='createEditingGroup')
    map.connect('/delete/editing/group/{bookID}', controller='groups', action='delete')
    map.connect('/get/editing/group/assignments', controller='artifact', action='getGroupEditingAssignments')
    map.connect('/get/editing/group/assignments/of/{bookID}', controller='artifact', action='getGroupEditingAssignments')
    map.connect('/get/editing/group/{bookID}', controller='groups', action='getEditingGroup')
    map.connect('/get/editing/drafts/for/{bookID}', controller='artifact', action='getEditingDrafts')
    map.connect('/switch/{bookID}/editing/{state}', controller='groups', action='update', requirements={'state':'on|off'})
    map.connect('/assign/editing/{artifactID}/of/{bookID}', controller='artifact', action='assignGroupEditing', assigneeID=None)
    map.connect('/assign/editing/{artifactID}/of/{bookID}/to/{assigneeID}', controller='artifact', action='assignGroupEditing')
    map.connect('/unassign/editing/{artifactID}/of/{bookID}', controller='artifact', action='unassignGroupEditing', assigneeID=None)
    map.connect('/unassign/editing/{artifactID}/of/{bookID}/from/{assigneeID}', controller='artifact', action='unassignGroupEditing')
    map.connect('/check/editing/authority/for/{artifactID}', controller='artifact', action='checkEditingAuthority')
    map.connect('/start/editing/draft/of/{artifactRevisionID}', controller='artifact', action='startBookEditingDraft')
    map.connect('/stop/editing/draft/of/{artifactRevisionID}', controller='artifact', action='stopBookEditingDraft')
    map.connect('/who/is/editing/draft/of/{artifactRevisionID}', controller='artifact', action='getBookEditingDraft')
    map.connect('/get/my/editing/drafts', controller='artifact', action='getMyBookEditingDrafts')

    map.connect('/add/member/role/{id}/{groupID}/{roleID}', controller='member', action='addMemberRole')
    map.connect('/add/member/role/{id}/{roleID}', controller='member', action='addMemberRole', groupID=None)
    map.connect('/add/member/role/{roleID}', controller='member', action='addMemberRole', id=None, groupID=None)
    map.connect('/remove/member/role/{id}/{groupID}/{roleID}', controller='member', action='removeMemberRole')

    map.connect('/get/member/{id}', controller='member', action='get')
    map.connect('/get/member', controller='member', action='get')
    map.connect('/get/members', controller='member', action='get')

    # Stopwords related
    map.connect('/get/stopwords', controller='stopwords', action='getStopWords')
    map.connect('/create/stopwords', controller='stopwords', action='createStopWords')
    map.connect('/delete/stopwords', controller='stopwords', action='deleteStopWords')

    if not hideInternal:
        map.connect('/construct/perma/resource/{id}/{stream}', controller='resource', action='constructPerma')
        map.connect('/construct/perma/resource/{id}', controller='resource', action='constructPerma')
        map.connect('/construct/perma/{id}', controller='perma', action='construct')

        map.connect('/create/browseTerm', controller='browseTerm', action='create')
        map.connect('/create/tagTerm', controller='tagTerm', action='create')
        map.connect('/create/searchTerm', controller='searchTerm', action='create')
        map.connect('/create/domainTerm', controller='browseTerm', action='createDomain')
        map.connect('/create/domainTermNeighbor', controller='browseTerm', action='createDomainNeighbor')

        map.connect('/update/domainTerm', controller='browseTerm', action='updateDomain')
        map.connect('/create/browseTermSynonym', controller='browseTerm', action='createSynonym')
        map.connect('/create/browseTerm/association', controller='browseTerm', action='createAssociation')
        map.connect('/create/tagTerm/association', controller='tagTerm', action='createAssociation')
        map.connect('/create/searchTerm/association', controller='searchTerm', action='createAssociation')
        map.connect('/create/standard', controller='standard', action='create')
        map.connect('/create/standard/association', controller='standard', action='createAssociation')
        map.connect('/create/favorite/{revisionID}', controller='favorite', action='create')
        map.connect('/create/favorite', controller='favorite', action='create')
        map.connect('/create/featured', controller='featured', action='create')
        map.connect('/create/feedback', controller='feedback', action='create')
        map.connect('/create/feedback/abuse/{artifactID}/{memberID}', controller='feedback', action='createFeedbackAbuse')
        map.connect('/update/feedback', controller='feedback', action='updateFeedback')
        map.connect('/create/feedbackreview', controller='feedback', action='createFeedbackReview')
        map.connect('/update/feedbackreview', controller='feedback', action='updateFeedbackReview')
        map.connect('/create/feedbackreview/abuse/{reviewID}', controller='feedback', action='createFeedbackReviewAbuse')
        map.connect('/create/feedbackhelpful', controller='feedback', action='createFeedbackHelpful')
        map.connect('/create/index', controller='search', action='createIndex')
        map.connect('/create/reindex', controller='search', action='reindex')
        map.connect('/create/resource/association', controller='resource', action='createAssociation')
        map.connect('/create/resource/associations', controller='resource', action='createAssociations')
        map.connect('/create/resource/placeholder/{type}', controller='resource', action='createPlaceholderResource')
        map.connect('/create/resource/placeholder', controller='resource', action='createPlaceholderResource')
        map.connect('/create/resource', controller='resource', action='createResource')

        if str(config.get('iam_image_satellite')).lower() == 'true':
            map.connect('/create/resourceSatellite', controller='resource', action='createResourceSatellite')

        map.connect('/create/attachment', controller='resource', action='createAttachment')
        map.connect('/create/customCover', controller='resource', action='createCustomCover')
        map.connect('/create/notification', controller='notification', action='createNotification')
        map.connect('/create/event', controller='notification', action='createEvent')
        map.connect('/create/events', controller='notification', action='createEvents')
        map.connect('/delete/events', controller='notification', action='deleteEvents')
        map.connect('/get/my/events/{notificationType}', controller='notification', action='getMyEvents')
        map.connect('/get/self/notifications/{typeName}', controller='notification', action='getSelfNotificationsByEventType')
        map.connect('/delete/event/{eventID}', controller='notification', action='deleteEvent')

        map.connect('/create/embeddedobjectprovider', controller='embeddedObject', action='createEmbeddedObjectProvider')
        map.connect('/create/embeddedobject/placeholder/{type}', controller='embeddedObject', action='createPlaceholderEmbeddedObject')
        map.connect('/create/embeddedobject/placeholder', controller='embeddedObject', action='createPlaceholderEmbeddedObject')
        map.connect('/create/embeddedobject', controller='embeddedObject', action='create')
        map.connect('/create/embeddedobject/association', controller='embeddedObject', action='createAssociation')
        map.connect('/create/abusereport', controller='resource', action='createAbuseReport')
        map.connect('/report/issue', controller='resource', action='createAbuseReport')
       
    # SEO create metadata API 
        map.connect('/create/seometadata',controller='seometadata', action='createSeoMetaData')

        ## Library APIs
        map.connect('/add/mylib/object', controller='library', action='addToLibrary')
        map.connect('/add/mylib/objects', controller='library', action='addToLibraryMulti')
        map.connect('/remove/mylib/object', controller='library', action='removeFromLibrary')

        map.connect('/add/mylib/objectsLabel', controller='library', action='assignLabelToObjects')
        map.connect('/move/mylib/objectsLabel', controller='library', action='changeLabelForObjects')
        map.connect('/remove/mylib/objectsLabel', controller='library', action='removeLabelFromObjects')

        map.connect('/create/mylib/label', controller='library', action='addMemberLabel')
        map.connect('/update/mylib/label', controller='library', action='updateMemberLabel')
        map.connect('/delete/mylib/label', controller='library', action='deleteMemberLabel')

        map.connect('/create/math/cache', controller='math', action='makecache')
        map.connect('/create/math/cache/{id}', controller='math', action='makecache')
        map.connect('/assemble/artifact', controller='artifact', action='assembleArtifact')
        map.connect('/finalize/{bookType}', controller='artifact', action='finalizeBook')
        map.connect('/featured/artifact', controller='artifact', action='createFeaturedArtifact')

        map.connect('/delete/browseTermSynonym', controller='browseTerm', action='deleteSynonym')
        map.connect('/delete/domainTerm', controller='browseTerm', action='deleteDomain')
        map.connect('/delete/branch', controller='browseTerm', action='deleteBranch')
        map.connect('/delete/domainTermNeighbor', controller='browseTerm', action='deleteDomainNeighbor')
        map.connect('/delete/index', controller='search', action='deleteIndex')
        map.connect('/delete/downloadStatsTypes/{downloadStatsType}', controller='phonehome', action='deleteDownloadStatsType')
        map.connect('/delete/favorite/{revisionID}', controller='favorite', action='delete')
        map.connect('/delete/featured/{id}', controller='featured', action='delete')
        map.connect('/delete/feedback/{memid}/{revid}', controller='feedback', action='delete')
        map.connect('/delete/browseTerm/association', controller='browseTerm', action='deleteAssociation')
        map.connect('/delete/tagTerm/association', controller='tagTerm', action='deleteAssociation')
        map.connect('/delete/searchTerm/association', controller='searchTerm', action='deleteAssociation')
        map.connect('/delete/embeddedobjectprovider/blacklist', controller='embeddedObject', action='removeFromBlacklist')
        map.connect('/delete/embeddedobject/blacklist', controller='embeddedObject', action='removeFromBlacklist')
        map.connect('/delete/embeddedobject/association', controller='embeddedObject', action='deleteAssociation')
        map.connect('/delete/resource/association', controller='resource', action='deleteAssociation')
        map.connect('/delete/resource', controller='resource', action='deleteResource')
        map.connect('/delete/notification', controller='notification', action='deleteNotification')
        map.connect('/delete/standard/association', controller='standard', action='deleteAssociation')

        map.connect('/update/embeddedobjectprovider/blacklist', controller='embeddedObject', action='addToBlacklist')
        map.connect('/update/embeddedobjectprovider', controller='embeddedObject', action='updateEmbeddedObjectProvider')
        map.connect('/update/embeddedobject/blacklist', controller='embeddedObject', action='addToBlacklist')
        map.connect('/update/abusereport', controller='resource', action='updateAbuseReport')
        map.connect('/update/issue', controller='resource', action='updateAbuseReport')
        map.connect('/update/resource', controller='resource', action='updateResource')
        map.connect('/update/index', controller='search', action='reindex')
        map.connect('/update/resource/hash', controller='artifact', action='updateResourceHash')
        map.connect('/update/featured/{id}', controller='featured', action='update')
        map.connect('/request/publish/revision/{id}', controller='artifact', action='requestPublishRevision')
        map.connect('/publish/revision/{id}', controller='artifact', action='publishArtifactRevision')
        map.connect('/publish/{id}', controller='artifact', action='publishArtifact')
        map.connect('/unpublish/revision/{id}', controller='artifact', action='unpublishArtifactRevision')
        map.connect('/unpublish/{id}', controller='artifact', action='unpublishArtifact')
        map.connect('/update/notification', controller='notification', action='updateNotification')
        map.connect('/update/{type}/{id}/revision/{rev}', controller='artifact', action='updateArtifact')
        map.connect('/update/{type}/{id}', controller='artifact', action='updateArtifact')
        map.connect('/update/{id}/revision/{rev}', controller='artifact', action='updateArtifact', type=None)
        map.connect('/replace/content/revision/{id}', controller='artifact', action='replaceRevisionContent')
        map.connect('/update/artifact/usernotification/{id}', controller='artifact', action='updateArtifactUserNotification')
        map.connect('/artifact/update/artifactType={artifactType}&artifactHandle={artifactHandle}&artifactCreator={artifactCreator}/descendant/{artifactDescendantIdentifier}',
                    controller='artifactServiceManager', action='updateArtifact')
        map.connect('/artifact/update/artifactType={artifactType}&artifactHandle={artifactHandle}&artifactCreator={artifactCreator}',
                    controller='artifactServiceManager', action='updateArtifact')
        map.connect('/artifact/save', controller='artifactServiceManager', action='updateOrCreateArtifact')
        map.connect('/load/modalities', controller='modality', action='loadModalities')
        map.connect('/load/vocabularies', controller='vocabulary', action='loadVocabularies')

        map.connect('/load/browseTerms', controller='browseTerm', action='loadDataFromCSV')
        map.connect('/load/foundationGrid', controller='browseTerm', action='loadFoundationGridFromCSV')
        map.connect('/load/standardsCorrelation', controller='standard', action='loadStandardsCorrelations')
        map.connect('/load/stateStandards', controller='standard', action='loadStateStandardsDataFromCSV')
        map.connect('/load/browseTermCandidates', controller='browseTerm', action='loadBrowseTermCandidatesFromCSV')

        map.connect('/render/pdf/worksheet/', controller='pdf', action='renderWorksheet')
        map.connect('/render/pdf/{id:[0-9]+}', controller='pdf', action='render', revisionID=None, nocache=False, template=None)
        map.connect('/render/pdf/{id:[0-9]+}/nocache',controller='pdf',action='render', revisionID=None, nocache=True, template=None)
        map.connect('/render/pdf/{id:[0-9]+}/nocache/{template:.*?}', controller='pdf', action='render', revisionID=None, nocache=True)
        map.connect('/render/pdf/{id:[0-9]+}/{revisionID:[0-9]+}', controller='pdf', action='render', nocache=False, template=None)
        map.connect('/render/pdf/{id:[0-9]+}/{revisionID:[0-9]+}/nocache',controller='pdf', action='render', nocache=True, template=None)
        map.connect('/render/pdf/{id:[0-9]+}/{revisionID:[0-9]+}/nocache/{template:.*?}', controller='pdf', action='render', nocache=True)
        map.connect('/render/pdf/{id:[0-9]+}/{revisionID:[0-9]+}/{template:.*?}', controller='pdf', action='render', nocache=False)
        map.connect('/render/pdf/{id:[0-9]+}/{template:.*?}', controller='pdf', action='render', revisionID=None, nocache=False)

        map.connect('/render/epub/{id}/nocache', controller='epub', action='render', revisionID=None, nocache=True, optimizeForKindle=False)
        map.connect('/render/epub/{id}/{revisionID}/nocache', controller='epub', action='render', nocache=True, optimizeForKindle=False)
        map.connect('/render/epub/{id}', controller='epub', action='render', revisionID=None, nocache=False, optimizeForKindle=False)
        map.connect('/render/epub/{id}/{revisionID}', controller='epub', action='render', nocache=False, optimizeForKindle=False)
        map.connect('/render/epubstitch', controller='epub', action='stitch')
        map.connect('/render/epubstitch/status/{taskId}', controller='epub', action='epubStitchStatus')

        map.connect('/render/epubk/{id}/nocache', controller='epub', action='render', revisionID=None, nocache=True, optimizeForKindle=True)
        map.connect('/render/epubk/{id}/{revisionID}/nocache', controller='epub', action='render', nocache=True, optimizeForKindle=True)
        map.connect('/render/epubk/{id}', controller='epub', action='render', revisionID=None, nocache=False, optimizeForKindle=True)
        map.connect('/render/epubk/{id}/{revisionID}', controller='epub', action='render', nocache=False, optimizeForKindle=True)

        map.connect('/render/mobi/{id}/nocache', controller='mobi', action='render', revisionID=None, nocache=True)
        map.connect('/render/mobi/{id}/{revisionID}/nocache', controller='mobi', action='render', nocache=True)
        map.connect('/render/mobi/{id}', controller='mobi', action='render', revisionID=None, nocache=False)
        map.connect('/render/mobi/{id}/{revisionID}', controller='mobi', action='render', nocache=False)

        map.connect('/render/zip/{id}/nocache', controller='zipper', action='render', revisionID=None, nocache=True)
        map.connect('/render/zip/{id}/{revisionID}/nocache', controller='zipper', action='render', nocache=True)
        map.connect('/render/zip/{id}', controller='zipper', action='render', revisionID=None, nocache=False)
        map.connect('/render/zip/{id}/{revisionID}', controller='zipper', action='render', nocache=False)

    map.connect('/render/embeddedobject/{id}', controller='embeddedObject', action='renderObject')

    if not hideInternal:
        map.connect('/download/xdt/{filename}/{format}', controller='download', action='downloadXdt')
        map.connect('/download/xdt/{filename}', controller='download', action='downloadXdt', format=None)

        map.connect('/download/{path:.*}', controller='download', action='download')

        map.connect('/internal/workdir/create', controller='workdir', action='create')
        map.connect('/internal/workdir/delete/{id}', controller='workdir', action='delete')

        map.connect('/translator/xhtmltodocbook',controller='translator',action='xhtmlToDocbook')
        map.connect('/translator/docbooktoxhtml',controller='translator',action='docbookToXhtml')

    map.connect('/math/block/{id:[\s\S]*}/{target}', controller='math', action='block', requirements={'target':'web|WEB|kindle|KINDLE'})
    map.connect('/math/inline/{id:[\s\S]*}/{target}', controller='math', action='inline', requirements={'target':'web|WEB|kindle|KINDLE'})
    map.connect('/math/alignat/{id:[\s\S]*}/{target}', controller='math', action='alignat', requirements={'target':'web|WEB|kindle|KINDLE'})
    map.connect('/math/block/{id:[\s\S]*}', controller='math', action='block')
    map.connect('/math/inline/{id:[\s\S]*}', controller='math', action='inline')
    map.connect('/math/alignat/{id:[\s\S]*}', controller='math', action='alignat')
    
    #
    # Profanity filter related
    #
    map.connect('/sanitize', controller='filter', action='detectProfanity')

    if not hideInternal:
        map.connect('/get/definitions/{type}/{id}', controller='flashcard', action='getDefinitions')
        map.connect('/render/flashcards', controller='flashcard', action='renderFlashCards')

    map.connect('/show/{stream}/{type:[ a-zA-Z0-9]*?}/{realm:[^/]*?:[^/]*?}/{handle:.*?}', controller='resource', action='renderPerma',
            requirements={'stream':'default|DEFAULT|thumb_small|THUMB_SMALL|thumb_large|THUMB_LARGE|thumb_postcard|THUMB_POSTCARD|autoplay'})
    map.connect('/show/{stream}/{type:[ a-zA-Z0-9]*?}/{handle:.*?}', controller='resource', action='renderPerma',
            requirements={'stream':'default|DEFAULT|thumb_small|THUMB_SMALL|thumb_large|THUMB_LARGE|thumb_postcard|THUMB_POSTCARD|autoplay'})
    map.connect('/show/{type:[ a-zA-Z0-9]*?}/{realm:[^/]*?:[^/]*?}/{handle:.*?}', controller='resource', action='renderPerma')
    map.connect('/show/{type:[ a-zA-Z0-9]*?}/{handle:.*?}', controller='resource', action='renderPerma')
    
    map.connect('/get/box/viewer/session', controller='boxViewer', action='getSession')
    map.connect('/get/box/viewer/documents', controller='boxViewer', action='getBoxDocumentList')

    #
    #  LMS Related.
    #
    map.connect('/install/lms/{appID}', controller='edmodo', action='install')
    map.connect('/process/lms/update/{appID}', controller='edmodo', action='processUpdate')
    map.connect('/get/lms/provider', controller='lms', action='getLMSProviders')
    map.connect('/get/lms/providerapp/users', controller='lms', action='getLMSProviderAppUsers')
    map.connect('/get/lms/providerapp/{providerID:[0-9]*?}', controller='lms', action='getLMSProviderApps')
    map.connect('/create/lms/providerapp/{providerID:[0-9]*?}', controller='lms', action='createLMSProviderApp')
    map.connect('/create/lms/providerapp', controller='lms', action='createLMSProviderApp')
    map.connect('/get/lms/userdata/{appID}', controller='lms', action='getLMSUserData')
    map.connect('/save/lms/userdata/{appID}', controller='lms', action='saveLMSUserData')
    map.connect('/get/userdata/{appID}', controller='lms', action='getLMSUserData')
    map.connect('/save/userdata/{appID}', controller='lms', action='saveLMSUserData')

    map.connect('/get/appdata/{appName}', controller='appData', action='getUserData')
    map.connect('/save/appdata/{appName}', controller='appData', action='saveUserData')

    map.connect('/test/edmodoConnect/groups', controller='edmodoconnect', action='getUserEdmodoGroups')
    map.connect('/test/edmodoConnect/get/info/my', controller='edmodoconnect', action='getUserEdmodoInfo')
    map.connect('/test/edmodoConnect/get/assignments', controller='edmodoconnect', action='getUserEdmodoAssignments')
    map.connect('/test/edmodoConnect/create/assignment', controller='edmodoconnect', action='createUserEdmodoAssignment')
    map.connect('/test/edmodoConnect/turnin/assignment', controller='edmodoconnect', action='turninUserEdmodoAssignment')
    map.connect('/test/edmodoConnect/submit/grade', controller='edmodoconnect', action='submitUserEdmodoGrade')


    #
    # SpecialSearchEntry related.
    #
    map.connect('/get/info/specialSearchEntry/{term}', controller='specialSearch', action='getSpecialSearchEntry')
    map.connect('/get/info/specialSearchEntry', controller='specialSearch', action='getSpecialSearchEntry')
    map.connect('/get/info/specialSearchEntries', controller='specialSearch', action='getSpecialSearchEntries')
    map.connect('/match/info/specialSearchEntries/{term}', controller='specialSearch', action='matchSpecialSearchEntries')
    map.connect('/match/info/specialSearchEntries', controller='specialSearch', action='matchSpecialSearchEntries')
    map.connect('/create/specialSearchEntry', controller='specialSearch', action='createSpecialSearchEntry')
    map.connect('/update/specialSearchEntry', controller='specialSearch', action='updateSpecialSearchEntry')
    map.connect('/delete/specialSearchEntry', controller='specialSearch', action='deleteSpecialSearchEntry')

    # Forums Sequence related
    map.connect('/get/forums/sequence', controller='mongo/forumssequence', action='getForumsSequence')
    map.connect('/update/forumssequence', controller='mongo/forumssequence', action='updateForumsSequence')

    #
    #  Concept Related Artifacts.
    #
    map.connect('/get/relatedartifacts', controller='mongo/relatedartifacts', action='getRelatedArtifacts')
    map.connect('/create/relatedartifacts', controller='mongo/relatedartifacts', action='createRelatedArtifacts')

    #
    # Artifact Similarity related
    #
    map.connect('/get/canonical/{artifactID:[0-9]*?}/{artifactRevisionID:[0-9]*?}', controller='mongo/artifactsimilarity', action='getArtifactSimilarity')
    map.connect('/get/canonical/{artifactID:[0-9]*?}', controller='mongo/artifactsimilarity', action='getArtifactSimilarity', artifactRevisionID=None)
    map.connect('/create/similarity/{artifactID:[0-9]*?}/{artifactRevisionID:[0-9]*?}', controller='mongo/artifactsimilarity', action='createArtifactSimilarity')
    map.connect('/update/artifact/similarity/{artifactRevisionID:[0-9]*?}', controller='mongo/artifactsimilarity', action='updateArtifactSimilarity', artifactID=None)
    map.connect('/update/artifact/similarity/{artifactID:[0-9]*?}/{artifactRevisionID:[0-9]*?}', controller='mongo/artifactsimilarity', action='updateArtifactSimilarity')

    #
    # Artifact Summary related
    #
    map.connect('/get/artifactsummary/{artifactID:[0-9]*?}', controller='mongo/artifactsummary', action='getArtifactSummary')

   
    #
    # Flxadmin User Role ACL management related
    #
    map.connect('/get/admin/userrole/acl', controller='mongo/flxadminuserroleacl', action='get_flxadmin_user_role_acl')
    map.connect('/update/admin/userrole/acl', controller='mongo/flxadminuserroleacl', action='update_flxadmin_user_role_acl')

    #
    #  Recommendation related
    #
    map.connect('/get/recommendations', controller='recommendation', action='getRecommendations')
    map.connect('/record/userAction', controller='recommendation', action='recordUserAction')
    
    #
    #  Recommend Concept Pairs for Assignment
    #
    map.connect('/get/recommendations/assignment/concept', controller='recommendation', action='getAssignmentRecommendations')

    
    #  SEO Metadata Related
    map.connect('/get/seometadata',controller='seometadata', action='getSeoMetaData')

    # Audit Trail Related
    map.connect('/get/auditTrail/{collectionName}/{auditType}', controller='auditTrail', action='getAuditTrail')
    map.connect('/create/auditTrail', controller='auditTrail', action='createAuditTrail')

    # Store Access Token
    map.connect('/create/oauth2/entry', controller='oauth2accesstoken', action='createAccessTokenEntry')
    map.connect('/get/oauth2/entry', controller='oauth2accesstoken', action='getAccessTokenByMemberID')

    #
    #  Email related
    #
    map.connect('/send/email',controller='email', action='send')
    #
    #  Concept map related
    #
    map.connect('/create/concept/map/feedbacks', controller='conceptMap', action='createFeedbacks')
    map.connect('/update/concept/map/feedbacks', controller='conceptMap', action='updateFeedbacks')
    map.connect('/get/concept/map/feedbacks', controller='conceptMap', action='getFeedbacks')
    #
    #  Cache related
    #
    if development:
        map.connect('/get/artifact/cache/{id}/{revID}', controller='mongocache/cache', action='getArtifactCache')
        map.connect('/get/artifact/cache/{id}', controller='mongocache/cache', action='getArtifactCache')
        map.connect('/remove/artifact/cache/{id}/{revID}', controller='mongocache/cache', action='removeArtifactCache')
        map.connect('/remove/artifact/cache/{id}', controller='mongocache/cache', action='removeArtifactCache')
        map.connect('/test/artifact/cache/{id}', controller='mongocache/cache', action='testArtifactCache')
    #
    #  Upload students related
    #
    map.connect('/validate/code/{code}/grade/{grade}', controller='students', action='validateGroupAndGrade')
    map.connect('/upload/students/code/{code}/grade/{grade}', controller='students', action='uploadStudents')

    #
    #  PDF Download requests related
    #
    map.connect('/save/pdf/download/info', controller='mongo/pdfdownloads', action='savePDFDownloadInfo')    
    map.connect('/get/pdf/download/info', controller='mongo/pdfdownloads', action='getPDFDownloadInfo')        

    ## Catch all get routes
    map.connect('/get/info/{type}/{id}', controller='artifact', action='getInfo')
    map.connect('/get/info/{id}', controller='artifact', action='getInfo')
    map.connect('/get/minimal/{type}/{id}', controller='artifact', action='getMinimal')
    map.connect('/get/minimal/{id}', controller='artifact', action='getMinimal')
    map.connect('/get/detail/{type}/{id}/{revisionID}', controller='artifact', action='getDetail')
    map.connect('/get/detail/{type}/{id}', controller='artifact', action='getDetail')
    map.connect('/get/detail/{id}', controller='artifact', action='getDetail')

    ## Session related
    map.connect('/clear/sessions/my', controller='mongosession/session', action='clearUserSessions')


    if not hideInternal:
        map.connect('/get/rosetta/sample', controller='rosetta', action='getSample')
        map.connect('/get/rosetta/xsd', controller='rosetta', action='get')
        map.connect('/validate/rosetta/form', controller='rosetta', action='validateForm')
        map.connect('/validate/rosetta', controller='rosetta', action='validate')
        map.connect('/validate/validateXhtmlList', controller='rosetta', action='validateXhtmlList')

        map.connect('/get/downloadStats', controller='phonehome', action='getDownloadStats')
        map.connect('/get/downloadStatsTypes', controller='phonehome', action='getDownloadStatsTypes')
        map.connect('/update/downloadStatsTypes/{downloadStatsType}/{count}', controller='phonehome', action='updateDownloadStatsForType')
        map.connect('/add/downloadStatsTypes/{downloadStatsType}', controller='phonehome', action='addDownloadStatsType')

        map.connect('/invalidate/cache/artifact/{id}', controller='cache', action='invalidateArtifact')
        map.connect('/invalidate/cache/artifact/revision/{id}', controller='cache', action='invalidateArtifactRevision')
        map.connect('/invalidate/cache/member/{id}', controller='cache', action='invalidateMember')
        map.connect('/invalidate/cache/browseTerm/{id}', controller='cache', action='invalidateBrowseTerm')
        map.connect('/invalidate/globals/{name}', controller='cache', action='invalidateGlobals')

        #
        #  1.x related.
        #
        map.connect('/get/member/has/1x/books/{memberID}', controller='flexr', action='has1xBooks')
        map.connect('/get/member/has/1x/books', controller='flexr', action='has1xBooks')
        map.connect('/get/members/have/1x/books', controller='flexr', action='have1xBooks')
        map.connect('/acknowledge/import/1x/books', controller='flexr', action='acknowledge1xBooks')
        map.connect('/decline/import/1x/books', controller='flexr', action='decline1xBooks')
        map.connect('/reset/import/1x/books/{memberID}', controller='flexr', action='reset1xBooks')
        map.connect('/get/1x/books/{memberID}', controller='flexr', action='get1xBooks')
        map.connect('/get/1x/book/{fid}', controller='flexr', action='get1xBook')
        map.connect('/get/1x/chapter/{cid}', controller='flexr', action='get1xChapter')
        map.connect('/import/1x/books/{memberID}', controller='flexr', action='import1xBooks')
        map.connect('/import/1x/books', controller='flexr', action='import1xBooks')

        #
        #  bms related
        #
        map.connect('/get/bookmetadata/{ISBN}', controller='isbn', action='getBookmetadata')

        # catch-all matches
        map.connect('/create/{typeName}', controller='artifact', action='createArtifact')
        map.connect('/update/{id}', controller='artifact', action='updateArtifact', type=None)
        map.connect('/delete/{type}/{id}', controller='artifact', action='deleteArtifact')
        map.connect('/delete/{id}', controller='artifact', action='deleteArtifact')

        map.connect('/{controller}/{action}')
        map.connect('/{controller}/{action}/{id}')

    return map
