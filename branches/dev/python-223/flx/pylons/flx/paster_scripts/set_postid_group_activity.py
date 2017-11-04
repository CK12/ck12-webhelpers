import json
from sqlalchemy.sql import and_
from flx.model import model, meta

def run():
    session = meta.Session()
    session.begin()
    try:
        query = session.query(model.GroupActivity).filter(
            and_(
                model.GroupActivity.objectID == '0',
                model.GroupActivity.objectType == 'peerhelp_post',
            )
        )
        i = 0
        for activity in query.all():
            data = json.loads(activity.activityData)
            activity.objectID = data['post']['_id']
            session.add(activity)
            i = i + 1
        session.commit()
        print 'Updated %d rows' % i
    except Exception as e:
        print e
        session.rollback()
