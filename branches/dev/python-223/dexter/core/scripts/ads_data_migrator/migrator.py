from api_manager import APIManager
from data_accessor import DataAccessor
import settings
import sys
import datetime
from decimal import Decimal
from generic_thread import GenericThread

class DataMigrator(object):

    def __init__(self):
        self.api_manager = APIManager()
        self.data_accessor = DataAccessor()

    def register_client(self, client_name):
        response = self.api_manager.register_client(client_name) 
        if response and response.__contains__('client'):
            return response['client']['clientID']
        else:
            return None

    def register_event_type_for_client(self, client_id, event_type, parameters):
        self.api_manager.register_event_type(client_id, event_type, parameters)

    def register_parameter(self, parameter):
        self.api_manager.register_parameter(parameter)

    def get_table_columns_for_migration(self, table_name, pick_fields=None):
        table_cols = self.data_accessor.get_table_columns(table_name)
        final_table_cols = []
        if pick_fields:
            final_table_cols.extend(table_cols)
            for each_col in table_cols:
                if not pick_fields.__contains__(each_col['name']):
                    final_table_cols.remove(each_col)
        for each_col in table_cols:
            if 'int' in each_col['type'].lower():
                each_col['type'] = 'int'
            elif 'long' in each_col['type'].lower():
                each_col['type'] = 'long'
            elif 'varchar' in each_col['type'].lower() or 'timestamp' in each_col['type'].lower():
                each_col['type'] = 'str or unicode or NoneType'
        final_table_cols = final_table_cols if final_table_cols else table_cols
        final_col_names = [each_col['name'] for each_col in final_table_cols]
        return final_col_names,final_table_cols

    def get_table_rows_for_migration(self, table_name, fields=None, cols=None, limit=None, condition=None ):
        rows = self.data_accessor.get_table_rows(table_name, fields=fields, limit=limit, condition=condition)
        if not fields:
            fields,cols = self.get_table_columns_for_migration(table_name)
        dec_rows = self.decorate_fields_on_rows(fields, cols, rows)
        return dec_rows

    def decorate_fields_on_rows(self, fields, cols, rows):
        fields = [each_field if 'userid' not in each_field.lower() else 'memberID' for each_field in fields]
        fields = ['timestamp' if 'ts' == each_field.lower() else each_field for each_field in fields]
        dec_rows = []
        for each_row in rows:
            each_dec_row = {}
            for i in range(len(fields)):
                name = fields[i]
                value = each_row[i]
                typeVal = cols[i].get('type')
                if name == 'timestamp' and type(value) == datetime.datetime:
                    each_dec_row[name] = value.strftime('%Y-%m-%d %H:%M:%S %f')
                elif type(value) == Decimal:
                    each_dec_row[name] = str(value)
                elif typeVal == 'float': # Handle if the float values are None
                    if not value:
                        value = 0.0
                    each_dec_row[name] = value
                else:
                    each_dec_row[name] = value
            dec_rows.append(each_dec_row)
        return dec_rows

    def add_extra_fields(self, cols):
        for each_col in cols:
            if 'userid' in each_col['name'].lower():
                each_col['name'] = 'memberID'
            if 'ts' == each_col['name'].lower().strip():
                each_col['name'] = 'timestamp'
            if each_col['name'] in settings.FIELDS.keys():
                each_col.update(settings.FIELDS[each_col['name']])
            else:
                each_col.update({'mandatory':'true','api':None})
        return cols

    def start_migrator(self, client_name, ads_payload, is_client_id=False):
        if is_client_id: 
            client_id = client_name
        else:
            client_id = self.register_client(client_name)
        self.migrate_events_to_dexter(client_id=client_id, event_type=ads_payload['event_name'], source_table=ads_payload['ads_table_name'], pick_fields=ads_payload['pick_fields'], condition=ads_payload['condition'], limit=ads_payload['limit'])

    def migrate_events_to_dexter(self, client_id, event_type, source_table, pick_fields=None, condition=None, limit=None):
        col_names,table_cols = self.get_table_columns_for_migration(source_table, pick_fields=pick_fields)
        table_cols = self.add_extra_fields(table_cols)

        cols = []
        print '\nRegistering event type (%s) for client.'%event_type
        for each_parameter in table_cols:
            parameter = {}
            parameter['name'] = each_parameter['name']
            parameter['type'] = each_parameter['type']
            if each_parameter.get('api'): # Not sending empty api.
                parameter['api'] = each_parameter['api']
            cols.append(parameter)
            del each_parameter['type']
            del each_parameter['api']
            print '\n Registering parameter (%s)'%parameter['name']
            self.register_parameter(parameter)
        self.register_event_type_for_client(client_id, event_type, table_cols)
        parameters = self.get_table_rows_for_migration(source_table, fields=col_names, cols=cols, limit=limit, condition=condition)
        print '\nInitiating event recording..'
        print "Params : %s" %parameters
        thread_count = int(settings.MAX_THREAD_COUNT)

        if thread_count < len(parameters):
           parameter_break_points = range(0, len(parameters), len(parameters)/thread_count)
           worker_threads = []
           for each in range(1, len(parameter_break_points)-1):
               worker_threads.append(GenericThread(self.api_manager.record_events, client_id, event_type, parameters[parameter_break_points[each-1]:parameter_break_points[each]]))
           residue = parameters[parameter_break_points[len(parameter_break_points)-2]:len(parameters)]
           if residue:
               worker_threads.append(GenericThread(self.api_manager.record_events, client_id, event_type, residue))
           for each_worker in worker_threads:
               each_worker.start()
           for each_worker in worker_threads:
               each_worker.join()
        else: 
            for each_parameter in parameters:
                sys.stdout.write('.')
                self.api_manager.record_event(client_id, event_type, each_parameter)   
            print '\nDone with migrating events from (%s) to (%s)'%(source_table, event_type)
