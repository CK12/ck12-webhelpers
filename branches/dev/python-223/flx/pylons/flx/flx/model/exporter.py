import json
import logging
import os

from flx.model import meta
from flx.model.migrate import Migrate

log = logging.getLogger(__name__)

class Export(Migrate):
    """
        Export the flx release 2 databases into Json format data. These data
        is human readable, and could be used to import to the database of a
        different location.
    """

    aloneList = [
        # table name, primary key name.
        [ meta.MathImage, 'hash' ],
        [ meta.USStates, 'abbreviation' ],
        [ meta.USZipCodes, 'zipCode' ],
        [ meta.WorkDirectory, 'id' ],
    ]
    dependList = [
        # table name, primary key name.
        [ meta.ActionTypes, 'id' ],
        [ meta.ArtifactTypes, 'id' ],
        [ meta.BrowseTermTypes, 'id' ],
        [ meta.Countries, 'id' ],
        [ meta.EmbeddedObjectProviders, 'id' ],
        [ meta.Grades, 'id' ],
        [ meta.Groups, 'id' ],
        [ meta.Languages, 'id' ],
        [ meta.MemberAuthTypes, 'id' ],
        [ meta.MemberStates, 'id' ],
        [ meta.ResourceTypes, 'id' ],
        [ meta.Subjects, 'id' ],
        [ meta.USAddresses, 'id' ],
    ]
    hasProcessedSystem = False

    def _add(self, tableDict, name, relations):
        if not tableDict.has_key(name):
            tableDict[name] = []
        tableDict[name].extend(relations)

    def _processAlone(self, tableDict={}):
        """
            Process the alone tables.
            
            These tables depend on nobody, and nobody depends on them.
        """
        for alone, index in self.aloneList:
            relations = self.getTable(alone, order=index)
            self._add(tableDict, alone.fullname, relations)
        return tableDict

    def _processDepend(self, tableDict={}):
        """
            Process the dependent tables.
            
            These tables depend on nobody, but some other tables depend on
            them. So save an in-memory copy.
        """
        for depend, index in self.dependList:
            relations, d = self.getTable(depend, order=index, includeDict=True)
            self._add(tableDict, depend.fullname, relations)
            self.dicts[depend.fullname] = d
        return tableDict

    def _processAccessControls(self, tableDict={}):
        """
            Process meta.AccessControls.
            
            Include role and actionType information for readability.
        """
        table = meta.AccessControls
        relations = self.getTable(table)
        for relation in relations:
            relation['role'] = self.dicts['MemberRoles'][relation['roleID']]
            id = relation['actionTypeID']
            relation['actionType'] = self.dicts['ActionTypes'][id]
        self._add(tableDict, table.fullname, relations)
        return tableDict

    def _processAddresses(self, tableDict={}):
        """
            Process meta.Addresses.

            Include group, country, and address information for readability.
        """
        table = meta.Addresses
        relations = self.getTable(table, order='id')
        for relation in relations:
            relation['group'] = self.dicts['Groups'][relation['groupID']]
            relation['country'] = self.dicts['Countries'][relation['countryID']]
            id = relation['addressID']
            relation['address'] = self.dicts['USAddresses'][id]
        self._add(tableDict, table.fullname, relations)
        return tableDict

    def _processStandards(self, tableDict={}):
        """
            Process meta.Standards and related tables:

                meta.StandardHasGrades

            Include standardBoard, subject, and grades for readability.

            Save in-memory copy of Standards table.
        """
        #
        #  Process meta.StandardHasGrades.
        #
        gradeDict = {}
        grades = self.getTable(meta.StandardHasGrades)
        for grade in grades:
            id = grade['gradeID']
            standardID = grade['standardID']
            if not gradeDict.has_key(standardID):
                gradeDict[standardID] = {}
            gradeDict[standardID][id] = self.dicts['Grades'][id]
        #
        #  Process meta.Standards.
        #
        standardDict = {}
        table = meta.Standards
        relations = self.getTable(table, order='id')
        for relation in relations:
            id = relation['standardBoardID']
            relation['standardBoard'] = self.dicts['StandardBoards'][id]
            id = relation['subjectID']
            relation['subject'] = self.dicts['Subjects'][id]
            id = relation['id']
            if gradeDict.has_key(id):
                relation['grades'] = gradeDict[id]
            standardDict[id] = relation

        self.dicts['Standards'] = standardDict
        self._add(tableDict, table.fullname, relations)
        return tableDict

    def _processStandardBoards(self, tableDict={}):
        """
            Process meta.StandardBoards.

            Include country for readability.

            Save in-memory copy of StandardBoards table.
        """
        table = meta.StandardBoards
        relations, d = self.getTable(table, order='id', includeDict=True)
        for relation in relations:
            id = relation['countryID']
            country = self.dicts['Countries'][id]
            relation['country'] = country
        self._add(tableDict, table.fullname, relations)
        self.dicts['StandardBoards'] = d
        return tableDict

    def _processBrowseTerms(self, tableDict={}):
        """
            Process meta.BrowseTerms and related tables:

                meta.BrowseTermCandidates
                meta.BrowseTermHasSynonyms

                    Include synonym for readability.

                meta.DomainNeighbors

                    Include requiredDomain for readability.

            Include termType, parent, candidates, synonyms, and
            requiredDomains for readability.
        """
        #
        #  Process meta.BrowseTermCandidates.
        #
        candidateDict = {}
        candidates = self.getTable(meta.BrowseTermCandidates)
        for candidate in candidates:
            id = candidate['categoryID']
            if not candidateDict.has_key(id):
                candidateDict[id] = []
            candidateDict[id].append(candidate)
        #
        #  Process meta.BrowseTermHasSynonnyms.
        #
        synonymDict = {}
        synonyms = self.getTable(meta.BrowseTermHasSynonyms)
        for synonym in synonyms:
            id = synonym['termID']
            if not synonymDict.has_key(id):
                synonymDict[id] = {}
            sid = synonym['synonymTermID']
            synonymDict[id][sid] = synonym
        #
        #  Process meta.DomainNeighbors.
        #
        neighborDict = {}
        neighbors = self.getTable(meta.DomainNeighbors)
        for neighbor in neighbors:
            id = neighbor['domainID']
            if not neighborDict.has_key(id):
                neighborDict[id] = {}
            rid = neighbor['requiredDomainID']
            neighborDict[id][rid] = neighbor
        #
        #  Process meta.BrowseTerms.
        #
        browseTermDict = {}
        table = meta.BrowseTerms
        relations = self.getTable(table, order='id')
        for relation in relations:
            id = relation['termTypeID']
            relation['termType'] = self.dicts['BrowseTermTypes'][id]
            id = relation['id']
            browseTermDict[id] = {
                'id': id,
                'name': relation['name'],
                'encodedID': relation['encodedID'],
                'termTypeID': relation['termTypeID'],
                'parentID': relation['parentID'],
            }
            if relation.has_key('parentID'):
                parentID = relation['parentID']
                if parentID is not None:
                    relation['parent'] = browseTermDict[parentID]
            if candidateDict.has_key(id):
                relation['candidates'] = candidateDict[id]
        self.dicts['BrowseTerms'] = browseTermDict
        #
        #  Come back and get the synonym for meta.BrowseTermHasSynonyms.
        #
        for synonym in synonyms:
            sid = synonym['synonymTermID']
            synonym['synonym'] = browseTermDict[sid]
        #
        #  Come back and get the requiredDomain for meta.DomainNeighbors.
        #
        for neighbor in neighbors:
            rid = neighbor['requiredDomainID']
            neighbor['requiredDomain'] = browseTermDict[rid]
        #
        #  Come back and get the synonyms and requiredDomains for
        #  meta.BrowseTerms.
        #
        for relation in relations:
            id = relation['id']
            if synonymDict.has_key(id):
                sids = sorted(synonymDict[id].keys())
                sList = []
                for sid in sids:
                    sList.append(synonymDict[id][sid]['synonym'])
                relation['synonyms'] = sList
            if neighborDict.has_key(id):
                rids = sorted(neighborDict[id].keys())
                rList = []
                for rid in rids:
                    rList.append(neighborDict[id][rid]['requiredDomain'])
                relation['requiredDomains'] = rList

        self._add(tableDict, table.fullname, relations)
        return tableDict

    def _processMemberRoles(self, tableDict={}):
        """
            Process meta.MemberRoles.

            Include group for readability.

            Save in-memory copy of MemberRoles table.
        """
        table = meta.MemberRoles
        relations, d = self.getTable(table, order='id', includeDict=True)
        for relation in relations:
            id = relation['groupID']
            group = self.dicts['Groups'][id]
            relation['group'] = group
        self._add(tableDict, table.fullname, relations)
        self.dicts['MemberRoles'] = d
        return tableDict

    def _processMembers(self, tableDict={}, member=None):
        """
            Process meta.Members and related tables:

                meta.GroupHasMembers

                    Include role for readability.

                meta.MemberExtData

                    Include authType for readability.

            Include groups, extData, and state for readability.

            Save in-memory copy of Members table.
        """
        #
        #  Process meta.GroupHasMembers.
        #
        groupDict = {}
        if member is None:
            where = None
        else:
            where = meta.GroupHasMembers.c.memberID == member['id']
        groups = self.getTable(meta.GroupHasMembers, where=where)
        for group in groups:
            group['role'] = self.dicts['MemberRoles'][group['roleID']]
            memberID = group['memberID']
            if not groupDict.has_key(memberID):
                groupDict[memberID] = []
            groupDict[memberID].append(group)
        #
        #  Process meta.MemberExtData.
        #
        extDict = {}
        if member is None:
            where = None
        else:
            where = meta.MemberExtData.c.memberID == member['id']
        exts = self.getTable(meta.MemberExtData, where=where)
        for ext in exts:
            memberID = ext['memberID']
            if not extDict.has_key(memberID):
                extDict[memberID] = []
            extDict[memberID].append(ext)
            ext['authType'] = self.dicts['MemberAuthTypes'][ext['authTypeID']]
        #
        #  Process meta.MemberAuthApprovals.
        #
        approvalDict = {}
        if member is None:
            where = None
        else:
            where = meta.MemberAuthApprovals.c.memberID == member['id']
        approvals = self.getTable(meta.MemberAuthApprovals, where=where)
        for approval in approvals:
            memberID = approval['memberID']
            if not approvalDict.has_key(memberID):
                approvalDict[memberID] = []
            approvalDict[memberID].append(approval)
        #
        #  Process meta.Members.
        #
        memberDict = {}
        table = meta.Members
        if member is None:
            where = None
        else:
            where = table.c.id == member['id']
        relations = self.getTable(table, where=where, order='id')
        for relation in relations:
            id = relation['id']
            if groupDict.has_key(id):
                relation['groups'] = groupDict[id]
            if extDict.has_key(id):
                relation['extData'] = extDict[id]
            if approvalDict.has_key(id):
                relation['approvals'] = approvalDict[id]
            relation['state'] = self.dicts['MemberStates'][relation['stateID']]
            memberDict[id] = {
                'id': id,
                'email': relation['email'],
            }

        self.dicts['Members'] = memberDict
        self._add(tableDict, table.fullname, relations)
        return tableDict

    def _processResources(self, tableDict={}, member=None):
        """
            Process meta.Resources and related tables:

                meta.AbuseReports
                meta.EmbeddedObjects
                meta.ResourceRevisions

            Include resourceType, owner, language, and revisions for
            readability.

            Save in-memory copy of Resource and ResourceRevisions tables.
        """
        memberDict = self.dicts['Members']
        #
        #  Process meta.AbuseReports.
        #
        reportDict = {}
        if member is None:
            where = None
        else:
            id = member['id']
            where = (meta.AbuseReports.c.reporterID == id or
                     meta.AbuseReports.c.reviewerID == id)
        reports = self.getTable(meta.AbuseReports, where=where, order='id')
        for report in reports:
            resourceRevisionID = report['resourceRevisionID']
            if not reportDict.has_key(resourceRevisionID):
                reportDict[resourceRevisionID] = []
            if memberDict.has_key(report['reporterID']):
                report['reporter'] = memberDict[report['reporterID']]
            if memberDict.has_key(report['reviewerID']):
                report['reviewer'] = memberDict[report['reviewerID']]
            reportDict[resourceRevisionID].append(report)
        #
        #  Initialize resource variables.
        #
        table = meta.Resources
        resources = None
        #
        #  Process meta.ResourceRevisions.
        #
        revisionDict = {}
        if member is None:
            revisions = self.getTable(meta.ResourceRevisions, order='id')
        else:
            id = member['id']
            where = table.c.ownerID == id
            resources = self.getTable(table, where=where, order='id')
            if len(resources) == 0:
                revisions = []
            else:
                resourceList = []
                for resource in resources:
                    resourceList.append(resource['id'])
                where = meta.ResourceRevisions.c.resourceID.in_(resourceList)
                revisions = self.getTable(meta.ResourceRevisions,
                                        where=where,
                                        order='id')
        for revision in revisions:
            resourceID = revision['resourceID']
            if not revisionDict.has_key(resourceID):
                revisionDict[resourceID] = []
            revisionDict[resourceID].append(revision)
            id = revision['id']
            if reportDict.has_key(id):
                revision['abuseReports'] = reportDict[id]
        #
        #  Process meta.EmbeddedObjects.
        #
        embObjectDict = {}
        if member is None:
            where = None
        else:
            id = member['id']
            where = meta.EmbeddedObjects.c.providerID == id
        embObjects = self.getTable(meta.EmbeddedObjects,
                                   where=where,
                                   order='id')
        for embObject in embObjects:
            id = embObject['providerID']
            embObject['provider'] = self.dicts['EmbeddedObjectProviders'][id]
            id = embObject['resourceID']
            if not embObjectDict.has_key(id):
                embObjectDict[id] = []
            embObjectDict[id].append(embObject)
        #
        #  Process meta.Resources.
        #
        resourceDict = {}
        resourceRevisionDict = {}
        if resources is None:
            resources = self.getTable(table, order='id')
        for resource in resources:
            typeID = resource['resourceTypeID']
            resource['resourceType'] = self.dicts['ResourceTypes'][typeID]
            if memberDict.has_key(resource['ownerID']):
                resource['owner'] = memberDict[resource['ownerID']]
            languageID = resource['languageID']
            resource['language'] = self.dicts['Languages'][languageID]
            id = resource['id']
            resource['revisions'] = revisionDict[id]
            for revision in revisionDict[id]:
                revID = revision['id']
                resourceRevisionDict[revID] = {
                    'id': revID,
                    'resourceID': id,
                    'ownerID': resource['ownerID'],
                    'uri': resource['uri'],
                    'revision': revision['revision']
                }
            if embObjectDict.has_key(id):
                resource['embeddedObjects'] = embObjectDict[id]
            resourceDict[id] = resource

        self.dicts['ResourceRevisions'] = resourceRevisionDict
        self.dicts['Resources'] = resourceDict
        self._add(tableDict, table.fullname, resources)
        return tableDict

    def _getArtifact(self, id, artifactDict):
        """
            Get the single Artifact instance identified by id.
        """
        table = meta.Artifacts
        where = table.c.id == id
        artifacts = self.getTable(table, where=where)
        if artifacts is None or len(artifacts) == 0:
            return None
        artifact = artifacts[0]
        artifactDict[id] = artifact
        return artifact

    def _processArtifacts(self, tableDict={}, member=None):
        """
            Process meta.Artifacts and related tables:

                meta.ArtifactAuthors
                meta.Overlays
                    meta.Annotations

                    Include owner, and annotations for readability.

                meta.ArtifactHasBrowseTerms
                meta.ArtifactRevisions
                    meta.ArtifactRevisionFavorites
                    meta.ArtifactRevisionFeedbacks

                        Include member for readability.

                    meta.ArtifactRevisionHasResources
                    meta.ArtifactRevisionHasStandards
                    meta.ArtifactRevisionRelations

                        Include revision for readability.

                    Include favoriteList, feedbacks, standards,
                    resourceRevisions, and children for readability.

                meta.FeaturedArtifacts
                meta.GroupHasArtifacts
                meta.MemberViewedArtifacts

                    Include member for readability.

                meta.SharedArtifacts

                    Include member and role for readability.

            Include type, creator, ancestor, authors, overlays, browseTerms,
            revisions, featured, group, viewedBy, and sharedBy for readability.

            Save in-memory copy of Artifacts table.
        """
        memberDict = self.dicts['Members']
        #
        #  Process meta.Artifacts.
        #
        table = meta.Artifacts
        artifactDict = {}
        if member is None:
            where = None
        else:
            where = table.c.creatorID == member['id']
        artifacts = self.getTable(table, where=where, order='id')
        for artifact in artifacts:
            id = artifact['artifactTypeID']
            artifact['type'] = self.dicts['ArtifactTypes'][id]
            id = artifact['creatorID']
            if memberDict.has_key(id):
                artifact['creator'] = memberDict[id]
            id = artifact['ancestorID']
            if id is not None:
                if memberDict.has_key(id):
                    artifact['ancestor'] = memberDict[id]
            id = artifact['id']
            artifactDict[id] = artifact
        self.dicts['Artifacts'] = artifactDict
        #
        #  Process meta.ArtifactAuthors.
        #
        artifactList = []
        if member is None:
            authors = self.getTable(meta.ArtifactAuthors)
        else:
            if len(artifacts) == 0:
                authors = []
            else:
                for artifact in artifacts:
                    artifactList.append(artifact['id'])
                where = meta.ArtifactAuthors.c.artifactID.in_(artifactList)
                authors = self.getTable(meta.ArtifactAuthors, where=where)
        for author in authors:
            id = author['artifactID']
            artifact = artifactDict[id]
            if not artifact.has_key('authors'):
                artifact['authors'] = []
            artifact['authors'].append(author)
        #
        #  Process meta.Overlays.
        #
        overlayDict = {}
        overlayList = []
        if member is None:
            where = None
        else:
            if len(artifacts) == 0:
                where = meta.Overlays.c.ownerID == member['id']
            else:
                where = (meta.Overlays.c.artifactID.in_(artifactList) |
                         meta.Overlays.c.ownerID == member['id'])
            overlays = self.getTable(meta.Overlays, where=where, order='id')
            for overlay in overlays:
                id = overlay['ownerID']
                overlay['owner'] = self.dicts.Members[id]
                id = overlay['id']
                overlayDict[id] = overlay
                id = overlay['artifactID']
                artifact = artifactDict[id]
                if not artifact.has_key('overlays'):
                    artifact['overlays'] = []
                artifact['overlays'].append(overlay)
                overlayList.append(overlay['id'])
        #
        #  Process meta.Annotations.
        #
        if member is None:
            where = None
        else:
            if len(overlays) == 0:
                where = meta.Annotations.c.replyToID == member['id']
            else:
                where = (meta.Annotations.c.overlayID.in_(overlayList) |
                         meta.Annotations.c.replyToID == member['id'])
        annotations = self.getTable(meta.Annotations, where=where, order='id')
        for annotation in annotations:
            overlayID = annotation['overlayID']
            overlay = overlayDict[overalyID]
            if not overlay.has_key('annotations'):
                overlay['annotations'] = []
            overlay['annotations'].append(annotation)
        #
        #  Process meta.ArtifactHasBrowseTerms.
        #
        btTable = meta.ArtifactHasBrowseTerms
        if member is None:
            browseTerms = self.getTable(btTable)
        else:
            if len(artifactList) == 0:
                browseTerms = []
            else:
                where = btTable.c.artifactID.in_(artifactList)
                browseTerms = self.getTable(btTable, where=where)
        for browseTerm in browseTerms:
            id = browseTerm['artifactID']
            artifact = artifactDict[id]
            id = browseTerm['browseTermID']
            browseTerm = self.dicts['BrowseTerms'][id]
            if not artifact.has_key('browseTerms'):
                artifact['browseTerms'] = []
            artifact['browseTerms'].append(browseTerm)
        #
        #  Process meta.ArtifactRevisions.
        #
        revisionDict = {}
        revisionList = []
        if member is None:
            revisions = self.getTable(meta.ArtifactRevisions, order='id')
        else:
            if len(artifactList) == 0:
                revisions = []
            else:
                where = meta.ArtifactRevisions.c.artifactID.in_(artifactList)
                revisions = self.getTable(meta.ArtifactRevisions,
                                        where=where,
                                        order='id')
        for revision in revisions:
            id = revision['artifactID']
            artifact = artifactDict[id]
            if not artifact.has_key('revisions'):
                artifact['revisions'] = []
            artifact['revisions'].append(revision)
            id = revision['id']
            revisionDict[id] = revision
            revisionList.append(id)
        #
        #  Process meta.ArtifactRevisionFavorites.
        #
        favTable = meta.ArtifactRevisionFavorites
        if member is None:
            favorites = self.getTable(favTable)
        else:
            if len(revisionList) == 0:
                favorites = []
            else:
                where = (favTable.c.artifactRevisionID.in_(revisionList) |
                        favTable.c.memberID == member['id'])
                favorites = self.getTable(favTable, where=where)
        for favorite in favorites:
            id = favorite['memberID']
            if memberDict.has_key(id):
                favorite['member'] = memberDict[id]
            id = favorite['artifactRevisionID']
            revision = revisionDict[id]
            if not revision.has_key('favoriteList'):
                revision['favoriteList'] = []
            revision['favoriteList'].append(favorite)
        #
        #  Process meta.ArtifactRevisionFeedbacks - Obsolete.
        #
        '''fbTable = meta.ArtifactRevisionFeedbacks
        if member is None:
            feedbacks = self.getTable(fbTable)
        else:
            if len(revisionList) == 0:
                feedbacks = []
            else:
                where = (fbTable.c.artifactRevisionID.in_(revisionList) |
                        fbTable.c.memberID == member['id'])
                feedbacks = self.getTable(fbTable, where=where)
        for feedback in feedbacks:
            id = feedback['memberID']
            if memberDict.has_key(id):
                feedback['member'] = memberDict[id]
            id = feedback['artifactRevisionID']
            revision = revisionDict[id]
            if not revision.has_key('feedbacks'):
                revision['feedbacks'] = []
            revision['feedbacks'].append(feedback)'''
        #
        #  Process meta.ArtifactRevisionHasStandards.
        #
        stdTable = meta.ArtifactRevisionHasStandards
        if member is None:
            standards = self.getTable(stdTable)
        else:
            if len(revisionList) == 0:
                standards = []
            else:
                where = stdTable.c.artifactRevisionID.in_(revisionList)
                standards = self.getTable(stdTable, where=where)
        for standard in standards:
            id = standard['artifactRevisionID']
            revision = revisionDict[id]
            if not revision.has_key('standards'):
                revision['standards'] = []
            id = standard['standardID']
            revision['standards'].append(self.dicts['Standards'][id])
        #
        #  Process meta.ArtifactRevisionHasResources.
        #
        resTable = meta.ArtifactRevisionHasResources
        if member is None:
            resources = self.getTable(resTable)
        else:
            if len(revisionList) == 0:
                resources = []
            else:
                where = resTable.c.artifactRevisionID.in_(revisionList)
                resources = self.getTable(resTable, where=where)
        for resource in resources:
            id = resource['artifactRevisionID']
            revision = revisionDict[id]
            if not revision.has_key('resourceRevisions'):
                revision['resourceRevisions'] = []
            id = resource['resourceRevisionID']
            revision['resourceRevisions'].append(self.dicts['ResourceRevisions'][id])
        #
        #  Process meta.ArtifactRevisionRelations.
        #
        relTable = meta.ArtifactRevisionRelations
        if member is None:
            relations = self.getTable(relTable)
        else:
            if len(revisionList) == 0:
                relations = []
            else:
                where = (relTable.c.artifactRevisionID.in_(revisionList) |
                        relTable.c.hasArtifactRevisionID.in_(revisionList))
                relations = self.getTable(relTable, where=where)
        for relation in relations:
            id = relation['artifactRevisionID']
            revision = revisionDict[id]
            if not revision.has_key('children'):
                revision['children'] = []
            rid = relation['hasArtifactRevisionID']
            relation['revision'] = revisionDict[rid]
            revision['children'].append(relation)
        #
        #  Process meta.FeaturedArtifacts.
        #
        featTable = meta.FeaturedArtifacts
        if member is None:
            featuredArtifacts = self.getTable(featTable)
        else:
            if len(artifactList) == 0:
                featuredArtifacts = []
            else:
                where = featTable.c.artifactID.in_(artifactList)
                featuredArtifacts = self.getTable(featTable, where=where)
        for featured in featuredArtifacts:
            id = featured['artifactID']
            if not artifactDict.has_key(id):
                self._getArtifact(id, artifactDict)
            artifact = artifactDict[id]
            artifact['featured'] = featured
        #
        #  Process meta.GroupHasArtifacts.
        #
        groupTable = meta.GroupHasArtifacts
        if member is None:
            groups = self.getTable(groupTable)
        else:
            if len(artifactList) == 0:
                groups = []
            else:
                where = groupTable.c.artifactID.in_(artifactList)
                groups = self.getTable(groupTable, where=where)
        for ag in groups:
            id = ag['groupID']
            group = self.dicts['Groups'][id]
            id = ag['artifactID']
            if not artifactDict.has_key(id):
                self._getArtifact(id, artifactDict)
            artifact = artifactDict[id]
            if not artifact.has_key('groups'):
                artifact['groups'] = []
            artifact['groups'].append(group)
        #
        #  Process meta.MemberViewedArtifacts.
        #
        viewedTable = meta.MemberViewedArtifacts
        if member is None:
            viewedArtifacts = self.getTable(viewedTable)
        else:
            if len(artifactList) == 0:
                viewedArtifacts = []
            else:
                where = (viewedTable.c.artifactID.in_(artifactList) |
                        viewedTable.c.memberID == member['id'])
                viewedArtifacts = self.getTable(viewedTable, where=where)
        for viewed in viewedArtifacts:
            id = viewed['memberID']
            if memberDict.has_key(id):
                member = memberDict[id]
            viewed['member'] = member
            id = viewed['artifactID']
            if not artifactDict.has_key(id):
                self._getArtifact(id, artifactDict)
            artifact = artifactDict[id]
            if not artifact.has_key('viewedBy'):
                artifact['viewedBy'] = []
            artifact['viewedBy'].append(viewed)
        #
        #  Process meta.SharedArtifacts.
        #
        sharedTable = meta.SharedArtifacts
        if member is None:
            sharedArtifacts = self.getTable(sharedTable)
        else:
            if len(artifactList) == 0:
                sharedArtifacts = []
            else:
                where = (sharedTable.c.artifactID.in_(artifactList) |
                        sharedTable.c.memberID == member['id'])
                sharedArtifacts = self.getTable(sharedTable, where=where)
        for shared in sharedArtifacts:
            id = shared['roleID']
            role = self.dicts['MemberRoles'][id]
            shared['role'] = role
            id = shared['memberID']
            if memberDict.has_key(id):
                member = memberDict[id]
            shared['member'] = member
            id = shared['artifactID']
            if not artifactDict.has_key(id):
                self._getArtifact(id, artifactDict)
            artifact = artifactDict[id]
            if not artifact.has_key('sharedBy'):
                artifact['sharedBy'] = []
            artifact['sharedBy'].append(shared)

        self._add(tableDict, table.fullname, artifacts)
        return tableDict

    def getSystem(self, tableDict={}):
        """
            Process all the system tables.
        """
        self._processAlone(tableDict)
        self._processDepend(tableDict)
        self._processStandardBoards(tableDict)
        self._processMemberRoles(tableDict)
        self._processAccessControls(tableDict)
        self._processAddresses(tableDict)
        self._processStandards(tableDict)
        self._processBrowseTerms(tableDict)
        self.hasProcessedSystem = True
        return tableDict

    def getMembers(self, tableDict={}, emails=None):
        """
            Process the members from a comma separated email list.
        """
        if emails is None:
            self._processMembers(tableDict)
            self._processResources(tableDict)
            self._processArtifacts(tableDict)
            return tableDict

        t = {}
        if not self.hasProcessedSystem:
            self._processDepend(t)
            self._processStandardBoards(t)
            self._processMemberRoles(t)
            self._processStandards(t)
            self._processBrowseTerms(t)

        emailList = emails.split(',')
        for email in emailList:
            if verbose:
                print 'email[%s]' % email
            email = email.strip()
            members = self.getTable(meta.Members,
                                    where=(meta.Members.c.email == email))
            if len(members) == 0:
                if verbose:
                    print 'Skipping unknown email[%s]' % email
            else:
                member = members[0]
                self._processMembers(tableDict, member=member)
                self._processResources(tableDict, member=member)
                self._processResources(t)
                self._processArtifacts(tableDict, member=member)
        return tableDict

    def getAll(self):
        """
            Process all the tables.
        """
        tableDict = {}
        self.getSystem(tableDict)
        self.getMembers(tableDict)
        return tableDict

    def _write(self, file, **kwargs):
        """
            Wirte the Json object into the given file handle.
        """
        if kwargs.has_key('func'):
            func = kwargs['func']
            del kwargs['func']
        else:
            func = self.getAll

        json.dump(func(**kwargs), file, sort_keys=True, indent=4)

    def export(self, path, **kwargs):
        """
            Export the database tables as Json format into the file
            identified by path.

            If replace is True, then the existing file will be replaced.
        """
        if kwargs.has_key('replace'):
            replace = kwargs['replace']
            del kwargs['replace']
        else:
            replace = True
        if os.path.exists(path) and not replace:
            return os.errno.EEXIST

        file = open(path, 'w')
        try:
            self._write(file, **kwargs)
        finally:
            file.close()

        return 0

if __name__ == "__main__":
    import optparse

    configFile = '/opt/2.0/flx/pylons/flx/development.ini'
    exportFile = '/tmp/flx2.json'

    parser = optparse.OptionParser('%prog [options] type')
    parser.add_option(
        '-c', '--config-file', dest='configFile', default=configFile,
        help='Location of the pylons config file. Defaults to %s' % configFile
    )
    parser.add_option(
        '-f', '--export-file', dest='exportFile', default=exportFile,
        help='Location of the file to be exported. Defaults to %s' % exportFile
    )
    parser.add_option(
        '-m', '--members', dest='emails', default='',
        help='Export member related tables on the given comma separated emails.'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    parser.add_option(
        '-s', '--system', action='store_true', dest='system', default=False,
        help='Export system tables.'
    )
    options, args = parser.parse_args()

    configFile = options.configFile
    exportFile = options.exportFile
    emails = options.emails
    system = options.system
    exportAll = emails == '' and not system
    verbose = options.verbose

    import ConfigParser

    config = ConfigParser.ConfigParser()
    config.read(configFile)
    url = config.get(
            'app:main',
            'sqlalchemy.url',
            'mysql://dbadmin:D-coD#43@localhost:3306/flx2?charset=utf8')
    if verbose:
        if system:
            name = 'system'
        else:
            name = ''
        if emails != '':
            if name == '':
                name = 'member'
            else:
                name += ' and member'
        if exportAll:
            name = 'all'
        if verbose:
            print 'Exporting %s database tables from %s to %s' % (name, url, exportFile)
    tableDict = {}
    e = Export(url)
    if exportAll:
        e.export(exportFile, func=e.getAll)
    else:
        if system:
            e.export(exportFile, tableDict=tableDict, func=e.getSystem)
        if emails != '':
            e.export(exportFile,
                    tableDict=tableDict,
                    func=e.getMembers,
                    emails=emails)
