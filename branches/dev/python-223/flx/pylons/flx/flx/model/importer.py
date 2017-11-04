import logging
import os

from sqlalchemy.exc import IntegrityError

from flx.model import meta
from flx.model.migrate import Migrate

log = logging.getLogger(__name__)

class Import(Migrate):
    """
        Import from the Json file that was exported from another flx release 2
        database.
    """

    aloneDict = {
        # key: table name, index column name(s).
        'ActionTypes': [ meta.ActionTypes, 'id', 'name' ],
        'ArtifactTypes': [ meta.ArtifactTypes, 'id', 'name' ],
        'BrowseTermTypes': [ meta.BrowseTermTypes, 'id', 'name' ],
        'Countries': [ meta.Countries, 'id', 'code2Letter' ],
        'EmbeddedObjectProviders': [ meta.EmbeddedObjectProviders, 'id', 'domain' ],
        'Grades': [ meta.Grades, 'id', 'name' ],
        'Groups': [ meta.Groups, 'id', [ 'parentID', 'name' ] ],
        'Languages': [ meta.Languages, 'id', 'code' ],
        'MathImage': [ meta.MathImage, None, None ],
        'MemberAuthTypes': [ meta.MemberAuthTypes, 'id', 'name' ],
        'MemberStates': [ meta.MemberStates, 'id', 'name' ],
        'ResourceTypes': [ meta.ResourceTypes, 'id', 'name' ],
        'Subjects': [ meta.Subjects, 'id', 'name' ],
        'USAddresses': [ meta.USAddresses, 'id', None ],
        'USStates': [ meta.USStates, None, None ],
        'USZipCodes': [ meta.USZipCodes, None, None ],
        'WorkDirectory': [ meta.WorkDirectory, 'id', None ],
    }
    noDepSet = frozenset([
        'MathImage',
        'USStates',
        'USZipCodes',
        'WorkDirectory',
    ])
    indexDicts = {}

    def _getIndexValue(self, index, row):
        """
            Get the value of row[index]. If index is complex, concatenate
            the value separated by '+'.
        """
        if index is None:
            return None
        if type(index) is not list:
            value = row[index]
        else:
            value = ''
            for item in index:
                if value != '':
                    value += '+'
                if row.has_key(item) and row[item] is not None:
                    value += str(row[item])
        return value

    def _updatePrimary(self, table, primary, index, indexDict, where=None):
        """
            Replace value of primary key in row and indexDict with the newly
            created ones for the given table. The parameter, index, is
            used to locate the entry in indexDict.
        """
        rows = self.getTable(table, where=where, order=primary)
        for row in rows:
            value = self._getIndexValue(index, row)
            if indexDict.has_key(value):
                indexDict[value][primary] = row[primary]

    def _processAlone(self, tables):
        """
            Process the alone tables.
        """
        keys = sorted(tables.keys())
        for key in keys:
            if self.aloneDict.has_key(key):
                keep = key not in self.noDepSet
                table, primary, index = self.aloneDict[key]
                if verbose:
                    print 'Processing table[%s]' % table.fullname
                if not tables.has_key(key):
                    return

                rows = tables[key]
                rowDict = {}
                indexDict = {}
                if len(rows) > 0:
                    for row in rows:
                        if primary is not None:
                            if keep:
                                rowDict[row[primary]] = row
                                if index is not None:
                                    value = self._getIndexValue(index, row)
                                    indexDict[value] = row
                            del row[primary]
                    self._insert(table.insert(), rows)
                    #
                    #  Replace primary key with the newly created one.
                    #
                    if primary is not None:
                        if index is not None:
                            self._updatePrimary(table, primary, index, indexDict)
                        else:
                            rowList = self.getTable(table, order=primary)
                            for n in range(0, len(rows)):
                                rows[n][primary] = rowList[n][primary]
                if keep:
                    self.dicts[key] = rowDict
                    self.indexDicts[key] = indexDict
                del tables[key]

    def _remove(self, row, key, idName, table):
        """
            Remove the key from the given row and replace it by the idName.
        """
        value = row[key]
        del row[key]
        id = value['id']
        tableName = table.fullname
        try:
            if not self.dicts.has_key(tableName):
                relations, d = self.getTable(table, includeDict=True)
                self.dicts[tableName] = d
            row[idName] = self.dicts[tableName][id]['id']
        except Exception, e:
            print 'tableName[%s]' % tableName
            print 'id[%s]' % id
            print 'dict[%s]' % self.dicts[tableName]
            print 'item[%s]' % self.dicts[tableName][id]
            raise e
        return row

    def _insert(self, insertFunc, relations, isRow=False):
        try:
            self.connection.execute(insertFunc, relations)
        except IntegrityError, e:
            if isRow:
                if verbose:
                    print 'Skipped relations[%s]' % relations
                return

            for relation in relations:
                try:
                    self.connection.execute(insertFunc, relation)
                except IntegrityError, ie:
                    if verbose:
                        print 'Skipped relation[%s]' % relation
                except Exception, ex:
                    print '_insert Exception relation[%s] relations[%s]' % (relation, relations)
                    raise ex

    def _processAccessControls(self, tables):
        """
            Process the AccessControls table.
        """
        table = meta.AccessControls
        key = table.fullname
        if verbose:
            print 'Processing table[%s]' % key
        if not tables.has_key(key):
            return

        rows = tables[key]
        if len(rows) > 0:
            for row in rows:
                self._remove(row, 'actionType', 'actionTypeID', meta.ActionTypes)
                self._remove(row, 'role', 'roleID', meta.MemberRoles)
            self._insert(table.insert(), rows)
        del tables[key]

    def _processStandardBoards(self, tables):
        """
            Process the StandardBoards table.
        """
        table = meta.StandardBoards
        key = table.fullname
        if verbose:
            print 'Processing table[%s]' % key
        if not tables.has_key(key):
            return

        rows = tables[key]
        primary = 'id'
        index = 'name'
        self.dicts[key] = rowDict = {}
        self.indexDicts[key] = indexDict = {}
        if len(rows) > 0:
            for row in rows:
                id = row[primary]
                self._remove(row, 'country', 'countryID', meta.Countries)
                rowDict[id] = row
                indexDict[row[index]] = row
                del row[primary]
            self._insert(table.insert(), rows)
            self._updatePrimary(table, primary, index, indexDict)
        del tables[key]

    def _processMemberRoles(self, tables):
        """
            Process the MemberRoles table.
        """
        table = meta.MemberRoles
        key = table.fullname
        if verbose:
            print 'Processing table[%s]' % table.fullname
        if not tables.has_key(key):
            return

        rows = tables[key]
        primary = 'id'
        index = 'name'
        self.dicts[key] = rowDict = {}
        self.indexDicts[key] = indexDict = {}
        if len(rows) > 0:
            for row in rows:
                id = row[primary]
                self._remove(row, 'group', 'groupID', meta.Groups)
                rowDict[id] = row
                indexDict[row[index]] = row
                del row[primary]
            self._insert(table.insert(), rows)
            self._updatePrimary(table, primary, index, indexDict)
        del tables[key]

    def _processAddresses(self, tables):
        """
            Process the Addresses table.
        """
        table = meta.Addresses
        key = table.fullname
        if verbose:
            print 'Processing table[%s]' % key
        if not tables.has_key(key):
            return

        rows = tables[key]
        if len(rows) > 0:
            for row in rows:
                self._remove(row, 'address', 'addressID', meta.USAddresses)
                self._remove(row, 'group', 'groupID', meta.Groups)
                self._remove(row, 'country', 'countryID', meta.Countries)
            self._insert(table.insert(), rows)
        del tables[key]

    def _processStandards(self, tables):
        """
            Process the Standards table.
        """
        table = meta.Standards
        key = table.fullname
        if verbose:
            print 'Processing table[%s]' % key
        if not tables.has_key(key):
            return

        rows = tables[key]
        primary = 'id'
        index = [ 'standardBoardID', 'subjectID', 'section' ]
        self.dicts[key] = rowDict = {}
        self.indexDicts[key] = indexDict = {}
        if len(rows) > 0:
            gradeList = []
            for row in rows:
                id = row[primary]
                self._remove(row, 'standardBoard', 'standardBoardID', meta.StandardBoards)
                self._remove(row, 'subject', 'subjectID', meta.Subjects)
                rowDict[id] = row
                value = self._getIndexValue(index, row)
                indexDict[value] = row
                #
                #  Remember the grades for processing later.
                #
                if row.has_key('grades'):
                    gradeDict = row['grades']
                    del row['grades']
                    grades = sorted(gradeDict.keys())
                    for grade in grades:
                        sg = {
                            'gradeID': gradeDict[grade]['id'],
                            'standardID': id,
                        }
                        gradeList.append(sg)
                del row[primary]
            self._insert(table.insert(), rows)
            self._updatePrimary(table, primary, index, indexDict)
            #
            #  Process StandardHasGrades table.
            #
            if len(gradeList) > 0:
                for grade in gradeList:
                    id = grade['standardID']
                    id = rowDict[id][primary]
                    grade['standardID'] = id
                self._insert(meta.StandardHasGrades.insert(), gradeList)

        del tables[key]

    def _processBrowseTerms(self, tables):
        """
            Process the BrowseTerms table.
        """
        table = meta.BrowseTerms
        key = table.fullname
        if verbose:
            print 'Processing table[%s]' % key
        if not tables.has_key(key):
            return

        rows = tables[key]
        primary = 'id'
        index = [ 'name', 'parentID', 'termTypeID' ]
        self.dicts[key] = rowDict = {}
        self.indexDicts[key] = indexDict = {}
        synonymDict = {}
        if len(rows) > 0:
            for row in rows:
                self._remove(row, 'termType', 'termTypeID', meta.BrowseTermTypes)
                id = row['parentID']
                if id is not None:
                    row['parentID'] = rowDict[id]['id']
                    del row['parent']
                id = row[primary]
                rowDict[id] = row
                value = self._getIndexValue(index, row)
                indexDict[value] = row
                #
                #  Because of the self referencing (parentID), we need to
                #  insert one by one.
                #
                self._insert(table.insert(), row, isRow=True)
                self._updatePrimary(table, primary, index, indexDict, where=((table.c.name == row['name']) & (table.c.parentID == row['parentID']) & (table.c.termTypeID == row['termTypeID'])))

            for row in rows:
                if row.has_key('requiredDomains'):
                    domains = row['requiredDomains']
                    del row['requiredDomains']
                    domainList = []
                    id = row['id']
                    for domain in domains:
                        domainList.append({
                                            'domainID': id,
                                            'requiredDomainID': domain['id'],
                                          })
                    self._insert(meta.DomainNeighbors.insert(), domainList)
                if row.has_key('candidates'):
                    candidates = row['candidates']
                    del row['candidates']
                    if len(candidates) == 0:
                        break
                    self._insert(meta.BrowseTermCandidates.insert(), candidates)
                if row.has_key('synonyms'):
                    synonyms = row['synonyms']
                    del row['synonyms']
                    id = row['id']
                    synonymDict[id] = synonyms
            for row in rows:
                id = row['id']
                if len(synonymDict) > 0 and synonymDict.has_key(id):
                    synonyms = synonymDict[id]
                    synonymList = []
                    for synonym in synonyms:
                        synID = synonym['id']
                        synonymList.append({
                                            'termID': id,
                                            'synonymTermID': synID,
                                           })
                    self._insert(meta.BrowseTermHasSynonyms.insert(),
                                 synonymList)
        del tables[key]

    def _processMembers(self, tables):
        """
            Process the Members table.
        """
        table = meta.Members
        key = table.fullname
        if verbose:
            print 'Processing table[%s]' % key
        if not tables.has_key(key):
            return

        rows = tables[key]
        primary = 'id'
        index = 'email'
        extList = []
        approvalList = []
        groupList = []
        self.dicts['Members'] = rowDict = {}
        self.indexDicts['Members'] = indexDict = {}
        for row in rows:
            id = row['id']
            self._remove(row, 'state', 'stateID', meta.MemberStates)
            if row.has_key('groups'):
                groups = row['groups']
                for group in groups:
                    self._remove(group, 'role', 'roleID', meta.MemberRoles)
                    groupList.append(group)
                del row['groups']
            if row.has_key('extData'):
                extData = row['extData']
                for ext in extData:
                    self._remove(ext, 'authType', 'authTypeID', meta.MemberAuthTypes)
                    extList.append(ext)
                del row['extData']
            if row.has_key('approvals'):
                approvals = row['approvals']
                for approval in approvals:
                    approvalList.append(approval)
                del row['approvals']
            del row['id']
            rowDict[id] = row
            value = self._getIndexValue(index, row)
            indexDict[value] = row
        self._insert(table.insert(), rows)
        self._updatePrimary(table, primary, index, indexDict)

        for group in groupList:
            id = group['memberID']
            group['memberID'] = rowDict[id]['id']
        self._insert(meta.GroupHasMembers.insert(), groupList)
        for ext in extList:
            id = ext['memberID']
            ext['memberID'] = rowDict[id]['id']
        self._insert(meta.MemberExtData.insert(), extList)
        if len(approvalList) > 0:
            for approval in approvalList:
                id = approval['memberID']
                approval['memberID'] = rowDict[id]['id']
            self._insert(meta.MemberAuthApprovals.insert(), approvalList)

    def _processResources(self, tables):
        """
            Process the Resources table.
        """
        table = meta.Resources
        key = table.fullname
        if verbose:
            print 'Processing table[%s]' % key
        if not tables.has_key(key):
            return

        rows = tables[key]
        primary = 'id'
        index = [ 'uri', 'ownerID' ]
        extDict = {}
        rExtDict = {}
        indexDict = {}
        revisionList = []
        reportList = []
        embObjectList = []
        for row in rows:
            id = row['id']
            self._remove(row, 'language', 'languageID', meta.Languages)
            self._remove(row, 'owner', 'ownerID', meta.Members)
            self._remove(row, 'resourceType', 'resourceTypeID', meta.ResourceTypes)
            if row.has_key('embObjects'):
                embObjects = row['embObjects']
                for embObject in embObjects:
                    self._remove(embObject,
                                'provider',
                                'providerID',
                                meta.EmbeddedObjectProviders)
                    embObjectList.append(embObject)
            revisions = row['revisions']
            del row['revisions']
            for revision in revisions:
                if revision.has_key('abuseReports'):
                    reports = row['abuseReports']
                    del row['abuseReports']
                    for report in reports:
                        self._remove(report, 'reporter' 'reporterID', meta.Members)
                        self._remove(report, 'reviewer' 'reviewerID', meta.Members)
                        reportList.append(report)
                rExtDict[revision[primary]] = revision
                revisionList.append(revision)
            extDict[id] = row
            value = self._getIndexValue(index, row)
            indexDict[value] = row
        self._insert(table.insert(), rows)
        self._updatePrimary(table, primary, index, indexDict)
        if len(embObjectList) > 0:
            for embObject in embObjectList:
                id = embObject['resourceID']
                embObject['resourceID'] = extDict[id][primary]
                del embObject[primary]
            self._insert(meta.EmbeddedObjects.insert(), embObjects)
        for revision in revisionList:
            id = revision['resourceID']
            revision['resourceID'] = extDict[id][primary]
        self._insert(meta.ResourceRevisions.insert(), revisionList)
        if len(reportList) > 0:
            for report in reportList:
                id = report['resourceRevisionID']
                report['resourceRevisionID'] = rExtDict[id][primary]
            self._insert(meta.AbuseReports.insert(), reportList)

    def _processArtifacts(self, tables):
        """
            Process the Artifacts table.
        """
        table = meta.Artifacts
        key = table.fullname
        if verbose:
            print 'Processing table[%s]' % key
        if not tables.has_key(key):
            return

        rows = tables[key]
        primary = 'id'
        index = [ 'handle', 'creatorID', 'artifactTypeID' ]
        extDict = {}
        indexDict = {}
        rTable = meta.ArtifactRevisions
        rIndex = [ 'artifactID', 'revision' ]
        rExtDict = {}
        rIndexDict = {}
        revisionList = []
        overlayList = []
        annotationList = []
        authorList = []
        termList = []
        favoriteList = []
        feedbackList = []
        childList = []
        resourceList = []
        standardList = []
        featuredList = []
        groupList = []
        viewedByList = []
        sharedByList = []
        for row in rows:
            id = row[primary]
            self._remove(row, 'type', 'artifactTypeID', meta.ArtifactTypes)
            self._remove(row, 'creator', 'creatorID', meta.Members)
            extDict[id] = row
            value = self._getIndexValue(index, row)
            indexDict[value] = row
            if row.has_key('authors'):
                authors = row['authors']
                del row['authors']
                for author in authors:
                    authorList.append(author)
            if row.has_key('featured'):
                featured = row['featured']
                del row['featured']
                featuredList.append(featured)
            if row.has_key('groups'):
                groups = row['groups']
                del row['groups']
                for group in groups:
                    groupList.append({
                                        'groupID': group['id'],
                                        'artifactID': id,
                                     })
            if row.has_key('viewedBy'):
                viewedBy = row['viewedBy']
                del row['viewedBy']
                for viewer in viewedBy:
                    member = viewer['member']
                    del viewer['member']
                    viewedByList.append(viewer)
            if row.has_key('sharedBy'):
                sharedBy = row['sharedBy']
                del row['sharedBy']
                for share in sharedBy:
                    member = share['role']
                    del share['role']
                    member = share['member']
                    del share['member']
                    sharedByList.append(share)
            if row.has_key('overlays'):
                overlays = row['overlays']
                del row['overlays']
                for overlay in overlays:
                    if overlay.has_key('annotations'):
                        annotations = overlay['annotations']
                        del overlay['annotations']
                        for annotation in annotations:
                            annotationList.append(annoatation)
                    owner = overlay['owner']
                    del overlay['owner']
                    overlayList.append(overlay)
            if row.has_key('browseTerms'):
                browseTerms = row['browseTerms']
                del row['browseTerms']
                for term in browseTerms:
                    termList.append({
                                        'artifactID': id,
                                        'browseTermID': term['id'],
                                    })
            revisions = row['revisions']
            del row['revisions']
            for revision in revisions:
                id = revision[primary]
                rExtDict[id] = revision
                value = self._getIndexValue(rIndex, revision)
                rIndexDict[value] = revision
                if revision.has_key('favoriteList'):
                    favorites = revision['favoriteList']
                    del revision['favoriteList']
                    for favorite in favorites:
                        member = favorite['member']
                        del favorite['member']
                        favoriteList.append(favorite)
                if revision.has_key('feedbacks'):
                    feedbacks = revision['feedbacks']
                    del revision['feedbacks']
                    for feedback in feedbacks:
                        member = feedback['member']
                        del feedback['member']
                        feedbackList.append(feedback)
                if revision.has_key('children'):
                    children = revision['children']
                    del revision['children']
                    for child in children:
                        del child['revision']
                        childList.append(child)
                if revision.has_key('resourceRevisions'):
                    resourceRevisions = revision['resourceRevisions']
                    del revision['resourceRevisions']
                    for resourceRevision in resourceRevisions:
                        rid = resourceRevision['id']
                        resourceList.append({
                                                'artifactRevisionID': id,
                                                'resourceRevisionID': rid,
                                            })
                if revision.has_key('standards'):
                    standards = revision['standards']
                    del revision['standards']
                    for standard in standards:
                        standardList.append({
                                                'artifactRevisionID': id,
                                                'standardID': standard['id'],
                                            })
                revisionList.append(revision)
        self._insert(table.insert(), rows)
        self._updatePrimary(table, primary, index, indexDict)
        self._insert(meta.ArtifactAuthors.insert(), authorList)
        for author in authorList:
            id = author['artifactID']
            author['artifactID'] = extDict[id][primary]
        self._insert(meta.ArtifactHasBrowseTerms.insert(), termList)
        for term in termList:
            id = term['artifactID']
            term['artifactID'] = extDict[id][primary]
        self._insert(meta.ArtifactRevisions.insert(), revisionList)
        for revision in revisionList:
            id = revision['artifactID']
            revision['artifactID'] = extDict[id][primary]
        if len(featuredList) > 0:
            for featured in featuredList:
                id = featured['artifactID']
                featured['artifactID'] = extDict[id][primary]
            self._insert(metaFeaturedArtifacts.insert(), featuredList)
        if len(groupList) > 0:
            for group in groupList:
                id = group['artifactID']
                group['artifactID'] = extDict[id][primary]
            self._insert(meta.GroupHasArtifacts.insert(), groupList)
        if len(viewedByList) > 0:
            for viewedBy in viewedByList:
                id = viewedBy['artifactID']
                viewedBy['artifactID'] = extDict[id][primary]
            self._insert(meta.MemberViewedArtifacts.insert(), viewedByList)
        if len(sharedByList) > 0:
            for sharedBy in sharedByList:
                id = sharedBy['artifactID']
                sharedBy['artifactID'] = extDict[id][primary]
            self._insert(meta.SharedArtifacts.insert(), sharedByList)

        self._updatePrimary(rTable, primary, rIndex, rIndexDict)
        if len(childList) > 0:
            for child in childList:
                id = child['artifactRevisionID']
                child['artifactRevisionID'] = rExtDict[id][primary]
            self._insert(meta.ArtifactRevisionRelations.insert(), childList)
        '''if len(feedbackList) > 0:
            for feedback in feedbackList:
                id = feedback['artifactRevisionID']
                feedback['artifactRevisionID'] = rExtDict[id][primary]
            self._insert(meta.ArtifactRevisionFeedbacks.insert(), feedbackList)'''
        if len(favoriteList) > 0:
            for favorite in favoriteList:
                id = favorite['artifactRevisionID']
                favorite['artifactRevisionID'] = rExtDict[id][primary]
            self._insert(meta.ArtifactRevisionFavorites.insert(), favoriteList)
        if len(resourceList) > 0:
            for resource in resourceList:
                id = resource['artifactRevisionID']
                resource['artifactRevisionID'] = rExtDict[id][primary]
            self._insert(meta.ArtifactRevisionHasResources.insert(),
                         resourceList)
        if len(standardList) > 0:
            for standard in standardList:
                id = standard['artifactRevisionID']
                standard['artifactRevisionID'] = rExtDict[id][primary]
            self._insert(meta.ArtifactRevisionHasStandards.insert(),
                         standardList)

    def processAll(self, tables):
        """
            Import from the given tables.
        """
        self._processAlone(tables)
        self._processStandardBoards(tables)
        self._processMemberRoles(tables)
        self._processAccessControls(tables)
        self._processAddresses(tables)
        self._processStandards(tables)
        self._processBrowseTerms(tables)
        self._processMembers(tables)
        self._processResources(tables)
        self._processArtifacts(tables)

    def _load(self, file):
        """
            Load the data from the given file handle.
        """
        import json

        return json.load(file)

    def importAll(self, path):
        """
            Import from the given file identified by path.
        """
        if not os.path.exists(path):
            print 'path[%s] does not exist.' % path
            return os.errno.ENOENT

        file = open(path, 'r')
        try:
            tables = self._load(file)
            self.processAll(tables)
            return 0
        finally:
            file.close()

if __name__ == "__main__":
    import optparse

    sourceFile = '/tmp/flx2.json'
    url = 'mysql://dbadmin:D-coD#43@localhost:3306/flx2import?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--dest', dest='url', default=url,
        help='The URL for connecting to the database. Defaults to %s' % url
    )
    parser.add_option(
        '-f', '--source-file', dest='sourceFile', default=sourceFile,
        help='Location of the file to be imported. Defaults to %s' % sourceFile
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    sourceFile = options.sourceFile
    url = options.url
    verbose = options.verbose

    if verbose:
        print 'Importing database tables from %s to %s' % (sourceFile, url)
    Import(url).importAll(sourceFile)
