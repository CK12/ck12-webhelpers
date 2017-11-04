from pylons import app_globals as g
from flx.model import api
from flx.lib.remoteapi import RemoteAPI

taxonomy_server = 'http://maverick.ck12.org/taxonomy'

def run(subject, branch):
    """
    This function will return the concept count at each level.
    It will also return count of how many of them have read(lesson) + enrichment + lecture modalities 
    """
    # Prepare the list of TypeIDs
    artifactTypesDict = g.getArtifactTypes()
    typeIDs=[artifactTypesDict['lesson'], artifactTypesDict['enrichment'], artifactTypesDict['lecture']]

    # Get all the Descendants info , till max depth 7.
    conceptCountDict = {}
    baseEID = '%s.%s' % (subject.lower(), branch.lower())
    taxonomy_api = 'get/info/descendants/concepts/%s/7' %(baseEID)
    response = RemoteAPI._makeCall(taxonomy_server, taxonomy_api, 500, params_dict={'pageSize':1000}, method='GET')
    childs = response['response']['branch']['children']
    level = 1
    def _getCounts(level, childs):
        """
        Recursive function to get the suggestions.
        """
        # We can go deep down until level 7.
        if level > 7:
            return None

        childrens = []
        modalitiesCount = 0
        for child in childs:
            encodedID = child['encodedID']
            # Get the read modalities count.
            domain = api.getBrowseTermByEncodedID(encodedID=encodedID)
            modalities = api.getRelatedArtifactsForDomains(domainIDs=[domain.id], typeIDs=typeIDs, ownedBy='ck12', pageNum=1, pageSize=10)
            if modalities:
                modalitiesCount += 1
            #modalitiesCount += len(modalities)
            # Prepare the list concepts present on next level.
            childrens.extend(child['children'])

        # Set the concept count for every level.
        key = "level_%s" % level
        conceptCountDict[key] = {'concept_count' : len(childs), 'modalities_count': modalitiesCount}

        if childrens:
            # Do recursive call.
            level = level + 1
            _getCounts(level, childrens)

    _getCounts(level, childs)
    return conceptCountDict
