import logging

from pylons import config
from pylons.i18n.translation import _
from xml.dom import minidom
from flxadmin.lib.ck12.decorators import ck12_cache_region
from flxadmin.lib import helpers as h

log = logging.getLogger(__name__)


class Acl(dict):

    def __init__(self, dict_obj=None):
        '''
        Constructs the model object using the key/values from the dict object
        '''
        if dict_obj:
            for key, value in dict_obj.items():
                self[key] = dict_obj[key]

    def __decode__(self, obj):
        if type(obj) == dict:
            for key, value in obj.items():
                obj[key] = self.__decode__(value)
        elif type(obj) == list:
            for index, value in enumerate(obj):
                obj[index] = self.__decode__(value)
        elif type(obj) == str:
            obj = obj.decode('utf-8')
        return obj

    def __getitem__(self, key):
        return dict.get(self, key)


class AclManager():

    processed_acls = None
    docElement = None

    @staticmethod
    def getHandles():
        try:
            AclManager.configurationFilePath = "%s" % (config.get('acl_xml_path').strip())
            AclManager.docElement = minidom.parse(AclManager.configurationFilePath)
            acl_conf = AclManager.docElement.getElementsByTagName('ACLConfig')
            AclManager.roles = acl_conf[0].getElementsByTagName('Role')
        except Exception, e:
            log.error((_(u'Error parsing acl configuration. Invalid xml format : %s' % (str(e)))).encode("utf-8"))
            raise e

    @staticmethod
    @ck12_cache_region('forever', invalidation_key='aclconfig')
    def get_all_acl():
        try:
            # AclManager.getHandles()
            # roles = AclManager.roles
            acl_items, total = h.page_get(
                'flx/get/admin/userrole/acl', {}, 'user_acl')
            acl_dict = {}
            for each_acl_item in acl_items:
                urls = each_acl_item.get('allowed_routes', [])
                acl = []
                for url in urls:
                    acl.append({url['url']: int(url['permission'])})
                # acl_dict.update({role.getAttribute('name').strip(): acl})
                acl_dict.update({each_acl_item['user_role']: acl})
            return acl_dict
        except Exception as e:
            raise e

    @staticmethod
    def get_acl_by_role(roleName=None):
        """
            return the role acls
        """
        try:
            acl_dict = AclManager.get_all_acl()
            if roleName and roleName in acl_dict:
                return {roleName: acl_dict[roleName]}
            elif roleName and roleName not in acl_dict:
                return {roleName: []}
            else:
                return acl_dict
        except Exception as e:
            log.error((_(u'Error reading acl information from xml: %s' % (str(e)))).encode("utf-8"))

    @staticmethod
    def update_acl(acl=None):
        """
            update the role acls
        """
        response = {}
        AclManager.getHandles()
        try:
            changed_node = None
            for role in AclManager.roles:
                if acl.keys()[0] == role.getAttribute('name').strip():
                    for child in role._get_childNodes():
                        role.removeChild(child)
                    for url in role.getElementsByTagName('url'):
                        role.removeChild(url)
                    changed_node = role
                    break
            if not changed_node:
                tabtext = AclManager.docElement.createTextNode("\n\t")
                changed_node = AclManager.docElement.createElement("Role")
                changed_node.appendChild(tabtext)

            changed_node.attributes['name'] = acl.keys()[0].lower()

            rules = acl[acl.keys()[0]]
            for rule in rules:
                url_node = AclManager.docElement.createElement("url")
                url_node.attributes['value'] = str(rule.keys()[0])
                url_node.attributes['permission'] = str(rule[rule.keys()[0]])
                # add an empty text node to maintain xml view
                tabtext = AclManager.docElement.createTextNode("\n\t\t")
                changed_node.appendChild(tabtext)
                changed_node.appendChild(url_node)

            tabtext = AclManager.docElement.createTextNode("\n\t")
            changed_node.appendChild(tabtext)

            tabtext = AclManager.docElement.createTextNode("\n\t")
            AclManager.docElement.getElementsByTagName('ACLConfig')[0].appendChild(tabtext)
            AclManager.docElement.getElementsByTagName('ACLConfig')[0].appendChild(changed_node)
            tabtext = AclManager.docElement.createTextNode("\n")
            AclManager.docElement.getElementsByTagName('ACLConfig')[0].appendChild(tabtext)

            try:
                f = open(AclManager.configurationFilePath, 'w')
                s = '\n'.join([line for line in AclManager.docElement.toprettyxml(indent='\t').split('\n') if line.strip()])
                f.write(s.encode('utf-8'))
                f.close()
            except Exception, e:
                log.error((_(u'Error writing to acl xml: %s' % (str(e)))).encode("utf-8"))
                response['status'] = (_(u'error')).encode("utf-8")
                response['message'] = (_(u'Error : %s' % (str(e)))).encode("utf-8")
                return response

        except Exception, e:
            log.error((_(u'Error updating acl: %s' % (str(e)))).encode("utf-8"))
            response['status'] = (_(u'error')).encode("utf-8")
            response['message'] = (_(u'Error : %s' % (str(e)))).encode("utf-8")
            return response
        response['status'] = (_(u'success')).encode("utf-8")
        response['message'] = (_(u'acl updated.')).encode("utf-8")
        return response
