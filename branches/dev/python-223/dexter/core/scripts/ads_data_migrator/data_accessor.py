import db_connector

class DataAccessor():

    @db_connector.deal_db_conn
    def get_table_columns(self, table_name):
        cursor = db_connector.cursor
        cursor.execute("""desc %s""" % (table_name))
        table_props = cursor.fetchall()
        column_info = []
        for each in table_props:
            column_info.append({ 'name' : each[0], 'type' : each[1] })
        return column_info
    
    @db_connector.deal_db_conn    
    def get_table_rows(self, table_name, fields=None, limit=None, condition=None):
        cursor = db_connector.cursor
        query = 'select'
        if not fields:
            query = '%s * from '%(query)
        else:
            query = '%s %s from ' % (query, ','.join(fields))
        query = '%s %s'%(query, table_name)
        if condition:
            query = '%s where %s' % (query, condition)
        if limit:
            query = '%s limit %s' % (query, limit)
        cursor.execute(query)
        rows = cursor.fetchall()
        return rows
