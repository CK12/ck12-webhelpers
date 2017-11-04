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
# This file originally written by Girish Vispute
#
# $Id:$

from xml.dom import minidom
from pylons import config
from flxweb.model.ck12model import CK12Model
import logging
import re
from flxweb.lib.ck12.decorators import ck12_cache_region
from pylons.i18n.translation import _ 
import os
from time import strftime
from flxweb.lib.ck12.decorators import trace
log = logging.getLogger( __name__ )


class Modality(CK12Model):
    '''
        Modality
    '''
    
    def __init__(self, dict_obj=None):
        '''
        Initialize the object
        '''
        CK12Model.__init__(self, dict_obj=dict_obj)

class ModalityConfigurationManager():
    
    processed_modalities = None
    processed_modality_groups = None
    docElement = None
    @staticmethod
    #@trace
    def getHandles():
        try:
            ModalityConfigurationManager.docElement = minidom.parse(config.get('modality_configuration_path').strip())
            modality_conf = ModalityConfigurationManager.docElement.getElementsByTagName('ModalitiesConfig')
            ModalityConfigurationManager.modalities = modality_conf[0].getElementsByTagName('Modalities')[0].getElementsByTagName('Modality')
            ModalityConfigurationManager.modality_groups = modality_conf[0].getElementsByTagName('ModalityGroups')[0].getElementsByTagName('group')
        except Exception, e:
            log.error((_(u'Error parsing modalities configuration. Invalid xml format : %s' % (str(e)))).encode("utf-8"))
            raise e

    @staticmethod
    #@trace
    def get_modalities():
        """
            return the configuration for modalities
        """
        modalities = ModalityConfigurationManager.processed_modalities or ModalityConfigurationManager.get_modalities_all_configuration()['modalities'] 
        return modalities

    @staticmethod
    #@trace
    def get_modality_groups():
        """
            return the configuration for modality groups
        """
        groups = ModalityConfigurationManager.processed_modality_groups or ModalityConfigurationManager.get_modalities_all_configuration()['modality_groups']
        return groups
    
    @staticmethod
    #@trace
    def get_all_modality_names():
        """
            returns all modality names
        """
        if not ModalityConfigurationManager.modalities:
            ModalityConfigurationManager.getHandles()
        modality_name_list = []
        for modality in ModalityConfigurationManager.modalities:
            modality_name = modality.getAttribute('name').strip()
            modality_name_list.append(modality_name)
        return modality_name_list
        
    @staticmethod
    @ck12_cache_region('forever', invalidation_key='modalityconfig')
    #@trace
    def get_modalities_all_configuration():
        """
           parse the configuration from xml and create modality and groups settings
        """
        
        modality_dict = {}
        modality_conf = {}
        groups_list = []
        
        if ModalityConfigurationManager.processed_modalities and ModalityConfigurationManager.processed_modality_groups:
            modality_conf['modalities'] = ModalityConfigurationManager.processed_modalities
            modality_conf['modality_groups'] = ModalityConfigurationManager.processed_modality_groups
            return modality_conf
        
        log.debug("reading modality configuration file")
        ModalityConfigurationManager.getHandles()
        for modality in ModalityConfigurationManager.modalities:
            modality_name = modality.getAttribute('name').strip()
            param_list = modality.getElementsByTagName('Param')
            dict_obj = {}
            for param in param_list:
                try:
                    name = param.getElementsByTagName('Name')[0].firstChild.nodeValue
                    value = param.getElementsByTagName('Value')[0].firstChild.nodeValue
                    if re.search("^-?[0-9]+$",value) :
                        value = int(value)
                    elif value.lower() == 'true':
                        value = True
                    elif value.lower() == 'false':
                        value = False
                    dict_obj[name] = value
                except Exception, e:
                    log.error((_(u'Error modalities configuration: %s ' % (str(e)))).encode("utf-8"))
            modality_dict[modality_name] = Modality(dict_obj=dict_obj)
        modality_conf['modalities'] = ModalityConfigurationManager.processed_modalities = modality_dict
        
        for groups in ModalityConfigurationManager.modality_groups:
            try:
                group_dict = {}
                params = groups.getElementsByTagName('Params')[0]
                artifact_type = params.getElementsByTagName('artifact_types')[0]
                artifact_type_list = []
                try:
                    for art_type in artifact_type.getElementsByTagName('type'):
                        artifact_type_list.append(art_type.firstChild.nodeValue)
                except Exception,e:
                    log.error((_(u'Error modalities group configuration: %s ' % (str(e)))).encode("utf-8"))
                group_dict['artifact_types'] = artifact_type_list
                param_list = params.getElementsByTagName('Param')
                for param in param_list:
                    try:
                        name = param.getElementsByTagName('Name')[0].firstChild.nodeValue
                        value = param.getElementsByTagName('Value')[0].firstChild.nodeValue
                        if re.search("^-?[0-9]+$",value) :
                            value = int(value)
                        elif value.lower() == 'true':
                            value = True
                        elif value.lower() == 'false':
                            value = False
                        group_dict[name] = value
                    except Exception,e:
                        log.error((_(u'Error modalities group configuration: %s ' % (str(e)))).encode("utf-8"))
                groups_list.append(group_dict)
            except Exception,e:
                    log.error((_(u'Error modalities group configuration: %s ' % (str(e)))).encode("utf-8"))
        modality_conf['modality_groups'] = ModalityConfigurationManager.processed_modality_groups = groups_list
    
        return modality_conf
    
    @staticmethod
    def update_modalities_configuration(modality_conf=None):
        """
            update the configuration for modalities
        """
        response = {}
        ModalityConfigurationManager.getHandles()
        try :
            cofiguration_changed = False
            for modality in ModalityConfigurationManager.modalities:
                org_name = modality.getAttribute('name').strip()
                Modalityindex = -1
                try:
                    Modalityindex = next(index for (index, moda_dict) in enumerate(modality_conf) if moda_dict['name'].strip() == org_name)
                except Exception,e:
                    Modalityindex = -1
                if Modalityindex >= 0:
                    params_list = modality.getElementsByTagName('Param')
                    for param in params_list:
                        name = param.getElementsByTagName('Name')[0]
                        nodeValue = name.firstChild.nodeValue
                        value = param.getElementsByTagName('Value')[0]
                        if modality_conf[Modalityindex][nodeValue] !=  value.firstChild.nodeValue :
                            cofiguration_changed = True
                            value.firstChild.nodeValue =  modality_conf[Modalityindex][nodeValue]
            try :
                if cofiguration_changed == True:
                    ModalityConfigurationManager.create_configuration_backup()
                    f = open(config.get('modality_configuration_path').strip(), 'w')
                    ModalityConfigurationManager.docElement.writexml(f,encoding = 'UTF-8')
                    f.close()
                else:
                    response['status'] = (_(u'error' )).encode("utf-8")
                    response['message'] = (_(u'No changes made.' )).encode("utf-8")
                    return response
            except Exception, e:
                log.error((_(u'Error writing to xml: %s' % (str(e)))).encode("utf-8"))
                response['status'] = (_(u'error' )).encode("utf-8")
                response['message'] = (_(u'Error : %s' % (str(e)))).encode("utf-8")
                return response
        except Exception, e:
            log.error((_(u'Error updating settings: %s' % (str(e)))).encode("utf-8"))
            response['status'] = (_(u'error')).encode("utf-8")
            response['message'] = (_(u'Error : %s' % (str(e)))).encode("utf-8")
            return response
        response['status'] = (_(u'success' )).encode("utf-8")
        response['message'] = (_(u'Settings changed.' )).encode("utf-8")
        return response
    
    @staticmethod
    def update_groups_configuration(group_conf=None):
        """
            update the configuration for modality groups
        """
        group_key = 'group_name'
        response = {}
        ModalityConfigurationManager.getHandles()
        modality_list = ModalityConfigurationManager.get_all_modality_names()
        for group in ModalityConfigurationManager.modality_groups:
            params = group.getElementsByTagName('Params')[0]
            param_list = params.getElementsByTagName('Param')
            Modalityindex = -1
            for param in param_list:
                try:
                    Modalityindex = next(index for (index, moda_dict) in enumerate(group_conf) if moda_dict[group_key].strip() == param.getElementsByTagName('Value')[0].firstChild.nodeValue.strip())
                    break
                except Exception,e:
                    Modalityindex = -1
            if Modalityindex >= 0:
                for param in param_list :
                    name = param.getElementsByTagName('Name')[0]
                    nodeValue = name.firstChild.nodeValue
                    value = param.getElementsByTagName('Value')[0]
                    #On UI group_classname is shown as read only so don't update group_classname value
                    if group_conf[Modalityindex][nodeValue] != value.firstChild.nodeValue and nodeValue != 'group_classname':
                        value.firstChild.nodeValue =  group_conf[Modalityindex][nodeValue]
                #remove newline and tabs before adding any new node
                params.removeChild(params.childNodes[0])
                params.removeChild(params.getElementsByTagName('artifact_types')[0])
                artifact_types = ModalityConfigurationManager.docElement.createElement("artifact_types")
                artifact_list = group_conf[Modalityindex]['artifact_types'].split(',')
                artifact_list = [artifact_type.strip() for artifact_type in artifact_list]
                hasAllType = False
                hasOtherType = False
                if u'__ALL__' in artifact_list :
                    hasAllType = True
                if u'__OTHER__' in artifact_list :
                    hasOtherType = True
                artifact_list = list(set(modality_list).intersection(set(artifact_list)))
                if hasAllType :
                    artifact_list.append(u'__ALL__')
                if hasOtherType :
                    artifact_list.append(u'__OTHER__')
                for artifact_type in artifact_list :
                    #add an empty text node to maintain xml view
                    tabtext = ModalityConfigurationManager.docElement.createTextNode("\n\t\t\t\t\t")
                    artifact_types.appendChild(tabtext)
                    node = ModalityConfigurationManager.docElement.createElement("type")
                    txt = ModalityConfigurationManager.docElement.createTextNode(artifact_type.strip())
                    node.appendChild(txt)
                    artifact_types.appendChild(node)
                #add an empty text node to maintain xml view
                tabtext = ModalityConfigurationManager.docElement.createTextNode("\n\t\t\t\t")
                artifact_types.appendChild(tabtext)
                params.insertBefore(artifact_types, param_list[0])
                tabtext = ModalityConfigurationManager.docElement.createTextNode("\n\t\t\t\t")
                params.insertBefore(tabtext, param_list[0])
        try :
            ModalityConfigurationManager.create_configuration_backup()
            f = open(config.get('modality_configuration_path').strip(), 'w')
            ModalityConfigurationManager.docElement.writexml(f,encoding = 'UTF-8')
            f.close()
        except Exception, e:
            log.error((_(u'Error writing to xml: %s' % (str(e)))).encode("utf-8"))
            response['status'] = (_(u'error' )).encode("utf-8")
            response['message'] = (_(u'Error : %s' % (str(e)))).encode("utf-8")
            return response
        response['status'] = (_(u'success' )).encode("utf-8")
        response['message'] = (_(u'Settings changed' )).encode("utf-8")
        return response
    
    @staticmethod
    def new_modality_configuration(modality_conf=None):
        """
            add new modality configuration
        """
        if modality_conf :
            for modality in modality_conf :
                response = {}
                ModalityConfigurationManager.getHandles()
                modality_list = ModalityConfigurationManager.get_all_modality_names()
                #Check modality already exist or not
                if modality['artifact_type'].strip() in modality_list :
                    log.error((_(u'Error : Configuration for artifact type "%s" already exists: ' % (modality['artifact_type'].strip()))).encode("utf-8"))
                    response['status'] = (_(u'error' )).encode("utf-8")
                    response['message'] = (_(u'Error : Configuration for artifact type %s already exists: ' % (modality['artifact_type'].strip()))).encode("utf-8")
                    return response
                else:
                    newModality = ModalityConfigurationManager.docElement.createElement("Modality")
                    newModality.attributes['name']= modality['artifact_type']
                    del(modality['name'])
                    for attr_key in modality.keys():
                        param = ModalityConfigurationManager.docElement.createElement("Param")
                        name = ModalityConfigurationManager.docElement.createElement("Name")
                        nametxt = ModalityConfigurationManager.docElement.createTextNode(attr_key)
                        value = ModalityConfigurationManager.docElement.createElement("Value")
                        valuetxt = ModalityConfigurationManager.docElement.createTextNode(modality[attr_key])
                        name.appendChild(nametxt)
                        value.appendChild(valuetxt)
                        #add an empty text node to maintain xml view
                        tabtext = ModalityConfigurationManager.docElement.createTextNode("\n\t\t\t\t")
                        param.appendChild(tabtext)
                        param.appendChild(name)
                        #add an empty text node to maintain xml view
                        tabtext = ModalityConfigurationManager.docElement.createTextNode("\n\t\t\t\t")
                        param.appendChild(tabtext)
                        param.appendChild(value)
                        #add an empty text node to maintain xml view
                        tabtext = ModalityConfigurationManager.docElement.createTextNode("\n\t\t\t")
                        param.appendChild(tabtext)
                        #add an empty text node to maintain xml view
                        tabtext = ModalityConfigurationManager.docElement.createTextNode("\n\t\t\t")
                        newModality.appendChild(tabtext)
                        newModality.appendChild(param)
                    #add an empty text node to maintain xml view
                    tabtext = ModalityConfigurationManager.docElement.createTextNode("\n\t\t")
                    newModality.appendChild(tabtext)
                    #add an empty text node to maintain xml view
                    tabtext = ModalityConfigurationManager.docElement.createTextNode("\t")
                    ModalityConfigurationManager.docElement.getElementsByTagName('ModalitiesConfig')[0]\
                        .getElementsByTagName('Modalities')[0].appendChild(tabtext)
                    ModalityConfigurationManager.docElement.getElementsByTagName('ModalitiesConfig')[0]\
                        .getElementsByTagName('Modalities')[0].appendChild(newModality)
                    #add an empty text node to maintain xml view
                    tabtext = ModalityConfigurationManager.docElement.createTextNode("\n\t")
                    ModalityConfigurationManager.docElement.getElementsByTagName('ModalitiesConfig')[0]\
                        .getElementsByTagName('Modalities')[0].appendChild(tabtext)
                    try :
                        ModalityConfigurationManager.create_configuration_backup()
                        f = open(config.get('modality_configuration_path').strip(), 'w')
                        ModalityConfigurationManager.docElement.writexml(f,encoding = 'UTF-8')
                        f.close()
                    except Exception, e:
                        log.error((_(u'Error writing to xml: %s' % (str(e)))).encode("utf-8"))
                        response['status'] = (_(u'error' )).encode("utf-8")
                        response['message'] = (_(u'Error : %s' % (str(e)))).encode("utf-8")
                        return response
            response['status'] = (_(u'success' )).encode("utf-8")
            response['message'] = (_(u'New settings saved.' )).encode("utf-8")
            return response
    
    @staticmethod
    def download_modality_configuration():
        fstream = None
        f = None
        file_name = None
        try :
            file_name = config.get('modality_configuration_path').strip().split('/')
            f = open(config.get('modality_configuration_path').strip(), 'r')
            fstream = f.read()
        except Exception,e :
            log.error((_(u'Error reading from xml: %s' % (str(e)))).encode("utf-8"))
        finally:
            if f:
                f.close()
        return ModalityConfigurationManager.get_file_name_with_time_stamp(file_name[len(file_name) - 1]), fstream
    
    @staticmethod
    def get_file_name_with_time_stamp(file_name=None):
        """
            take the file name as argument, format it attach time stamp and return file name 
        """
        if file_name:
            file_name = config.get('modality_configuration_path').strip().split('/')
            file_name, file_extension = os.path.splitext(file_name[len(file_name) - 1])
            time_stamp = strftime("_%Y_%m_%d_%r_%Z")
            file_name = "%s%s%s" %(file_name,time_stamp,file_extension)
        return file_name
    
    @staticmethod
    def create_configuration_backup():
        """
            take the back up of configuration before updating with new configuration
        """
        sourceHandle = None
        destinationHandle = None
        try:
            sourceHandle = open(config.get('modality_configuration_path').strip(), 'r')
            destinationdir = config.get('modality_configuration_backup_path').strip()
            if destinationdir:
                destination_file_name = "%s/%s" %(destinationdir, \
                    ModalityConfigurationManager.get_file_name_with_time_stamp(config.get('modality_configuration_path').strip()))
                if destination_file_name :
                    destinationHandle = open(destination_file_name, 'w')
                    destinationHandle.write(sourceHandle.read())
        except Exception,e:
            log.error((_(u'Error taking modality configuration backup : %s' % (str(e)))).encode("utf-8"))
        finally:
            if sourceHandle:
                sourceHandle.close()
            if destinationHandle:
                destinationHandle.close()
