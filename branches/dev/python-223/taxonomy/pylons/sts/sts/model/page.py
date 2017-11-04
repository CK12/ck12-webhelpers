class Subset(object):

    def __init__(self, query, offset, limit, isGraphModel):
        if isGraphModel:
            self.results = query
            self.total = len(self.results)
        else:
            if limit <= 0:
                self.results = query.all()
                self.total = len(self.results)
            else:
                self.total = query.count()
                self.results = query.offset(offset).limit(limit).all()

    def __repr__(self):
        return str(vars(self))

    def __len__(self):
        return len(self.results)

    def __getitem__(self, i):
        return self.results[i]

    def __iter__(self):
        return iter(self.results)

    def getTotal(self):
        return self.total

class Page(Subset):

    def __init__(self, query, pageNum, pageSize, isGraphModel=False):
        self.num = pageNum
        self.size = pageSize

        if self.size > 0:
            offset = (self.num - 1)*self.size
        else:
            offset = 0
        Subset.__init__(self, query, offset, self.size, isGraphModel)
        if self.size <= 0:
            self.pages = 1
        else:
            self.pages = 1 + (self.total - 1)/self.size
