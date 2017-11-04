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
# $Id$

from flxweb.lib.base import BaseController
from pylons.templating import render_jinja2
from flxweb.model.health import HealthManager
from pylons import config, request, tmpl_context as c
from flxweb.forms.health import *
from time import strftime
from xml.dom import minidom

class HealthController(BaseController):
    '''
    Controller for handling the health pages. 
    '''
    def __init__(self):
        self.HOST_API = {}
        self.api_timeout = float(config.get('flx_core_servers_api_timeout'))
        self.get_host_services_mappings()
    
    def get_health_page(self):
        c.form = ServicesHealthForm()
        c.host_api = self.HOST_API
        return render_jinja2 ('/healthcheck/health.html')
        
    def get_service_status(self,hostname,servicename):
        '''
            get the status of service on the requested host and time for the request
        '''
        if not hostname:
            hostname = request.GET.get('hostname')
        if not servicename:
            servicename = request.GET.get('servicename')
        
        if hostname and servicename :
            try:
                c.host_name = hostname
                c.service_name = servicename
                
                service = self.HOST_API[hostname][servicename]
                resp, description = HealthManager.health_custome_service(api=service['api'],host=hostname,
                                                                     params=service['params'],api_timeout=self.api_timeout)
                c.time_stamp = strftime("%Y-%m-%d %r %Z")
                service['status'] = resp
                service['description'] = description
                c.service_status = service
            except Exception, e:
                log.exception(e)
        return render_jinja2 ('/healthcheck/ajax_health.html')

    def get_services_name_mappings(self,services_map=None):
        services_dict = {}
        if services_map:
            services_list = services_map.split(',')
            for service in services_list:
                if ':' in service:
                    ser = service.split(':')
                    services_dict[ser[0].strip('\n').strip()] = ser[1].strip('\n').strip()
        return services_dict
    
    def get_host_services_mappings(self):
        '''
        create the host services mapping as a dictionary object
        '''
        self.HOST_API = {}
        try:
            docElement = minidom.parse(config.get('flx_core_servers_api_mapping_path').strip())
            services_list =  docElement.getElementsByTagName('services')
            for services in services_list:
                service_list = services.getElementsByTagName('service')
                for service in service_list:
                    services_status_list = {}
                    api_list = service.getElementsByTagName('api')
                    hosts_list = service.getElementsByTagName('hosts')
                    params_list = service.getElementsByTagName('params')
                
                    service_name = None
                    api_name = ''
                    param_dict = None
                    paramString = ''
                    
                    #get api information from settings xml
                    try:
                        for api in api_list:
                            api_name = api.childNodes[0].nodeValue
                    
                        service_name = service.getAttribute('name')
                        if service_name is None:
                            service_name = api_name
                    except Exception, e:
                        log.exception(e)
                    
                    #get api parameters information from settings xml
                    try:
                        for params in params_list:
                            param_list = params.getElementsByTagName('param')
                            para = {}
                            for param in param_list:
                                name = param.getAttribute('name').strip()
                                value = param.getAttribute('value').strip()
                                if name and value:
                                    if not paramString:
                                        paramString = "%s=%s" %(name,value)
                                    else:
                                        paramString += "&%s=%s" %(name,value)
                                    para[name] = value
                            if para:
                                param_dict = para
                        
                        complete_api = api_name
                        if paramString:
                            complete_api += "%s%s" % ("?",paramString)
                    
                    except Exception, e:
                        log.exception(e)
                    
                    services_status_list[service_name] = {'api' : api_name, \
                                                          'params' : param_dict, \
                                                          'status' : 0 , \
                                                          'description' : '-', \
                                                          'completeapi':complete_api
                                                         }
                    #get hosts information from settings xml and append services information to host if host already present
                    try:
                        for hosts in hosts_list:
                            host_list = hosts.getElementsByTagName('host')
                            for host in host_list:
                                host_name = host.childNodes[0].nodeValue
                                if not host_name.startswith('http://'):
                                    host_name = "%s%s" %('http://',host_name) 
                                if host_name in self.HOST_API:
                                    self.HOST_API[host_name] = dict(self.HOST_API[host_name].items() + services_status_list.items())
                                else:
                                    self.HOST_API[host_name] = services_status_list
                    except Exception, e:
                        log.exception(e)
        except Exception, e:
            log.exception(e)
