import logging

log = logging.getLogger(__name__)

class Subset(object):

    def __init__(self, query, offset, limit, tableName=None, countCol=None):
        if limit <= 0:
            self.results = query.all()
            self.__total = len(self.results)
        else:
            self.__total = None
            self.results = query.offset(offset).limit(limit).all()
            if offset == 0:
                #
                #  If we got the total in one call, then set the
                #  total count here.
                #
                if not self.results:
                    self.__total = 0
                elif limit > len(self.results):
                    self.__total = len(self.results)
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
        if self.__total is None:
            from sqlalchemy import func
            from flx.model import meta
            if self.tableName is None or self.query.whereclause is not None or self.query._join_entities:
                ## Source: https://gist.github.com/hest/8798884
                ## Also remove group_by (bug #51969)
                if self.countCol:
                    from sqlalchemy import distinct

                    count_q = self.query.statement.with_only_columns([func.count(distinct(self.countCol))]).order_by(None)
                else:
                    count_q = self.query.statement.with_only_columns([func.count()]).order_by(None)
                if not self.query._prefixes or 'SQL_CACHE' not in self.query._prefixes:
                    count_q = count_q.prefix_with('SQL_CACHE')
            else:
                count_q = 'select SQL_CACHE count(*) from %s where 1=1' % self.tableName

            session = meta.Session()
            log.debug("Count query optimized: %s" % count_q)
            r = session.execute(count_q)
            if not self.query._group_by:
                first = r.first()
                ## Bug #51969 first() returns None if there are no rows in some cases when 'group by' is used.
                if first:
                    (self.__total,) = first
                else:
                    self.__total = 0
            else:
                self.__total = r.rowcount
            log.debug("self.__total: %d" % self.__total)
        return self.__total

    total = property(getTotal)

class Page(Subset):

    def __init__(self, query, pageNum, pageSize, tableName=None, countCol=None):
        self.num = pageNum
        self.size = pageSize
        self.tableName = tableName
        self.countCol = countCol

        if self.size > 0:
            offset = (self.num - 1)*self.size
        else:
            offset = 0
        Subset.__init__(self, query, offset, self.size, tableName=tableName, countCol=countCol)
        if self.size <= 0:
            self.__pages = 1
        else:
            self.__pages = None

    def __getPages(self):
        if self.__pages is None:
            self.__pages = 1 + (self.total - 1)/self.size
        return self.__pages
    
    pages = property(__getPages)
