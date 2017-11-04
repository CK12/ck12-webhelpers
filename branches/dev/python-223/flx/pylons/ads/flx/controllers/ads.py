import logging, traceback, sys, os, datetime
from pylons import request, response, tmpl_context as c, config
from flx.lib.base import BaseController
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.model import model, meta
from flx.engine import repository
from flx.engine.query import process
from flx.engine.event import captureEvent
from flx.engine.utils import WallClock

log = logging.getLogger(__name__)


class AdsController(BaseController):
    """Analytical Data Service (ADS) APIs""" 

    def __init__(self, url=None):
        self.connection = self.connect(url) if url else None

    def connect(self, url=None):
        """ url - URL for connecting to the database.
        """
        if not self.connection: # meta.engine is None:
            from sqlalchemy import create_engine, orm

            meta.engine = create_engine(url or config.get('sqlalchemy.url'))
            sm = orm.sessionmaker(autoflush=False,
                                    autocommit=True,
                                    bind=meta.engine)
            meta.Session = orm.scoped_session(sm)
            self.connection = meta.engine.connect()
        return self.connection

    @d.jsonify()
    @d.trace(log)
    def registerEventGroup(self):
        """Registers a new event group. A event group is associated with a set of dimensions and can have attributes.
        
        POST Parameters:
        name       -- event group name
        latency    -- value of model.Measure.LATENCY_RT or model.Measure.LATENCY_NT (default: LATENCY_NT)
        dimensions -- a list of dimension names
        attributes -- a list of attribute names
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            name = request.params.get('name')
            latency = request.params.get('latency', model.Measure.LATENCY_NT)
            dimensions = request.params.get('dimensions')
            attributes = request.params.get('attributes', '')
            log.debug('name: %s; dimensions: %s; attribues: %s', name, dimensions, attributes)
            if not name:
                raise Exception('Invalid or missing parameter(s)')
            repository.registerEventGroup(name, latency, [d for d in dimensions.split(',')] if dimensions else [], [a for a in attributes.split(',') if a])
            result['response']['status'] = ['event group registered']
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_REGISTER_EVENTGROUP
            return ErrorCodes().asDict(c.errorCode, str(e))
            
        return result
    
    @d.jsonify()
    @d.trace(log)
    def registerEvent(self):
        """Registers a new event.
        
        The event group for this event should be created before this method is called. 
        
        POST Parameters:
        name        -- event name
        event_group -- name of the event group that this new event belongs to
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            name = request.params.get('name')
            groupName = request.params.get('event_group')
            log.debug('name: %s; event group: %s', name, groupName)
            if not (name and groupName):
                raise Exception('Invalid or missing parameter(s)')
            repository.registerEvent(name, groupName)
            result['response']['status'] = ['event registered']
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_REGISTER_EVENT
            return ErrorCodes().asDict(c.errorCode, str(e))
            
        return result

    @d.jsonify()
    @d.trace(log)
    def addAttribute(self):
        """Adds a new attribute to an event group.
        
        The event group for this attribute should be created before this method is called. 
        
        POST Parameters:
        name        -- attribute name
        event_group -- name of the event group that this new attribute belongs to
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            name = request.params.get('name')
            groupName = request.params.get('event_group')
            log.debug('name: %s; event group: %s', name, groupName)
            if not (name and groupName):
                raise Exception('Invalid or missing parameter(s)')
            repository.addAttribute(name, groupName)
            result['response']['status'] = ['attribute added']
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_REGISTER_EVENT
            return ErrorCodes().asDict(c.errorCode, str(e))
            
        return result

    @d.jsonify()
    @d.trace(log)
    def registerMetric(self):
        """Registers a new metric.
        
        POST Parameters:
        name               -- metric name
        latency            -- value of model.Measure.LATENCY_RT or model.Measure.LATENCY_NT (default: LATENCY_NT)
        dimensions         -- a list of dimension names
        source_column      -- column name
        source_table       -- table name
        source_db_db       -- database name
        source_db_host     -- database host name/IP
        source_db_user     -- database user name
        source_db_password -- database user password
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            name = request.params.get('name')
            latency = request.params.get('latency', model.Measure.LATENCY_NT)
            dimensions = request.params.get('dimensions')
            source_column = request.params.get('source_column')
            source_table = request.params.get('source_table')
            source_db_db = request.params.get('source_db_db')
            source_db_host = request.params.get('source_db_host')
            source_db_user = request.params.get('source_db_user')
            source_db_password = request.params.get('source_db_password')
            log.debug('name: %s; dimensions: %s; column: %s; table: %s; db: %s; host: %s; user: %s',
                      name, dimensions, source_column, source_table, source_db_db, source_db_host, source_db_user)
            repository.registerMetric(name, latency, (d for d in dimensions.split(',')), source_column,
                                      source_table, source_db_db, source_db_host, source_db_user,
                                      source_db_password)
            result['response']['status'] = ['metric registered']
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_REGISTER_METRIC
            return ErrorCodes().asDict(c.errorCode, str(e))
            
        return result

    @d.jsonify()
    @d.trace(log)
    def registerDimension(self):
        """Registers a new dimension.
        
        POST Parameters:
        name -- dimension name
        tag -- dimension tag enabled or not
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            name = request.params.get('name')
            tag = request.params.get('tag')
            log.debug('name: %s, tag: %s', name, tag)
            repository.registerDimension(name, tag)
            result['response']['status'] = ['metric registered']
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_REGISTER_DIMENSION
            return ErrorCodes().asDict(c.errorCode, str(e))
            
        return result

    @d.jsonify()
    @d.trace(log)
    def setDimensionLoadScript(self):
        """Set load script of a dimension.
        
        POST Parameters:
        dimension_name -- dimension name
        script         -- SQL script content
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            dimension_name = request.params.get('dimension_name')
            script = request.params.get('script')
            log.debug('dimension name: %s', dimension_name)
            repository.setDimensionLoadScript(dimension_name, script)
            result['response']['status'] = ['load script added']
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_SET_DIMENSION_LOAD_SCRIPT
            return ErrorCodes().asDict(c.errorCode, str(e))
            
        return result

    @d.jsonify()
    @d.trace(log)
    def loadDimension(self):
        """Load script of a dimension.
        
        POST Parameter:
        dimension_name -- dimension name
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            dimension_name = request.params.get('dimension_name')
            log.debug('dimension name: %s', dimension_name)
            repository.loadDimension(dimension_name)
            result['response']['status'] = ['dimension added']
        except Exception, e:
            msg = 'Unexpected error running load script for dimension  %s' % dimension_name
            log.error(msg)
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_LOAD_DIMENSION
            return ErrorCodes().asDict(c.errorCode, msg)
            
        return result

    @d.jsonify()
    @d.trace(log)
    def setDimensionUpdateScript(self):
        """Set update script of a dimension.
        
        POST Parameters:
        dimension_name -- dimension name
        script         -- SQL script content
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            dimension_name = request.params.get('dimension_name')
            script = request.params.get('script')
            log.debug('dimension name: %s', dimension_name)
            repository.setDimensionUpdateScript(dimension_name, script)
            result['response']['status'] = ['update script added']
        except Exception, e:
            msg = 'Unexpected error while running update script for dimension %s' % dimension_name
            log.error(msg)
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_SET_DIMENSION_LOAD_SCRIPT
            return ErrorCodes().asDict(c.errorCode, msg)
            
        return result

    @d.trace(log)
    def addHierarchy(self):
        """Adds a new hierarchy to a existing dimension.
        
        POST Parameters:
        name           -- hierarchy name
        dimenspppion_name -- dimension name
        
        (For ragged hierarchy)
        ragged           -- if present, this is a ragged hierarchy
        pk_column        -- primary key column name
        parent_pk_column -- parent primary key column name
        lookup_table     -- lookup table name
        db_db            -- database name
        db_host          -- database host name/IP
        db_user          -- database user name
        db_password      -- database user password
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            log.debug('parameters: %s', request.params)
            repository.addHierarchy(**request.params)
            result['response']['status'] = ['hierarchy added']
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_ADD_HIERARCHY
            return ErrorCodes().asDict(c.errorCode, str(e))
            
        return result

    @d.jsonify()
    @d.trace(log)
    def addLevel(self):
        """Adds a new level to a hierarchy in a dimension.
        
        The dimension and hierarchy should have been created already.
        
        POST Parameters:
        name           -- level name
        dimension_name -- dimension name
        hierarchy_name -- hierarchy name
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            name = request.params.get('name')
            dimension_name = request.params.get('dimension_name')
            hierarchy_name = request.params.get('hierarchy_name')
            log.debug('name: %s; dimension: %s; hierarchy: %s', name, dimension_name, hierarchy_name)
            repository.addLevel(name, dimension_name, hierarchy_name)
            result['response']['status'] = ['hierarchy added']
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_ADD_LEVEL
            return ErrorCodes().asDict(c.errorCode, str(e))
            
        return result

    @d.jsonify()
    #@d.checkAuth(request)
    @d.trace(log)
    def eventXHR(self):
        """Collect an event data into database.
        
        Return JSON-encode HTTP response.
        
        GET/POST Parameters:
        g -- event group name
        e -- event names
        v -- event data values
        d -- dimension values (one for each dimension)
        a -- attribute values (one for each attribute)
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if request.method == 'GET':
                # Atomic event firing via GET
                log.debug('Atomic event')
            elif request.method == 'POST':
                # Batch event firing via POST
                log.debug('Batch event')
            else:
                raise Exception('Unsupported request method: %s' % request.method)
            group = request.params.get('g')
            event = request.params.getall('e')
            value = request.params.getall('v')
            dims = request.params.getall('d')
            attrs = request.params.getall('a')
            log.debug('group: %s; event: %s; value: %s; dimensions: %s; attributes: %s',
                      group, event, value, dims, attrs)
            captureEvent(group, event, value, dims, attrs)
            result['response']['status'] = ['event captured']
            return result
        except Exception, e:
            log.debug('Unexpected error: %s' % str(e))
            log.debug(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_PROCESS_EVENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    #@d.checkAuth(request)
    @d.trace(log)
    def event(self):
        """Collect an event data into database.
        
        Return a 1x1 transparent GIF image.
        
        GET/POST Parameters:
        g -- event group name
        e -- event names
        v -- event data values
        d -- dimension values (one for each dimension)
        a -- attribute values (one for each attribute)
        json -- if set, return a JSON-encoded empty array instead of a 1x1 image
        """
        try:
            if request.method == 'GET':
                # Atomic event firing via GET
                log.debug('Atomic event')
            elif request.method == 'POST':
                # Batch event firing via POST
                log.debug('Batch event')
            else:
                raise Exception('Unsupported request method: %s' % request.method)
            group = request.params.get('g')
            event = request.params.getall('e')
            value = request.params.getall('v')
            dims = request.params.getall('d')
            attrs = request.params.getall('a')
            log.debug('group: %s; event: %s; value: %s; dimensions: %s; attributes: %s',
                      group, event, value, dims, attrs)
            captureEvent(group, event, value, dims, attrs)
        except Exception, e:
            log.debug('Unexpected error: %s' % str(e))
            log.debug(traceback.format_exc())
            
        if request.params.get('json'):
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            result['response'] = ''
            return d.jsonifyResponse(result, datetime.datetime.now())
        else:
            response.content_type = 'image/gif'
            return 'GIF89a\x01\x00\x01\x00\x80\xff\x00\xff\xff\xff\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'

    @d.jsonify()
    #@d.checkAuth(request)
    @d.trace(log)
    def query(self):
        """Process a query.
        
        GET/POST Parameters:
        ml -- metric/event list
        eg -- event group name
        dl -- dimension fields to return
        ft -- filter list
        en -- entitlement filter list
        gb -- group by list
        so -- sort by list
        rp -- rollup flag
        rl -- result field label flag
        nv -- convert null value to specified value
        debug -- debug flag
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            """
            if request.method != 'GET':
                raise Exception('Unsupported request method: %s' % request.method)
            """
            with WallClock('query', 0.01, request.params):
                log.debug("Query parameters: %s", str(request.params))
                rs, query, labels  = process(**request.params)
                # Materialize the result set as a list of tuples as `rs` contains list
                # of sqlalchemy.engine.base.RowProxy objects which cannot be jsonified 
                if request.params.get('rl') in ('1', 'true'):
                    # Return result set as a list of dictionaries with labels as key
                    result['response']['result'] = [dict(zip(labels, row)) for row in rs]
                else:
                    result['response']['result'] = rs
                result['response']['status'] = ['query processed']
                debug = request.params.get('debug', '').lower()
                result['response']['query'] = query if debug in ('1', 'true') else '' 
                log.debug('Query result: %s', str(result))
                return result
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_PROCESS_QUERY
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def deleteData(self):
        """ Delete ADS data
        
        POST Parameters:
        userID -- userID for which to delete all reporting data 
        """
        if request.method != 'POST':
            raise Exception('Unsupported request method: %s' % request.method)

        try:
            userID = int(request.params.get('userID'))
        except Exception, e:
            log.error('UserID not a positive integer.')
            c.errorCode = ErrorCodes.ADS_CANNOT_PROCESS_QUERY
            return ErrorCodes().asDict(c.errorCode, str(e))

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        userTables = 'F_exercise F_fbs_bookmark F_fbs_customize_complete \
F_fbs_customize_start F_fbs_download F_fbs_highlight F_fbs_navigation \
F_fbs_note F_fbs_share F_fbs_time_spent F_fbs_visit F_flx_external_request \
F_hwp_attempt'.split()
        log.debug("Deleting user %d's ADS Data from tables: %s" % (userID, ', '.join(userTables)))
        deletedFrom = []
        rows = 0
        conn = self.connect()
        trans = conn.begin()
        try:
            for table in userTables:
                if conn.execute('SHOW TABLES LIKE "%s"' % table).rowcount:
                    deleted = conn.execute('DELETE FROM %s WHERE userID=%d' % (table, userID))
                    if deleted.rowcount:
                        rows += deleted.rowcount
                        deletedFrom.append(table)
            trans.commit()
            msg = '%d record(s) of data deleted for User %d' % (rows, userID) \
                if rows else 'User has no Report data.'
            result['response']['result'] = [msg]
            result['response']['status'] = ['query processed']
            msg = "%d record(s) successfully deleted from User %d on tables: %s (user has no data in other tables)." % (rows, userID, ', '.join(deletedFrom)) \
                if rows else 'User has no report data.'
            log.debug(msg)
            return result
        except Exception, e:
            trans.rollback()
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_PROCESS_QUERY
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    #@d.checkAuth(request)
    @d.trace(log, ['name'])
    def runCDO(self, name):
        """Process a customer query via a CDO (Customer Data Object).

        Look for a customer query script named cdo__`name`.py under `CDO_DIR`. If the custom script is
        located, invoke the `run()` method of the script. The `run()` method is free to return
        any data structure that can be jsonified.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            """
            if request.method != 'GET':
                raise Exception('Unsupported request method: %s' % request.method)
            """                
            
            log.debug("Custom query name: %s", name)
            cdoDir = os.path.normpath(os.path.join(config['data_dir'], 'cdo'))
            if not cdoDir in sys.path:
                sys.path.append(cdoDir)
            m = __import__('cdo__' + name) 
            result['response']['result'] = m.run(**request.params)
            result['response']['status'] = ['query processed']
            log.debug('Query result: %s', str(result))
            return result
        except Exception, e:
            log.error('Unexpected error: %s' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.ADS_CANNOT_PROCESS_QUERY
            return ErrorCodes().asDict(c.errorCode, str(e))
    
