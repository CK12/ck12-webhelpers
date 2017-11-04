from flx.model.meta import Session
import logging

log = logging.getLogger(__name__)

def run(**kwargs):
    session = Session()
    return dict(session.execute('SELECT bookID, COUNT(DISTINCT conceptID) FROM D_books WHERE bookID in (%s) GROUP BY bookID' % kwargs.get('b', 0)).fetchall())
