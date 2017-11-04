from __future__ import with_statement
import logging, datetime
from sqlalchemy.orm.exc import NoResultFound
from flx.engine.utils import sqlQuote
from flx.model.model import EventGroup, Event, Measure
from flx.model.api import _transactional
from flx.engine.query import _measureCache
from flx.controllers.celerytasks.ads import logEvent
from flx.controllers.celerytasks.eventlogger import _cacheTimeDimension, _time_dim, EventWriter

log = logging.getLogger(__name__)

class EventError(Exception):
    pass

@_transactional()
def captureEvent(groupName, eventNames, eventValues, dimensions, attributes, session):
    """Captures an event.
    
    Arguments:
    groupName   -- event group name
    eventNames  -- event names
    eventValues -- event data values
    dimensions  -- foreign keys to dimension (one for each dimension)
    attributes  -- attribute values (one for each attribute)    
    """
    try:
        values = [str(float(i)) for i in eventValues]
    except ValueError:
        raise EventError('Invalid event value`%s`' % eventValues)

    try:
        gn = groupName.lower()
        group = _measureCache.get(gn)
        if not group:
            group = session.query(EventGroup).filter(EventGroup.name == gn).one()
            _measureCache.push(gn, group)
        if len(dimensions) != len(group.associations)-1:  # excluding time dimension
            raise EventError('Incorrect number of dimension values: %d given, should be %d' % \
                             (len(dimensions), len(group.associations)-1))
        if len(attributes) != len(group.attributes):
            raise EventError('Incorrect number of attribute values: %d given, should be %d' % \
                             (len(attributes), len(group.attributes)))
    except NoResultFound:
        raise EventError('Event group with name `%s` does not exist' % groupName)
    except EventError:
        raise
    except Exception, e:
        raise EventError('Error in locating group name: `%s`; error: %s' % (groupName, e))

    try:
        events = []
        for i in eventNames:
            en = i.lower()
            cacheKey = '%s.%s' % (gn, en)
            event = _measureCache.get(cacheKey)
            if not event:
                try:
                    event = session.query(Event).filter(Event.name == en).filter(Event.eventgroup_id == group.id).one()
                except NoResultFound:
                    raise EventError('Event with name `%s` does not exist' % i)
                _measureCache.push(cacheKey, event)
            events.append(event)
    except EventError:
        raise
    except Exception, e:
        log.debug('Failed to process events: %s', str(e))
        raise EventError('Failed to process events: %s', eventNames)

    # Screen event values and discard those outside min/max thresholds
    for i in xrange(len(eventValues)):
        if (events[i].min_value is not None and float(eventValues[i]) < events[i].min_value) or \
           (events[i].max_value is not None and float(eventValues[i]) > events[i].max_value):
            eventValues[i] = ''
    if not any(eventValues):
        return
        
    if group.latency == Measure.LATENCY_RT:
        # Store the event data directly into database
        dml = 'INSERT INTO %s (' % sqlQuote(group.tablename)
        columns = [sqlQuote(i.name) for i in events]
        columns.extend(['%sID' % i.dimension.hierarchies[0].levels[-1].name for i in group.associations])
        columns.extend(['%s' % sqlQuote(i.name) for i in group.attributes])
        dml += ','.join(columns).lstrip(',') + ') VALUES(%s' % ','.join(values)
        
        # time dimension value
        _cacheTimeDimension(session)
        dateID = _time_dim.get(datetime.date.today())
        dml += ',%s' % dateID
        
        if dimensions:
            dml += ',' + ','.join([i or 'NULL' for i in dimensions])
        if attributes:
            dml += ',' + ','.join(['%s' for i in attributes]) + ')'
        else:
            dml += ')'
        log.debug('Event DML: %s', dml)
        session.connection().execute(dml, attributes)        
    else:
        # Log the event data to data file that will be imported at later time. Values
        # passed to Celery task need to be in the order of EventGroup.events list.
        valuesDict = dict(zip([i.name for i in events], values))
        sorted = []
        for i in group.events:
            sorted.append(valuesDict.get(i.name))
        record = sorted
        record.append(EventWriter.TIME_DIM_VALUE)
        record.extend([i or None for i in dimensions])
        record.extend(attributes)
        logEvent.apply_async(args=[group.tablename, record])
    