import pymongo
import logging
from flx.lib.remoteapi import RemoteAPI
from flx.model.mongo.validationwrapper import ValidationWrapper

log = logging.getLogger(__name__)


class StandardAlignment(ValidationWrapper):
    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields = []
        self.field_dependencies = { }

    def getAutoStandardCountries(self):
        countries = dict()
        group = {'_id': {'country':'$country', 'region':'$region'}}
        
        results = self.db.standardAlignments.aggregate([{'$group': group}])
        docs = []
        if results and int(results['ok']) == 1:
           docs = results['result']
        else:
           log.error('There was an error fetching the results by aggregation group query:(%s)' %  group) 
        for doc in docs:
            rec = doc["_id"]
            if rec.get('country') and rec.get('region'):
                country , region = rec['country'], rec['region']
                countries.setdefault(country, []).append(region)
        return countries

    def getStandardAlignmentStandards(self, country, region=None, includeCountries=None):
        """
        """
        result_dict = dict()
        standards = []
        # Getall the standard names
        group = {'_id': {'countryName':'$countryName', 'countryCode':'$countryCode','region':'$region', 'standardName':'$standardName','SID':'$SID'}}
        results = self.db.standardAlignments.aggregate([{'$group': group}])
        docs = []
        if results and int(results['ok']) == 1:
           standards = results['result']
        else:
           log.error('There was an error fetching the results by aggregation group query:(%s)' %  group) 
           return result_dict

        country_filter = False
        if country and country != 'all':
            country_filter = True
        # Prepare the countries info and standard info
        items = []
        country_info = dict()
        for standard in standards:
            rec = standard["_id"]
            country_name = rec.get('countryName')
            if not country_name:
                continue
            country_code, region_name, standard_name = rec.get('countryCode'), rec.get('region'), rec.get('standardName')
            # Prepare the country info
            if includeCountries:
                if not country_info.has_key(country_name):
                    country_info[country_name] = dict()
                    country_info[country_name]['countryName'] = country_name
                    country_info[country_name]['countryCode'] = country_code
                    country_info[country_name]['regions'] = set()
                if region_name:
                    country_info[country_name]['regions'].add(region_name)
            # Prepare the standard info, filter results based on country/region
            if country_filter and country != country_name and country != country_code:
                continue
            if region and region != region_name:
                continue
            if not rec.get('region'):
                rec['region'] = 'unknown'
            items.append((country_name,region, standard_name, rec))
        # Format the countries info
        if includeCountries:
            log.info("country_info:%s" % country_info) 
            for country in country_info:
                regions = list(country_info[country]['regions'])
                regions.sort()
                country_info[country]['regions'] = regions
            country_items = country_info.items()
            country_items.sort()
            countries = [x[1] for x in country_items]
            result_dict['countries'] = countries
        # Format the standards info
        items.sort()
        standards = [item[3] for item in items]
        result_dict['standards'] = standards

        return result_dict

    def getStandardAlignmentInfo(self, sid, branch_ids=None):
        """
        """
        log.info('branch_ids:%s'%branch_ids)
        standards_info = []
        query = {'$or':[{'SID':sid}, {'standardName': sid}]}
        results = self.db.standardAlignments.find(query)
        results = [result for result in results]
        if branch_ids:
            new_results = []
            for result in results:
                concepts = result.get('relatedConcepts', [])
                new_concepts = []
                eids = set()
                for concept in concepts:
                    eid = concept.get('eid', '')
                    if eid in eids: # Do not process duplicate eids
                        continue
                    eids.add(eid)
                    br_eid = '.'.join(eid.split('.')[:2]).lower()
                    if br_eid in branch_ids:
                        new_concepts.append(concept)
                new_result = result
                new_result['relatedConcepts'] = new_concepts
                new_results.append(new_result)
            results = new_results
        child_info = {}
        l1_standards = []
        all_standards = {}
        response_fields = ['standardID', 'standardTitle', 'standardDescription', 'sequence', 'relatedConcepts']
        for result in results:
            tmp_rec = {}
            for field in response_fields:
                tmp_rec[field] = result.get(field)
            all_standards[result['standardID']] =  tmp_rec
        #all_standards = [(result['standardID'], result) for result in results]
        #all_standards = dict(all_standards)
        for result in results:
            standardID = result['standardID']
            ancestors = result.get('ancestors', [])
            if ancestors:
                key = '_'.join(ancestors)
                child_info.setdefault(key, []).append((result['sequence'], result['standardID']))
            else:
                l1_standards.append(all_standards[standardID])
        for l1_standard in l1_standards:
            l1_sid = l1_standard['standardID']
            l2_sids = child_info.get(l1_sid)
            if not l2_sids:
                continue
            l2_sids.sort()
            l1_standard['children'] = [all_standards[x[1]] for x in l2_sids]    
            for l2_standard in l1_standard['children']:
                l2_sid = l2_standard['standardID']
                l2_key  = '%s_%s' % (l1_sid, l2_sid)
                l3_sids = child_info.get(l2_key)
                if not l3_sids:
                    continue
                l3_sids.sort()
                l2_standard['children'] = [all_standards[x[1]] for x in l3_sids]
        standards_info = l1_standards 
        return standards_info


    def addAutoStandardConcept(self, sid, eid):
        query = {'standardID':sid, 'relatedConcepts.eid':eid}
        results = self.db.standardAlignments.find(query)
        results = [result for result in results]
        log.info('results:%s' %results)
        if results:
            return {'error':'The concept already exists.'}

        concept = self._getConceptInfo(eid)
        query = {'standardID':sid}
        push_query = {'$push':{'relatedConcepts':concept}}
        
        results = self.db.standardAlignments.update(query, push_query)
        log.info('Update Results:%s' %results)
        return {'concept':concept}

    def _getConceptInfo(self, eid) :
        """
        """
        concept = {'eid':eid}            
        api = 'get/info/concept/%s' % eid
        response = RemoteAPI.makeTaxonomyGetCall(api)
        response = response['response']
        for attb in ['name', 'handle', 'previewIconUrl', 'previewImageUrl']:
            if response.has_key(attb):
                concept[attb] = response[attb]
        branch_handle = response['branch']['handle']
        concept['relativeConceptUrl'] = '/%s/%s' % (branch_handle.lower(), response['handle'])            
        return concept

