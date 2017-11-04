import time
import settings
from ConfigParser import ConfigParser
import traceback
from generic_process import GenericProcessPool
from loader import start_loader


class DataLoadDriver(object):

    def __init__(self):
        self.load_payloads = []

    def read_and_load_config(self):
        cf = ConfigParser()
        cf.read(settings.MIGRATION_DATA_DETAILS_CONFIG) 
        section_count = 0
        try:
            section_count =  len(cf.sections())
        except Exception as e:
            print 'Please fix data config file.'    
        if section_count > 0:
            for i in range(1,section_count+1):
                try:
                    each_payload = {}
                    section = 'event_details_%s' % i
                    file_name = cf.get(section, 'file_name')
                    each_payload['file_name'] = file_name
                    self.load_payloads.append(each_payload)
                except Exception as e:
                    print traceback.format_exc()
                    print 'Please fix section: %s'%'event_details_%s'%i
                    pass
        return self.load_payloads
    
if __name__ == '__main__':
    start_time = time.time()
    dl_driver = DataLoadDriver()
    load_payloads = dl_driver.read_and_load_config()
        
    target_args_list = []
    for each_payload in load_payloads:
        each = {}
        each['target'] = start_loader
        each['args'] = (each_payload,)
        target_args_list.append(each)
    
    gp_pool = GenericProcessPool()
    gp_pool.start_diff_processes(target_args_list)
    gp_pool.wait_for_all_processes()
    end_time = time.time()
    total_time = end_time - start_time
    print "Loading data successfully completed in %s seconds." %(total_time)
    fp = open('ADS_time.log', 'w')
    fp.write("Loading time : %s" % total_time)
    fp.close()
