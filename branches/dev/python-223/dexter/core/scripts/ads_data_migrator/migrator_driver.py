import settings
import json
from ConfigParser import ConfigParser
import traceback
from generic_process import GenericProcessPool
from migrator import DataMigrator

class DataMigratorDriver(object):

    def __init__(self):
        self.dm = None
        self.ads_payloads = []

    def set_migrator(self, dm):
        self.dm = dm

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
                    event_name = cf.get(section, 'event_name')
                    ads_table_name = cf.get(section, 'ads_table_name')
                    if cf.has_option(section, 'pick_fields'):
                        try:
                            pick_fields = cf.get(section, 'pick_fields')
                            pick_fields = json.loads(pick_fields) if pick_fields else None
                        except Exception as e:
                            pick_fields = None
                    else:
                        pick_fields = None
                    if cf.has_option(section, 'condition'):
                        condition = cf.get(section, 'condition')
                        condition = None if str(condition).lower() == 'none' else condition
                    else:
                        condition = None
                    if cf.has_option(section, 'limit'):
                        try:
                            limit = int(cf.get(section,'limit')) if cf.get(section, 'limit') else None
                        except Exception as e:
                            limit = None
                    else:
                        limit = None
                    each_payload['event_name'] = event_name
                    each_payload['ads_table_name'] = ads_table_name
                    each_payload['pick_fields'] = pick_fields
                    each_payload['condition'] = condition
                    each_payload['limit'] = limit
                    self.ads_payloads.append(each_payload)
                except Exception as e:
                    print traceback.format_exc()
                    print 'Please fix section: %s'%'event_details_%s'%i
                    pass
        return self.ads_payloads
    
    def start_migrator(self, client_name, payload, is_client_id):
        self.dm.start_migrator(client_name, payload, is_client_id)

if __name__ == '__main__':
    dm = DataMigrator()
    #client_id = dm.register_client('db_test_client_7')
    client_name = client_id = 24839961 #Client ID for the client FBS
    dm_driver = DataMigratorDriver()
    dm_driver.set_migrator(dm)
    ads_payloads = dm_driver.read_and_load_config()

    target_args_list = []
    for each_payload in ads_payloads:
        each = {}
        each['target'] = dm.start_migrator
        each['args'] = (client_name, each_payload, True)
        target_args_list.append(each)

    gp_pool = GenericProcessPool()
    gp_pool.start_diff_processes(target_args_list)
    gp_pool.wait_for_all_processes()
