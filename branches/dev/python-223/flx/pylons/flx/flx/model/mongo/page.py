import logging

log = logging.getLogger(__name__)

class Page():
    def __init__(self, collection, query, pageNum, pageSize, method="find", sort=[], projection=None):
        log.debug("Page::query: %s" % query)
        self.num = pageNum
        self.size = pageSize
        self.collection = collection
        
        if self.size > 0 and self.num:
            offset = (self.num - 1)*self.size
        else:
            offset = 0

        self.results = []
        self.total = 0
        if method == 'find':
            self.total = self.collection.find(query).count()
            log.debug("Projection: %s" % projection)
            log.info("Getting results skip: %d, limit: %d" % (offset, self.size))
            if sort:
                log.info("Page(): Sort: %s" % str(sort))
                # If this method is called by '/browse/info/questions/{types}' API, then don't show standards,credits,license & source in response 
                docs = self.collection.find(query, projection, skip=offset, limit=self.size).sort(sort)
            else:
                docs = self.collection.find(query, projection, skip=offset, limit=self.size)
            for d in docs:
                self.results.append(d)
        elif method == 'aggregate':
            self.total = -1 
            if isinstance(query,dict):
                query = [query]
            if pageNum > 0: 
                query.append({'$skip'  : offset })
            if self.size:
                query.append({'$limit' : self.size })
            result = self.collection.aggregate(query)
            docs = []
            if result and int(result['ok']) == 1:
               docs = result['result']
            else:
               log.error('There was an error fetching the results by aggregation query:(%s)' %  query) 
            for d in docs:
                self.results.append(d)

        if self.size <= 0:
            self.__pages = 1
        else:
            self.__pages = None

    def __getPages(self):
        if self.__pages is None:
            self.__pages = 1 + (self.total - 1)/self.size
        return self.__pages

    def getTotal(self):
        return self.total
    
    def __repr__(self):
        return str(vars(self))

    def __len__(self):
        return len(self.results)

    def __getitem__(self, i):
        return self.results[i]

    def __iter__(self):
        return iter(self.results)

    def getResultCount(self):
        return len(self.results)

    pages = property(__getPages) 
