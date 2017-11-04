import logging, copy

log = logging.getLogger(__name__)

class Aggregate(object):
    """Perform in-memory OLAP-style aggregation against data set returned from MySQL.
    
    Typically this type of aggregations involves inter-row computation and cannot
    be processed in standard SQL queries. Some relational database vendors, like
    Oracle and Sybase, extend SQL to support such aggregation, but MySQL does not
    have such capability.
    """
    
    SUM, AVG, COUNT, MIN, MAX, VAL = 1, 2, 3, 4, 5, 6
    
    def __init__(self, grouping, aggregates, sorts=[], rollup=False):
        """Captures meta data for OLAP style aggregation over a data set.
        
        The aggregation is to be performed over data set fetched from MySQL
        in the format: [[value1, value2, ..., dim1, dim2, ...], ...]
        
        Arguments:
        grouping   -- array of dimension indices to be grouped
        aggregates -- [(<aggregate type>, value field index), ...]
        sorts      -- [(column index), asc|desc), ...]
        """
        self.grouping = grouping
        self.aggregates = aggregates
        self.sorts = sorts
        self.rollup = rollup
        #logging.debug('sorts: %s', sorts)

    def run(self, data):
        """Performs the aggregation.
        
        Arguments:
        data -- two dimensional array fetched from MySQL in the format of [[value, value, ..., dim, dim, ...], ...]
        """
        _sort(data, self.grouping)
        rs, group, counter, rpCounter = [], [], [], []
        for i in data:
            if not group:
                group = i
                for j in self.aggregates:
                    value = i[j[1]]  # can be None
                    counter.append({ self.SUM: value, self.COUNT: 1 if value else 0, self.MIN: value, self.MAX: value })
                continue

            if [group[j] for j in self.grouping] == [i[j] for j in self.grouping]:
                # Same group
                for j in self.aggregates:
                    value = i[j[1]]
                    if value is None:
                        continue
                    if counter[j[1]][self.SUM] is not None:
                        counter[j[1]][self.SUM] += value
                    else:
                        counter[j[1]][self.SUM] = value
                    counter[j[1]][self.COUNT] += 1
                    if counter[j[1]][self.MIN] is not None:
                        counter[j[1]][self.MIN] = min(counter[j[1]][self.MIN], value)
                    else:
                        counter[j[1]][self.MIN] = value
                    if counter[j[1]][self.MAX] is not None:
                        counter[j[1]][self.MAX] = max(counter[j[1]][self.MAX], value)
                    else:
                        counter[j[1]][self.MAX] = value
                continue
                                                     
            # Beginning of a new group -- push the aggregate into result set and
            # handle rollup.
            row = copy.copy(group)
            for j in self.aggregates:
                if j[0] == self.SUM:
                    row[j[1]] = counter[j[1]][self.SUM]
                elif j[0] == self.AVG:
                    if counter[j[1]][self.SUM] is not None and counter[j[1]][self.COUNT]:
                        row[j[1]] = counter[j[1]][self.SUM] / counter[j[1]][self.COUNT]
                    else:
                        row[j[1]] = None
                elif j[0] == self.COUNT:
                    row[j[1]] = counter[j[1]][self.COUNT]
                elif j[0] == self.MIN:
                    row[j[1]] = counter[j[1]][self.MIN]
                elif j[0] == self.MAX:
                    row[j[1]] = counter[j[1]][self.MAX]
                else:
                    raise Exception('Illegal aggregate type: %s' % j[0])
            rs.append(row)
            if rpCounter:
                # Add a new group to existing rollup value
                for j in self.aggregates:
                    value = row[j[1]]
                    if value is None:
                        continue
                    if rpCounter[j[1]][self.SUM] is not None:
                        rpCounter[j[1]][self.SUM] += value
                    else:
                        rpCounter[j[1]][self.SUM] = value
                    rpCounter[j[1]][self.COUNT] += 1
                    if rpCounter[j[1]][self.MIN] is not None:
                        rpCounter[j[1]][self.MIN] = min(rpCounter[j[1]][self.MIN], value)
                    else:
                        rpCounter[j[1]][self.MIN] = value
                    if rpCounter[j[1]][self.MAX] is not None:
                        rpCounter[j[1]][self.MAX] = max(rpCounter[j[1]][self.MAX], value)
                    else:
                        rpCounter[j[1]][self.MAX] = value
            else:
                rpCounter = copy.copy(counter)  # first group added to rollup 
            group = i
            counter = []
            for j in self.aggregates:
                value = i[j[1]]  # can be None
                counter.append({ self.SUM: value, self.COUNT: 1 if value else 0, self.MIN: value, self.MAX: value })
        
        if group:
            # Push the last aggregate group into result set.
            row = copy.copy(group)
            for j in self.aggregates:
                if j[0] == self.SUM:
                    row[j[1]] = counter[j[1]][self.SUM]
                elif j[0] == self.AVG:
                    if counter[j[1]][self.SUM] is not None and counter[j[1]][self.COUNT]:
                        row[j[1]] = counter[j[1]][self.SUM] / counter[j[1]][self.COUNT]
                    else:
                        row[j[1]] = None
                elif j[0] == self.COUNT:
                    row[j[1]] = counter[j[1]][self.COUNT]
                elif j[0] == self.MIN:
                    row[j[1]] = counter[j[1]][self.MIN]
                elif j[0] == self.MAX:
                    row[j[1]] = counter[j[1]][self.MAX]
                else:
                    raise Exception('Illegal aggregate type: %s' % j[0])
            rs.append(row)
            if rpCounter:
                # Add a new group to existing rollup value
                for j in self.aggregates:
                    value = row[j[1]]
                    if value is None:
                        continue
                    if rpCounter[j[1]][self.SUM] is not None:
                        rpCounter[j[1]][self.SUM] += value
                    else:
                        rpCounter[j[1]][self.SUM] = value
                    rpCounter[j[1]][self.COUNT] += 1
                    if rpCounter[j[1]][self.MIN] is not None:
                        rpCounter[j[1]][self.MIN] = min(rpCounter[j[1]][self.MIN], value)
                    else:
                        rpCounter[j[1]][self.MIN] = value
                    if rpCounter[j[1]][self.MAX] is not None:
                        rpCounter[j[1]][self.MAX] = max(rpCounter[j[1]][self.MAX], value)
                    else:
                        rpCounter[j[1]][self.MAX] = value
            else:
                rpCounter = copy.copy(counter)  # first group added to rollup 
            
        if self.rollup and rs:
            rp = [None for i in rs[0]]
            for j in self.aggregates:
                if j[0] == self.SUM:
                    rp[j[1]] = rpCounter[j[1]][self.SUM]
                elif j[0] == self.AVG:
                    if rpCounter[j[1]][self.SUM] is not None and rpCounter[j[1]][self.COUNT]:
                        rp[j[1]] = rpCounter[j[1]][self.SUM] / rpCounter[j[1]][self.COUNT]
                    else:
                        rp[j[1]] = None
                elif j[0] == self.COUNT:
                    rp[j[1]] = rpCounter[j[1]][self.COUNT]
                elif j[0] == self.MIN:
                    rp[j[1]] = rpCounter[j[1]][self.MIN]
                elif j[0] == self.MAX:
                    rp[j[1]] = rpCounter[j[1]][self.MAX]
                else:
                    raise Exception('Illegal aggregate type: %s' % j[0])
            rs.append(rp)
        if not rs:
            return []
        if self.rollup:
            result = _multisort(rs[:-1], self.sorts)
            result.append(rs[-1])
        else:
            result = _multisort(rs, self.sorts)
        return result

def _sort(data, grouping):
    """Sorts a two-dimensional data set.
    
    Arguments:
    data     -- a two-dimensional array
    grouping -- sort column indices (zero-based)
    """
    data.sort(key=lambda i: ''.join(['%s' % i[j] for j in grouping]))

def _multisort(data, spec):
    """Sorts a two-dimensional data set by multiple columns.
    
    Arguments:
    data -- a two-dimensional array
    spec -- list of (sort column indices (zero-based), asc|desc)
    """
    if not (data and spec):
        return data
    
    column, order = spec[0]
    indexes = [i for i in xrange(len(data))]
    indexes.sort(key=lambda i: data[i][column], reverse=order=='desc')
    sorted = [data[i] for i in indexes]
    
    if len(spec) == 1:
        return sorted
    
    # Break data into sorted chunks to be sorted by next sort column recursively.
    chunk, result = 0, []
    for i in xrange(len(sorted)):
        if sorted[i][column] != sorted[chunk][column]:
            # new chunk
            result.extend(_multisort(sorted[chunk:i], spec[1:]))
            chunk = i
    result.extend(_multisort(sorted[chunk:], spec[1:]))
    return result

    
