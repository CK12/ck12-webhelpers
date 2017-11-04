from flx.model import api
from flx.lib import helpers as h

admin_creator_id = 3
lesson_type_id = 3

# cf. updateSubjects.py for more code on browseTerms

full_search_params = '(type:"book"^1000  OR type:"tebook"^100  OR type:"workbook"^100  OR type:"labkit"^100  OR type:"studyguide"^100  OR (type:"lesson"^5000  AND ( isPublic:"0" OR encodedID:*.1)) OR type:"section" ) AND isPublic:"1" AND (( browseTerms.ext:"%s"^400 OR browseTerms:"%s"^100 OR descendents.browseTerms.ext:"%s"^200 OR descendents.browseTerms:"%s"^100) OR (handle:"%s"^100) OR (stitle:"%s"^100 OR title:"%s"^100 OR title_cjk:"%s"^100) OR (summary:"%s"^20 OR summary_cjk:"%s"^20 OR type:%s) OR (textContent:"%s" OR textContent_cjk:"%s") OR (text:%s OR text_cjk:%s))'

def get_by_title(title):
    return SearchableArtifact(api.getArtifactByTitle(title, creatorID=3, typeName='lesson'))

def get_by_handle(handle):
    return SearchableArtifact(api.getArtifactByHandle(handle, typeID=3, creatorID=3))

def get_by_eid(eid):
    return SearchableArtifact(api.getArtifactByEncodedID(encodedID=eid))

def search(searchTerm):
    # NOTE: To match production search, fq must be set to False and 
    # *not* to the default value of an empty list []
    # Also, the typeNames must be specified rather than the default of None
    # relatedArtifacts = True instead of default False, 
    # and includeEIDs = [1] instead of default None
    hits = api.searchArtifacts(domain=None, term=searchTerm, fq=False, typeNames=[u'book', u'tebook', u'workbook', u'labkit', u'studyguide', u'lesson', u'section'], rows=10, relatedArtifacts=True, includeEIDs=[1])
    return SearchResults(hits)

class SearchResults(object):
    def __init__(self, hits):
        self.hits = hits

    def get_titles(self):
        titles = []
        for artifact in self.hits['artifactList']:
            titles.append(artifact['title'])
        return titles
    titles = property(get_titles, None)

    def __repr__(self):
        return self.titles.__repr__()

class SearchableArtifact(object):
    def __init__(self, artifact):
        self.a = artifact
        
    def get_keyword_terms(self):
        return api.getArtifactHasBrowseTermsByType(artifactID=self.a.id, browseTermTypeID=6)

    def get_keywords(self):
        terms = self.get_keyword_terms()
        keywords = []
        for term in terms:
            keywords.append(term.name)
        return keywords

    def reindex(self):
        h.reindexArtifacts(artifactIds=[self.a.id])

    def delete_term(self, term):
        api.deleteArtifactHasBrowseTerm(artifactID=self.a.id, browseTermID=term.browseTermID)

    def delete_keyword(self, keyword, reindex=True):
        self.delete_keywords([keyword], reindex=reindex)

    def delete_keywords(self, keywords, reindex=True):
        for term in self.get_keyword_terms():
            if (term.name in keywords):
                self.delete_term(term)
        if (reindex): self.reindex()

    def add_keyword(self, keyword, reindex=True):
        kwargs = {'name': keyword, 'browseTermType': 6}
        bt = api.createBrowseTerm(**kwargs)
        api.createArtifactHasBrowseTerm(artifactID=self.a.id, browseTermID=bt.id)
        if (reindex): self.reindex()

    def set_keywords(self, new_keywords):
        for term in self.get_keyword_terms():
            if (term.name not in new_keywords):
                self.delete_term(term, reindex=False)
        old_keywords = self.get_keywords()
        for keyword in new_keywords:
            if (keyword not in old_keywords):
                self.add_keyword(keyword, reindex=False)
        self.reindex()
    keywords = property(get_keywords, set_keywords)

    
    
