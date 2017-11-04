import json
from sqlalchemy.sql import and_
from flx.model import model, meta

def run():
    session = meta.Session()
    session.begin()
    try:
        query = session.query(model.Event, model.EventType).filter(
            and_(
                model.EventType.name.in_(['GROUP_PH_POST', 'PH_POST', 'GROUP_PH_POST_WEB']),
                model.Event.eventTypeID == model.EventType.id,
                model.Event.subObjectID == None
            )
        )
        i = 0
        for event, eventType in query.all():
            data = json.loads(event.eventData)
            event.subObjectID = data['post']['_id']
            i = i + 1
        session.commit()
        print 'Updated %d rows' % i
    except Exception as e:
        print e
        session.rollback()
