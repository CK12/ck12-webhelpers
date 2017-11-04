from functional import compose as single_compose

def compose(*fs):
    return reduce(single_compose, fs)

def nullp(list):
    return len(list) == 0

def car(list):
    return list[0]

def cdr(list):
    return list[1:]

cadr = compose(car, cdr)

cddr = compose(cdr, cdr)

def cons(atom, list):
    basis = [atom]
    basis.extend(list)
    return basis

def append(*lists):
    return reduce(list.__add__, lists)

def dict_merge(*dicts):
    def dict_merge(d1, d2):
        d = dict(d1)
        d.update(d2)
        return d
    return reduce(dict_merge, dicts)

def pairwise(list):
    return zip(list[0::2], list[1::2])

def flatten(l):
    if nullp(l):
        return []
    elif not isinstance(l, list):
        return [l]
    else:
        return append(flatten(car(l)),
                      flatten(cdr(l)))
