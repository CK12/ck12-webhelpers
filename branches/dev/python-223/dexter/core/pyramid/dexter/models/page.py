import logging

log = logging.getLogger(__name__)

class Page():
    def __init__(self, collection, query, pageNum, pageSize, sort=[], outputFields={}):
        log.debug("Page::query: %s" % query)
        self.num = pageNum
        self.size = pageSize
        self.collection = collection

        if self.size > 0 and self.num:
            offset = (self.num - 1)*self.size
        else:
            offset = 0

        self.total = self.collection.find(query).count()
        self.results = []
        log.info("Getting results skip: %d, limit: %d" % (offset, self.size))
        if sort:
            log.info("Page(): Sort: %s" % str(sort))
            # Check if we need to return only specific fields.
            if outputFields:
                docs = self.collection.find(query, outputFields, skip=offset, limit=self.size).sort(sort)
            else:
                docs = self.collection.find(query, skip=offset, limit=self.size).sort(sort)
        else:
            if outputFields:
                docs = self.collection.find(query, outputFields, skip=offset, limit=self.size)
            else:
                docs = self.collection.find(query, skip=offset, limit=self.size)
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
