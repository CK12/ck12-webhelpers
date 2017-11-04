#!/usr/bin/python
## Script to check and report backward compatibility issues of 2.0 APIs

import smtplib
from email.mime.text import MIMEText
import urllib2
import json
import settings
from optparse import OptionParser
import datetime
import ConfigParser
import os

class APICompatChecker:
    def __init__(self):
        self.reference_file = settings.reference_file
        self.log_file = settings.log_file
        self.log = ''
        self.exec_mode = ''
        self.incompat_api_list = []
        self.none_val_api_list = []
        self.error_msg_api_list = []
        self.api_list = []
        self.set_api_host(settings.api_host)
        self.run_time_stamp = ''
        self.tmp_error_msg = ''
        self.breadcrumb = ''

    def set_api_host(self, api_host):
        self.api_host = 'http://%s/'%api_host

    def create_baseline(self):
        if not self.api_list:
            self.set_api_list(settings.api_list_file)
        f = open(self.reference_file,'w')
        api_list = self.api_list
        visible_api = ''
        result_dict = {}
        for each_api in api_list:
            visible_api,response = self.invoke_api(each_api)
            if response:
                response_dict = json.loads(response)
                if response_dict.get('response').has_key('message'):
                    log_msg = 'Got error message(%s) in the API(%s) \n'%(response_dict['response']['message'],visible_api)
                    self.log = '%s%s'%(self.log,log_msg)
                    print log_msg
                    error_msg_api_details = {}
                    error_msg_api_details['api_details'] = each_api
                    error_msg_api_details['visible_api'] = visible_api
                    error_msg_api_details['error_message'] = response_dict['response']['message']
                    self.error_msg_api_list.append(error_msg_api_details)
                result_dict[each_api['api']] = {}
                result_dict[each_api['api']]['visible_api'] = each_api
                result_dict[each_api['api']]['api_details'] = each_api
                result_dict[each_api['api']]['api_response'] = response
        result_dict_json = json.dumps(result_dict, indent=4)
        f.write(result_dict_json)
        f.close()
        self.render_report()

    def invoke_api(self,api_details):
        visible_api = ''
        response = None
        try:
            visible_api = '%s%s%s'%(self.api_host,api_details['api'],api_details['positional_parameters'])
            if api_details['query_dict']:
                visible_api = "%s?"%visible_api
                for key,value in api_details['query_dict'].items():
                    visible_api = "%s%s=%s&"%(visible_api,key,value)
            log_msg = 'Accessing API: %s\n'%visible_api
            self.log = '%s%s'%(self.log,log_msg)
            print log_msg
            response = urllib2.urlopen(visible_api).read()
        except Exception as e:
            error_msg_api_details = {}
            error_msg_api_details['api_details'] = api_details
            error_msg_api_details['visible_api'] = visible_api
            error_msg_api_details['error_message'] = e.__str__()
            log_msg = 'Got error message(%s) while accessing the API\n'%(e.__str__())
            self.log = '%s%s'%(self.log,log_msg)
            print log_msg
            self.none_val_api_list.append(error_msg_api_details)
        return visible_api,response
        
    def compare_responses(self, baseline_response, actual_response):
        is_same = True
        try:
            baseline_response = json.loads(baseline_response)
            actual_response = json.loads(actual_response)
            if type(baseline_response) != type(actual_response):
                self.tmp_error_msg = "Type of the responses didn't match, Expected:(%s), received:(%s)"%(type(baseline_response),type(actual_response))
                print self.tmp_error_msg
                return False
            elif type(baseline_response) == dict:
                return self.compare_dict(baseline_response,actual_response)
            elif type(baseline_response) == list:
                return self.compare_list(baseline_response,actual_response)
            #values can be different
            #else:
                #return baseline_response == actual_response
        except Exception as e:
            print e.__str__()
            is_same = False
        return is_same

    def compare_list(self, list1,list2):
        #values can be different
        if not len(list2) == len(list1):
            return True
        for each_val in list1:
            if type(each_val) == dict:
                self.breadcrumb = self.breadcrumb + " -> " + str(list1.index(each_val))
                if not self.compare_dict(each_val, list2[list1.index(each_val)]):
                    return False
                else:
                    self.remove_last_crumb()
            elif type(each_val) == list:
                self.breadcrumb = self.breadcrumb + " -> " + str(list1.index(each_val))
                if not self.compare_list(each_val, list2[list1.index(each_val)]):
                    return False
                else:
                    self.remove_last_crumb()
        return True

    def remove_last_crumb(self):
        k = self.breadcrumb.split('->')
        self.breadcrumb = '->'.join(k)

    def compare_dict(self,dict1,dict2):
        dict1_keys = dict1.keys()
        dict2_keys = dict2.keys()
        if not dict1_keys:
            return True
        for each_val in dict1_keys:
            if not dict2_keys.__contains__(each_val) and not each_val in settings.dynamic_keys:
                self.tmp_error_msg = "key:%s is missing in the response, traceback:%s"%(each_val,self.breadcrumb)
                print self.tmp_error_msg
                return False
            elif not dict2_keys.__contains__(each_val) and each_val in settings.dynamic_keys:
                continue
            if type(dict2.get(each_val)) == type(None) or type(dict1.get(each_val)) == type(None):
                continue
            if type(dict1.get(each_val)) != type(dict2.get(each_val)):
                self.breadcrumb = self.breadcrumb + " -> " + each_val
                self.tmp_error_msg = "Type of the key:%s in the responses didn't match, Expected:(%s), received:(%s), traceback:%s"%(each_val, type(dict1.get(each_val)),type(dict2.get(each_val)),self.breadcrumb)
                print self.tmp_error_msg
                return False
            elif type(dict1.get(each_val)) == dict:
                self.breadcrumb = self.breadcrumb + " -> " + each_val
                if not self.compare_dict(dict1.get(each_val), dict2.get(each_val)):
                    return False
                else:
                    self.remove_last_crumb()
            elif type(dict1.get(each_val)) == list:
                self.breadcrumb = self.breadcrumb + " -> " + each_val
                if not self.compare_list(dict1.get(each_val), dict2.get(each_val)):
                    return False
                else:
                    self.remove_last_crumb()
        return True

    def validate_apis(self):
        if not self.api_list:
            self.set_api_list(settings.api_list_file)
        if os.path.exists(self.reference_file):
            f = open(self.reference_file, 'r')
            result_dict_json = f.read()
            f.close()
            result_dict = json.loads(result_dict_json)
        else:
            result_dict = {}
        api_list = self.api_list
        is_new_api_added = False
        for each_api in api_list:
            if not result_dict.has_key(each_api['api']):
                visible_api,response = self.invoke_api(each_api)
                if response:
                    response_dict = json.loads(response)
                    log_msg = 'API(%s) not found in the reference file, will be added to it.\n'%visible_api
                    self.log = '%s%s'%(self.log,log_msg)
                    print log_msg
                    if response_dict.get('response').has_key('message'):
                        log_msg = 'Got error message(%s) in the API(%s)\n'%(response_dict['response']['message'],each_api)
                        self.log = '%s%s'%(self.log,log_msg)
                        print log_msg
                        error_msg_api_details = {}
                        error_msg_api_details['visible_api'] = visible_api
                        error_msg_api_details['api_details'] = each_api
                        error_msg_api_details['error_message'] = response_dict['response']['message']
                        self.error_msg_api_list.append(error_msg_api_details)
                        continue
                    result_dict[each_api['api']] = {}
                    result_dict[each_api['api']]['api_details'] = each_api
                    result_dict[each_api['api']]['visible_api'] = visible_api
                    result_dict[each_api['api']]['api_response'] = response
                    is_new_api_added = True
            else:
                baseline_response = result_dict[each_api['api']]['api_response']
                visible_api,actual_response = self.invoke_api(each_api)
                each_api['visible_api'] = visible_api
                if actual_response:
                    actual_response_dict = json.loads(actual_response)
                    if actual_response_dict.get('response').has_key('message'):
                        log_msg = 'Got error message(%s) in the API(%s)\n'%(actual_response_dict['response']['message'],each_api)
                        self.log = '%s%s'%(self.log,log_msg)
                        print log_msg
                        error_msg_api_details = {}
                        error_msg_api_details['visible_api'] = visible_api
                        error_msg_api_details['api_details'] = each_api
                        error_msg_api_details['error_message'] = actual_response_dict['response']['message']
                        self.error_msg_api_list.append(error_msg_api_details)
                        continue
                else:
                    continue
                log_msg = "Validating: %s\n"%visible_api
                self.log = '%s%s'%(self.log,log_msg)
                print log_msg
                self.breadcrumb = ''
                is_same = self.compare_responses(baseline_response,actual_response)
                if not is_same:
                    each_api['error_message'] = self.tmp_error_msg
                    self.incompat_api_list.append(each_api)
        if is_new_api_added:
            f = open(self.reference_file, 'w')
            result_dict_json = json.dumps(result_dict)
            f.write(result_dict_json)
        self.render_report()

    def set_api_list(self, api_file=None):
        if api_file:
            config = ConfigParser.ConfigParser()
            config.read(api_file)
            api_count = config.getint('api_index','api_count')
            for each_num in range(1,api_count+1):
                api_details = {}
                api_details['api'] = config.get('api_details_%s'%each_num,'api')
                api_details['positional_parameters'] = config.get('api_details_%s'%each_num,'positional_parameters')
                api_details['query_dict'] = json.loads(config.get('api_details_%s'%each_num,'query_dict'))
                api_details['api_type'] = config.get('api_details_%s'%each_num,'api_type')
                self.api_list.append(api_details)
        
    def render_report(self):
        log_msg = ''
        log_msg = log_msg +  "\n\n--------------------------------------------------\n"
        log_msg = log_msg +  "\nStarted at: %s on %s\n"%(self.run_time_stamp,settings.machine_name)
        log_msg = log_msg +  "\nAPI Host: %s\n"%(self.api_host)
        log_msg = log_msg +  "\nMode: %s\n"%self.exec_mode
        log_msg = log_msg +  "Processed %s APIs\n"%len(self.api_list)
        log_msg = log_msg +  "APIs successful: %s\n"%(len(self.api_list)-(len(self.incompat_api_list)+len(self.error_msg_api_list)+len(self.none_val_api_list)))
        log_msg = log_msg +  "APIs incompatible: %s\n"%len(self.incompat_api_list)
        log_msg = log_msg +  "APIs having message in the response: %s\n"%len(self.error_msg_api_list)
        log_msg = log_msg +  "APIs with other accessibility errors: %s\n"%len(self.none_val_api_list)
        if self.incompat_api_list:
            log_msg = log_msg +  "\n\nFollowing is a list of backward incompatible APIs:\n"
            log_msg = log_msg +  "--------------------------------------------------\n"
            for each in self.incompat_api_list:
                log_msg = log_msg +  'API: %s, error message: %s\n'%(each['visible_api'],each['error_message'])
        if self.none_val_api_list:
            log_msg = log_msg +  "\n\nFollowing is a list of APIs which returned None:\n"
            log_msg = log_msg +  "--------------------------------------------------\n"
            for each in self.none_val_api_list:
                log_msg = log_msg +  'API: %s, error message: %s\n'%(each['visible_api'],each['error_message'])
        if self.error_msg_api_list:
            log_msg = log_msg +  "\n\nFollowing is a list of APIs which has got error message:\n"
            log_msg = log_msg +  "--------------------------------------------------\n"
            for each in self.error_msg_api_list:
                log_msg = log_msg +  'API: %s, error message: %s\n'%(each['visible_api'],each['error_message'])
        self.log = '%s%s\n'%(self.log,log_msg)
        print log_msg
        f = open(self.log_file,'a')
        f.write(self.log)
        f.close()
        self.mail_report()

    def mail_report(self):
        if not settings.emails_to_notify:
            return
        message = MIMEText(self.log)
        exec_status = 'Successful!'
        #if self.error_msg_api_list or self.none_val_api_list or self.incompat_api_list:
        if self.incompat_api_list or self.none_val_api_list:
            exec_status = 'Failed!'
        message['Subject'] = "[%s] CK12 API backward compatibility check - %s" % (settings.machine_name, exec_status)
        message['From'] = settings.sender
        message['To'] = ','.join(settings.emails_to_notify)
        try:
            smtpObj = smtplib.SMTP(settings.email_host)
            smtpObj.sendmail(settings.sender, settings.emails_to_notify, message.as_string())         
            #logging.debug("Successfully sent email to " + 'deepak@ck12.org')
        except smtplib.SMTPException:
            print "Error: unable to send email"
    

if __name__ == "__main__":
    Usage = "./api_compatibility_checker.py -a <api_host> -f <filepath containing api list> -m <mode]>"
    parser = OptionParser(usage=Usage)
    parser.add_option("-m", "--mode",dest="mode",help="Run mode: 1.create_baseline, 2.validate",default = '')
    parser.add_option("-a", "--apihost",dest="api_host",help="[Optional]API host, by default, taken from settings",default = None)
    parser.add_option("-f", "--apifile",dest="api_file",help="[Optional]File path containing list of APIs, by default, taken from settings",default = None)
    (options,args)=parser.parse_args()
    api_compat_checker = APICompatChecker()
    api_list = []
    try:
        if options.api_file:
            api_compat_checker.set_api_list(options.api_file)
    except Exception as e:
        log_msg = "Exception: %s"%e.__str__()
        api_compat_checker.log = log_msg
        print log_msg
    api_compat_checker.run_time_stamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_msg = '\nScript run at: %s\n'%(api_compat_checker.run_time_stamp)
    log_msg = log_msg +  "--------------------------------------------------\n"
    api_compat_checker.log = log_msg
    print log_msg
    api_compat_checker.exec_mode = options.mode
    if options.api_host:
        api_compat_checker.set_api_host(options.api_host)
    if options.mode == 'create_baseline':
        api_compat_checker.create_baseline() 
    elif options.mode == 'validate':
        api_compat_checker.validate_apis() 
        if api_compat_checker.incompat_api_list or api_compat_checker.none_val_api_list:
            exit(1)
    else:
        parser.print_help()
        exit(1)
    exit(0)
