# -*- coding: utf-8 -*-
#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#      
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Ravi Gidwani
#
# $Id$

from flxweb.lib.remoteapi import RemoteAPI
from flxweb.model.artifact import ArtifactManager
from flxweb.model.modality import ModalityManager
#from pylons import url, request, config
import logging
from flxweb.model.browseTerm import BrowseTerm

log = logging.getLogger( __name__ )

class SearchManager( object ):
    
    SUGGESTIONS = {}
    
    @staticmethod
    def search_artifacts( type='concept', search_term=None, 
                        only_my_artifacts=False,only_has_exercises=False,
                        only_has_videos=False,only_has_attachments=False,
                        page_num=None,page_size=None,search_filter=None,sort = None,
                        return_total_count=False,special_search=False):

        try:
            if page_num:
                page_num = int( page_num )
            else:
                page_num = 1

            if not page_size:
                page_size = 10 

            results_key = 'Artifacts'
            #Bug 9618 - passed special_search as a method argument. Default value is False
            #special_search = False

            if only_has_exercises or only_has_videos or only_has_attachments:
                if search_term:  
                    search_term = '__all__:%s;' % search_term
                else:  
                    search_term = '' 
                special_search = True 

            if only_has_exercises:
                search_term = search_term + 'hasExercises:1'

            if only_has_videos:
                search_term = search_term + 'hasVideos:1'

            if only_has_attachments:
                search_term = search_term + 'hasAttachments:1'

            # Note the search API does not like a trailing slash when there is no 
            # search term. Where as mylib needs it. Hence the if else handling for
            # for each case
            if only_my_artifacts:
                search_api_url = 'search/mylib/info/%s' % (type)
                if search_term:
                    search_api_url = '%s/%s' % (search_api_url,search_term)
            else:
                search_api_url = 'search/%s/' % ( type)
                if search_term:
                    search_api_url = '%s%s' % (search_api_url,search_term)
            
            params = {'pageNum':page_num, 'pageSize':page_size, 'specialSearch':special_search}

            if search_filter:
                params['filters'] = search_filter
            else:
                params['filters'] = 'False'
           
            if sort:
                params['sort'] = sort

            # set parameters to get Related artifacts
            # i.e artifacts of different difficulty level
            params['relatedArtifacts'] = True
            params['includeEIDs'] = 1

            SearchManager.SUGGESTIONS = {}

            data = RemoteAPI.makeGetCall(search_api_url, params)
            artifacts_list = []
            if 'response' in data and \
               results_key in data['response'] and \
               'result' in data['response'][results_key] :
                    data = data['response'][results_key]
                    artifacts_list = [ArtifactManager.toArtifact(artifact) for artifact in data['result']]
                    if len(artifacts_list) == 0 and search_term in data['suggestions']:
                        SearchManager.SUGGESTIONS = data['suggestions']

        except Exception, e:
            log.exception( e )
            artifacts_list = []

        if return_total_count:
            if 'total' in data:
                total_count = data['total']
            else:
                total_count = 0
            return total_count,artifacts_list    
        else:
            return artifacts_list

    @staticmethod
    def search_modalities( type='concept', search_term=None, 
                        only_my_artifacts=False,only_has_exercises=False,
                        page_num=None,page_size=None,search_filter=None,sort = None,
                        return_total_count=False,special_search=False,ck12only=False):

        try:
            if page_num:
                page_num = int( page_num )
            else:
                page_num = 1

            if not page_size:
                page_size = 10 

            results_key = 'Artifacts'
            #Bug 9618 - passed special_search as a method argument. Default value is False
            #special_search = False
            
            if only_has_exercises:
                if search_term:  
                    search_term = '__all__:%s;hasExercises:1' % search_term
                else:  
                    search_term = '' 
                special_search = True 

            """
            if search_term:  
                search_term = '__all__:%s;' % search_term
            else:  
                search_term = '' 
            """
            # Note the search API does not like a trailing slash when there is no 
            # search term. Where as mylib needs it. Hence the if else handling for
            # for each case
            if only_my_artifacts:
                search_api_url = 'search/direct/modality/minimal/%s' % (type)
                ck12only = False
                if search_term:
                    search_api_url = '%s/%s' % (search_api_url,search_term)
            else:
                search_api_url = 'search/direct/modality/minimal/%s/' % ( type)
                if search_term:
                    search_api_url = '%s%s' % (search_api_url,search_term)
            
            params = {'pageNum':page_num, 'pageSize':page_size, 'specialSearch':special_search, 'ck12only':ck12only}
            if only_my_artifacts:
                params['mylib'] = 'true'

            if search_filter:
                params['filters'] = search_filter
            else:
                params['filters'] = 'False'
           
            if sort:
                params['sort'] = sort

            params['includeEIDs'] = 1

            SearchManager.SUGGESTIONS = {}
            artifacts_list = []

            if not search_term or len(search_term.strip()) == 0:
                return 0, artifacts_list

            data = RemoteAPI.makeGetCall(search_api_url, params)
            if 'response' in data and \
               results_key in data['response'] and \
               'result' in data['response'][results_key] :
                    data = data['response'][results_key]
                    
                    for artifact in data['result']:
                        if artifact.get('isModality') == 0:
                            artifact = ArtifactManager.toArtifact(artifact)
                            if 'section' == artifact['artifactType']:
                                artifact['modality_group'] = ModalityManager.get_modality_group_by_type(artifact['artifactType'])
                            artifacts_list.append(artifact)
                        elif artifact.get('isModality') == 1:
                            artifact = ModalityManager.to_modality_artifact(artifact)
                            artifacts_list.append(artifact)
                        else:
                            artifact = BrowseTerm(artifact)
                            artifact['modality_groups'] = []
                            if artifact['modalityCount'] != 0:
                                artifact['modality_groups'] = SearchManager.getModalityGroups(artifact['modalityCount'])
                            artifacts_list.append(artifact)
                    if len(artifacts_list) == 0 and search_term.lower() in data['suggestions']:
                        SearchManager.SUGGESTIONS = data['suggestions']

        except Exception, e:
            log.exception( e )
            artifacts_list = []

        if return_total_count:
            if 'total' in data:
                total_count = data['total']
            else:
                total_count = 0
            return total_count,artifacts_list    
        else:
            return artifacts_list


    @staticmethod
    def get_chapters_by_standards( types='concept', 
                        state='*',
                        grade='*', 
                        subject='*',
                        browse_terms=None,
                        page_num=None,
                        page_size=None,
                        include_raw_response=False):
        """
        Searches artifacts based on standards alignment.
        Note: returns artifacts grouped as new chapters
        see https://insight.ck12.org/wiki/index.php/Release_2.0_Server_Design_Specification#Search_Artifacts_By_Standard
        """
        try:
            if page_num:
                page_num = int( page_num )
            else:
                page_num = 1

            if not page_size:
                page_size = 10 

            if state == '*' and grade == '*' and subject == '*':
                raise ValueError('You must specify at least one state or grade or subject') 

            results_key = 'Artifacts'
        
            search_api_url = 'search/standard/%s/%s/%s/%s' % (types,state,grade,subject)

            if browse_terms:
                search_api_url = '%s/%s' % (','.join(browse_terms))

            params = {'pageNum':page_num, 'pageSize':page_size}
            data = RemoteAPI.makeGetCall(search_api_url, params)
            artifacts_list = []
            if 'response' in data and \
               results_key in data['response'] and \
               'result' in data['response'][results_key]:
                    data = data['response'][results_key]
                    for artifact in data['result']:
                        artifact['artifactType'] = ArtifactManager.ARTIFACT_TYPE_CHAPTER
                        artifact['title'] = artifact['chapterTitle']
                        artifact['artifactRevisionID'] = 'new'
                        artifact['children'] = artifact['artifacts']
                        del artifact['artifacts']
                        artifact['xhtml'] = ''
                    artifacts_list = [ArtifactManager.toArtifact(artifact) for artifact in data['result']]
            if include_raw_response:
                return data,artifacts_list
            else:
                return artifacts_list
        except Exception, e:
            log.exception( e )
            #else all return nothing
            if include_raw_response:
                return None, None
            else:
                return None

    @staticmethod
    def search_artifacts_by_standards( types='concept', 
                        state='*',
                        grade='*', 
                        subject='*',
                        browse_terms=None,
                        page_num=None,
                        page_size=None,
                        include_raw_response=False):
        """
        Searches artifacts based on standards alignment.
        Note: returns artifacts grouped as new chapters
        see https://insight.ck12.org/wiki/index.php/Release_2.0_Server_Design_Specification#Search_Artifacts_By_Standard
        """
        try:
            if page_num:
                page_num = int( page_num )
            else:
                page_num = 1

            if not page_size:
                page_size = 10 

            if state == '*' and grade == '*' and subject == '*':
                raise ValueError('You must specify at least one state or grade or subject') 

            results_key = 'Artifacts'
        
            search_api_url = 'search/standard/%s/%s/%s/%s' % (types,state,grade,subject)

            if browse_terms:
                search_api_url = '%s/%s' % (','.join(browse_terms))

            params = {'pageNum':page_num, 'pageSize':page_size}
            data = RemoteAPI.makeGetCall(search_api_url, params)
            artifacts_list = []
            if 'response' in data and \
               results_key in data['response'] and \
               'result' in data['response'][results_key]:
                    data = data['response'][results_key]
                    for item in data['result']:
                        for artifact in item['artifacts']:
                            artifacts_list.append(ArtifactManager.toArtifact(artifact))
            if include_raw_response:
                return data,artifacts_list
            else:
                return artifacts_list
        except Exception, e:
            log.exception( e )
            #else all return nothing
            return None

    @staticmethod
    def search_hints(term, field=None, page_num=None, page_size=None):
        try:
            if page_num:
                page_num = int( page_num )
            else:
                page_num = 1
            
            if not page_size:
                page_size = 10 
            if not field:
                field='title'
            types = 'book,domain,labkit,tebook,workbook'
            search_api_url = 'search/hints/%s/%s/%s' % (types, field, term)
            params = {'pageNum':page_num, 'pageSize':page_size}
            data = RemoteAPI.makeGetCall(search_api_url, params)
            hints_list = []
            if 'response' in data and 'hits' in data['response']:
                hints_list = data['response']['hits']
            return hints_list
        except Exception, e:
            log.exception(e)
            return None

    @staticmethod
    def getModalityGroups(modalityCount):
        modality_groups = ModalityManager.get_modality_groups()
        modality_types = modalityCount.keys();
        total_modality_count = 0
        # number of groups to be displayed on search results page
        display_group_count = 5

        my_modality_groups = []
        for mType in modality_types:
            if sum (modalityCount[mType].values()) > 0:
                total_modality_count += sum (modalityCount[mType].values())
                for mGroup in modality_groups:
                    if mGroup.has_modality(mType):
                        if mGroup not in my_modality_groups:
                            if my_modality_groups.__len__() < (display_group_count - 1):
                                my_modality_groups.append(mGroup)
                        break
        # All Modalities is default group in 
        all_mod_group = ModalityManager.get_modality_group_by_type('__ALL__')
        all_mod_group['total_modality_count'] = total_modality_count
        my_modality_groups.append(all_mod_group)

        my_modality_groups = sorted(my_modality_groups, cmp=lambda x,y: cmp(x.get('sequence'), y.get('sequence')))
        return my_modality_groups
