import logging

from flx.model import meta

log = logging.getLogger(__name__)

class Subset(object):

    def __init__(self, query, offset, limit, tableName=None, countCol=None, countOnly=False):
        if not countOnly and limit <= 0:
            self.results = query.all()
            self.__total = len(self.results)
        else:
            self.__total = None
            if countOnly:
                offset = 0
                limit = 1
            query = query.prefix_with('SQL_CALC_FOUND_ROWS')
            self.results = query.offset(offset).limit(limit).all()
            countStatement = 'SELECT FOUND_ROWS();'
            session = meta.Session()
            self.__total = session.execute(countStatement).fetchall()[0][0]
        self.query = query
        self.countCol = countCol

    def __repr__(self):
        return str(vars(self))

    def __len__(self):
        return len(self.results)

    def __getitem__(self, i):
        return self.results[i]

    def __setitem__(self, i, item):
        self.results[i] = item

    def __iter__(self):
        return iter(self.results)

    def getTotal(self):
        return self.__total

    total = property(getTotal)

class Page(Subset):

    def __init__(self, query, pageNum, pageSize, tableName=None, countCol=None, countOnly=False):
        self.num = pageNum
        self.size = pageSize
        self.tableName = tableName
        self.countCol = countCol

        if self.size > 0:
            offset = (self.num - 1)*self.size
        else:
            offset = 0
        Subset.__init__(self, query, offset, self.size, tableName=tableName, countCol=countCol, countOnly=countOnly)
        if self.size <= 0:
            self.__pages = 1
        else:
            self.__pages = None

    def __getPages(self):
        if self.__pages is None:
            self.__pages = 1 + (self.total - 1)/self.size
        return self.__pages
    
    pages = property(__getPages)
