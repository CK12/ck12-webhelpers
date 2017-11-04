import logging
import os

from flx.model import meta

log = logging.getLogger(__name__)

class Migrate(object):

    def __init__(self, url=None):
        """
            Initialize the migration relation instance.

            url     The URL for connecting to the database.
        """
        if meta.engine is None:
            from sqlalchemy import create_engine, orm

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                  autocommit=True,
                                  bind=meta.engine)
            meta.Session = orm.scoped_session(sm)
        self.connection = meta.engine.connect()

        self.dicts = {}

    def getTable(self, table, where=None, order=None, includeDict=False):
        """
            Retrieve the database table and return all the rows.

            table       Name of the database table.
            where       The where clause. Defaults to None.
            order       The retrieval order (order by clause). Defaults to None.
            includeDict Whether to include an additional dictionary or not.
                        This dictionary will have value from the column 'id'
                        as the key for each row. Defaults to False.

            Return the list of rows. Each row is a dictionary with the column
            names as keys. If includDict is True, then the dictionary will
            also be returned.
        """
        s = table.select() if where is None else table.select(where)
        if order is not None:
            from sqlalchemy.sql.expression import asc

            s = s.order_by(asc(order))
        columns = table._columns.keys()
        rs = self.connection.execute(s)
        relationList = []
        if includeDict:
            relationDict = {}
        for row in rs:
            tupleDict = {}
            for n in range(0, len(columns)):
                from datetime import datetime

                column = row[n]
                if type(column) is not datetime:
                    r = unicode(column)
                else:
                    r = column.isoformat()
                if r == "None":
                    r = None
                tupleDict[columns[n]] = r
                if includeDict and columns[n] == 'id':
                    relationDict[r] = tupleDict
            relationList.append(tupleDict)
        if not includeDict:
            return relationList

        return relationList, relationDict
