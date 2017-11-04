"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from routes import Mapper

def make_map(config):
    """Create, configure and return the routes Mapper"""
    map = Mapper(directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'])
    map.minimization = False
    map.explicit = False

    # The ErrorController route (handles 404/500 error pages); it should
    # likely stay at the top, ensuring it can always be resolved
    map.connect('/error/{action}', controller='error')
    map.connect('/error/{action}/{id}', controller='error')

    hideInternal = str(config.get('hide_internal_apis')).lower() == 'true'
    development = str(config.get('deployment_target')).lower() == 'development'

    # CUSTOM ROUTES HERE

    map.connect('/get/info/concept/{encodedID}', controller='conceptnode', action='getInfo')
    map.connect('/get/info/next/concepts/{encodedID}', controller='conceptnode', action='getNextInfo')
    map.connect('/get/info/previous/concepts/{encodedID}', controller='conceptnode', action='getPreviousInfo')
    map.connect('/get/info/concepts/{subjectID}/{branchID}/{toplevel}', controller='conceptnode', action='getConceptNodes')
    map.connect('/get/info/concepts/{subjectID}/{branchID}', controller='conceptnode', action='getConceptNodes')
    map.connect('/get/info/prereqs/concepts/{encodedID}/{levels}', controller='conceptnode', action='getPrerequisites')
    map.connect('/get/info/prereqs/concepts/{encodedID}', controller='conceptnode', action='getPrerequisites')
    map.connect('/get/info/advanced/concepts/{encodedID}/{levels}', controller='conceptnode', action='getPostrequisites')
    map.connect('/get/info/advanced/concepts/{encodedID}', controller='conceptnode', action='getPostrequisites')
    map.connect('/get/info/fundamental/concepts/{subjectID}/{branchID}', controller='conceptnode', action='getFundamentalConceptNodes')
    map.connect('/get/info/descendants/concepts/{encodedID}/{levels}', controller='conceptnode', action='getDescendants')
    map.connect('/get/info/descendants/concepts/{encodedID}', controller='conceptnode', action='getDescendants', levels=1)
    map.connect('/get/info/ancestors/concepts/{encodedID}', controller='conceptnode', action='getAncestors')
    map.connect('/get/info/dependants/concepts/{encodedID}', controller='conceptnode', action='getDependants')
    map.connect('/get/info/rank/concept/{encodedID}/{toplevel}', controller='conceptnode', action='getConceptNodeRank')
    map.connect('/get/info/rank/concept/{encodedID}', controller='conceptnode', action='getConceptNodeRank')
    map.connect('/get/info/related/concepts/{encodedID}', controller='conceptnode', action='getRelatedConceptNodes')
    map.connect('/search/concept/{subject}/{branch}/{term:.*?}', controller='conceptnode', action='search')
    map.connect('/search/concept/{branch}/{term:.*?}', controller='conceptnode', action='search')
    map.connect('/search/concept/{term:.*?}', controller='conceptnode', action='search')


    if not hideInternal:
        map.connect('/show/tree/concepts', controller='conceptnode', action='visualizeConceptNodeTree')
        map.connect('/show/map/concepts/{subjectID}/{branchID}/{startID}/{endID}', controller='conceptnode', action='visualizeConceptNodeMap')
        map.connect('/show/map/concepts/{subjectID}/{branchID}/{startID}', controller='conceptnode', action='visualizeConceptNodeMap')
        map.connect('/show/map/concepts/{subjectID}/{branchID}', controller='conceptnode', action='visualizeConceptNodeMap')

    if development:
        map.connect('/load/conceptsForm', controller='conceptnode', action='loadConceptNodeDataForm')
        map.connect('/create/conceptForm', controller='conceptnode', action='createForm')
        map.connect('/create/conceptKeywordForm', controller='conceptnode', action='associateConceptNodeKeywordForm')
        map.connect('/create/conceptRelationForm', controller='conceptnode', action='createRelationForm')
        map.connect('/create/subjectForm', controller='subjectbranch', action='createSubjectForm')
        map.connect('/create/branchForm', controller='subjectbranch', action='createBranchForm')
        map.connect('/create/artifactextensiontypeForm', controller='artifactextensiontype', action='createForm')
        map.connect('/create/conceptInstanceForm', controller='conceptnode', action='createConceptNodeInstanceForm')
        map.connect('/create/conceptPrerequiresForm', controller='conceptnode', action='createConceptNodePrerequiresForm')
        map.connect('/update/conceptForm/{id}', controller='conceptnode', action='updateForm')
        map.connect('/update/artifactextensiontypeForm/{id}', controller='artifactextensiontype', action='updateForm')
        map.connect('/demo/concept', controller='conceptnode', action='conceptForm')
        map.connect('/delete/conceptForm', controller='conceptnode', action='deleteForm')
        map.connect('/update/branch', controller='subjectbranch', action='updateBranch')
        map.connect('/knowledge_graph/{encodedID}', controller='conceptnode', action='displayKnowledgeGraph')
        map.connect('/knowledge_graph', controller='conceptnode', action='displayKnowledgeGraph', encodedID='unknown')

    map.connect('/get/info/conceptInstances/{encodedID}', controller='conceptnode', action='getConceptNodeInstances')
    map.connect('/get/info/conceptPrerequires/{encodedID}', controller='conceptnode', action='getConceptNodePrerequires')
    map.connect('/get/info/subject/{subjectID}', controller='subjectbranch', action='getSubjectInfo')
    map.connect('/get/info/branch/{subjectID}/{branchID}', controller='subjectbranch', action='getBranchInfo')
    map.connect('/get/info/branch/{branchID}', controller='subjectbranch', action='getBranchInfo')
    map.connect('/get/info/branches', controller='subjectbranch', action='getBranches', subjectID=None)
    map.connect('/get/info/branches/{subjectID}', controller='subjectbranch', action='getBranches')

    map.connect('/get/info/subjects', controller='subjectbranch', action='getSubjects')

    map.connect('/get/info/artifactextensiontype/{id}', controller='artifactextensiontype', action='getInfo')
    map.connect('/list/artifactextensiontypes/{status}', controller='artifactextensiontype', action='listExtensionTypes')
    map.connect('/list/artifactextensiontypes', controller='artifactextensiontype', action='listExtensionTypes', status='published')
    map.connect('/get/info/artifactextensiontypes', controller='artifactextensiontype', action='listExtensionTypes', status='published')

    if not hideInternal:
        map.connect('/export/artifactextensiontypes', controller='artifactextensiontype', action='exportArtifactExtensionTypeData')

        map.connect('/load/concepts', controller='conceptnode', action='loadConceptNodeData')

        map.connect('/export/concepts/{subjectID}/{branchID}', controller='conceptnode', action='exportConceptNodeData')
        map.connect('/export/concepts/{subjectID}', controller='conceptnode', action='exportConceptNodeData')
        map.connect('/export/concepts', controller='conceptnode', action='exportConceptNodeData')

        ##
        ## Auth common 
        ##
        #map.connect('/login/member/*returnTo', controller='auth', action='login')
        #map.connect('/login/member', controller='auth', action='login')
        #map.connect('/login/verify', controller='auth', action='authenticated')
        #map.connect('/get/info/member', controller='auth', action='myinfo')
        map.connect('/login/member/*returnTo', controller='oAuthClient', action='login')
        map.connect('/login/member', controller='oAuthClient', action='login')
        map.connect('/login/verify', controller='oAuthClient', action='authenticated')
        map.connect('/get/info/member', controller='oAuthClient', action='getInfo')
        map.connect('/logout/member', controller='oAuthClient', action='logout')
        map.connect('/get/info/my', controller='auth', action='myinfo')

        map.connect('/create/concept', controller='conceptnode', action='create')
        map.connect('/create/conceptNeighbor', controller='conceptnode', action='createConceptNodeNeighbor')
        map.connect('/create/conceptKeyword', controller='conceptnode', action='associateConceptNodeKeyword')
        map.connect('/create/conceptRelation', controller='conceptnode', action='createRelation')

        map.connect('/create/subject', controller='subjectbranch', action='createSubject')

        map.connect('/create/branch', controller='subjectbranch', action='createBranch')

        map.connect('/create/course', controller='courses', action='createCourseNode')
        map.connect('/update/courseNode/{course}', controller='courses',action='updateCourseNode')
        map.connect('/create/courseStructure', controller='courses', action='createCourseStructure')
        map.connect('/delete/courseStructure', controller='courses', action='deleteCourseStructure')
        map.connect('/create/unit', controller='courses', action='createUnitNode')
        map.connect('/update/unitNode/{unitEID}', controller='courses', action='updateUnitNode')
        map.connect('/update/courseStructure/insertConceptNode', controller = 'courses', action='insertConceptNodeIntoUnit')
        map.connect('/get/info/course/node/{course}', controller='courses', action='getCourseNode')
        map.connect('/get/info/course/structure/{course}', controller='courses', action='getCourseStructure')

        #Collections Related
        map.connect('/collection/create', controller='collectionServiceManager', action='createCollection')
        
        map.connect('/collections/published', controller='collectionServiceManager', action='getPublishedCollections')
        map.connect('/collections/search', controller='collectionServiceManager', action='searchCollections')
        
        map.connect('/collection/collectionHandle={collectionHandle}&collectionCreatorID={collectionCreatorID}/descendant/absoluteCollectionDescendantHandle={absoluteCollectionDescendantHandle}', controller='collectionServiceManager', action='getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle')
        map.connect('/collection/collectionHandle={collectionHandle}&collectionCreatorID={collectionCreatorID}/descendant/{collectionDescendantIdentifier}', controller='collectionServiceManager', action='getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle')
        map.connect('/collection/collectionHandle={collectionHandle}&collectionCreatorID={collectionCreatorID}', controller='collectionServiceManager', action='getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle')        
        map.connect('/collection/collectionHandle={collectionHandle}/descendant/absoluteCollectionDescendantHandle={absoluteCollectionDescendantHandle}', controller='collectionServiceManager', action='getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle')       
        map.connect('/collection/collectionHandle={collectionHandle}/descendant/{collectionDescendantIdentifier}', controller='collectionServiceManager', action='getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle')        
        map.connect('/collection/collectionHandle={collectionHandle}', controller='collectionServiceManager', action='getCollectionByHandleCreatorIDAndDescendantIdentifierOrHandle')    
        
        map.connect('/collection/delete/{collectionHandle}', controller='collectionServiceManager', action='deleteCollection')

        ## Create actions
        map.connect('/create/artifactextensiontype', controller='artifactextensiontype', action='create')
        map.connect('/create/conceptInstance', controller='conceptnode', action='createConceptNodeInstance')
        map.connect('/create/conceptPrerequires', controller='conceptnode', action='createConceptNodePrerequires')

        ## Update actions
        map.connect('/update/concept', controller='conceptnode', action='update')
        map.connect('/update/artifactextensiontype', controller='artifactextensiontype', action='update')

        ## Delete actions
        map.connect('/delete/concept', controller='conceptnode', action='delete')
        map.connect('/delete/concepInstances', controller='conceptnode', action='deleteConceptNodeInstances')
        map.connect('/delete/concepInstance', controller='conceptnode', action='deleteConceptNodeInstance')
        map.connect('/delete/conceptNeighbor', controller='conceptnode', action='deleteConceptNodeNeighbor')
        map.connect('/delete/conceptKeyword', controller='conceptnode', action='deleteConceptNodeKeyword')
        map.connect('/delete/artifactextensiontype', controller='artifactextensiontype', action='delete')
        map.connect('/delete/subject', controller='subjectbranch', action='deleteSubject')
        map.connect('/delete/branch', controller='subjectbranch', action='deleteBranch')
        map.connect('/delete/entireBranch', controller='subjectbranch', action='deleteEntireBranch')

        # Node Actions
        map.connect('/create/nodeAttribute', controller='conceptnode', action='createNodeAttribute')
        map.connect('/get/info/node/{nodeType}/{attributeName}/{attributeValue}/', controller='conceptnode', action='getNodesFromAttribute')
        map.connect('/create/nodeRelation', controller='conceptnode', action='createNodeRelation')

    #map.connect('/{controller}/{action}')
    #map.connect('/{controller}/{action}/{id}')

    return map
