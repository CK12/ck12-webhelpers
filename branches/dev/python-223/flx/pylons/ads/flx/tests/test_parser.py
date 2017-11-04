import sys, StringIO
from flx.engine import ftlexer, ftparser, solexer, soparser
from flx.engine.query import _Cache

_DIM1 = [
    'dim1:.',
    'dim1:1',
    'dim1:1.2',
    'dim1:1.2.3',
]

_DIM2 = [
    'dim2:.',
    'dim2:1',
    'dim2:1.2',
    'dim2:1.2.3',
    'dim2:top_level'
]

_DIM3 = [
    'dim3:.',
    'dim3:1',
    'dim3:1.2',
    'dim3:1.2.3',
    'dim3:level_1'
]

_LEGAL_FILTERS = [
    "dim1:top.l2.l1 = 'x'",
    "dim1:top.l2.l1 < 'xyz'",
    "dim1:top.l2.l1 <= 'xyz'",
    "dim1:top.l2.l1 > 'x' and dim2:1.2.3",
    "dim1:top.l2.l1 >= 'x' and dim2:1.2.3",
    "dim1:top.l2.l1 ~= ('a','b','c')",
    "dim1:top.l2.l1 > 'x' and dim2:1.2.3 or dim3:.",
    "attr1 = 'x'",
    "attr1 < 'x'",
    "attr1 <= 'x'",
    "attr1 > 'x'",
    "attr1 >= 'x'",
    "attr1 ~= ('a','b','c')",
    "attr1 = 'x' and attr2 < 'y'",
    "attr1 = 'x' and attr2 < 'y' or attr3 >= 'z'",

    # negated filters    
    "! dim1:top.l2.l1 = 'x'",
    "! dim1:top.l2.l1 < 'xyz'",
    "! dim1:top.l2.l1 <= 'xyz'",
    "! dim1:top.l2.l1 > 'x' and dim2:1.2.3",
    "! dim1:top.l2.l1 > 'x' and !dim2:1.2.3",
    "! dim1:top.l2.l1 >= 'x' and dim2:1.2.3",
    "! dim1:top.l2.l1 >= 'x' and ! dim2:1.2.3",
    "! dim1:top.l2.l1 ~= ('a','b','c')",
    "! dim1:top.l2.l1 > 'x' and dim2:1.2.3 or dim3:.",
    "! dim1:top.l2.l1 > 'x' and !dim2:1.2.3 or dim3:.",
    "! dim1:top.l2.l1 > 'x' and !dim2:1.2.3 or !dim3:.",
    "! attr1 = 'x'",
    "! attr1 < 'x'",
    "! attr1 <= 'x'",
    "! attr1 > 'x'",
    "! attr1 >= 'x'",
    "! attr1 ~= ('a','b','c')",
    "!attr1 = 'x' and attr2 < 'y'",
    "!attr1 = 'x' and !attr2 < 'y'",
    "!attr1 = 'x' and !attr2 < 'y' or !attr3 >= 'z'",
]

_ILLEGAL_FILTERS = [
    '',
    'dim1',
    'dim1:10.l2.l1',
    'dim1:1 dim2:2.2 xxx dim3:3.3',
]

_LEGAL_DIM_SORTINGS = [
    'dim1:level1 asc',
    'dim2:level2 desc',
    'dim1:level1 asc, dim2:level2 desc',
]

_LEGAL_ATTR_SORTINGS = [
    'attr1 ASC',
    'attr2 DESC',
    'attr1 ASC, attr2 DESC',
]

_LEGAL_POS_SORTINGS = [
    '1 ASC',
    '2 DESC',
    '1 ASC, 2 DESC',
    '19 desc',
    '20 asc',
    '19 desc, 20 asc',
]

_count = 0

def test_parser():
    for i in _DIM1:
        _parseFilter(i)

    for i in _DIM1:
        for j in _DIM2: 
            for k in _DIM3:
                _parseFilter('%s %s %s' % (i, j, k))
                _parseFilter('%s  %s  %s' % (i, j, k))
                _parseFilter('%s\t%s\t%s' % (i, j, k))
                
    for i in _LEGAL_FILTERS:
        _parseFilter(i)

    for i in _ILLEGAL_FILTERS:
        try:
            _parseFilter(i)
        except ftparser.Parser.ParserException, e:
            pass
        except Exception, e:
            print >>sys.stderr, str(e)
            raise

    sys.stderr.write('Test %d filters ... ' % _count)

def _parseFilter(filterString):
    global _count 
    _count += 1
    lexer = ftlexer.Lexer(StringIO.StringIO(filterString))
    parser = ftparser.Parser(lexer)
    parser.filter_list()
    ast = parser.getAST()
    _walk(ast, level=0)

def _walk(ast, level=0):
    if not ast: return
    _walk(ast.getFirstChild(), level+1)
    _walk(ast.getNextSibling(), level)

def test_sort():
    global _count
    _count = 0
    for i in _LEGAL_DIM_SORTINGS:
        for j in _LEGAL_ATTR_SORTINGS: 
            for k in _LEGAL_POS_SORTINGS: 
                _parseSort('%s %s %s' % (i, j, k))
                _parseSort('%s  %s\t%s' % (i, j, k))
                _parseSort('\t%s\t%s  %s' % (i, j, k))
                
    sys.stderr.write('Test %d sorts ... ' % _count)

def _parseSort(sortString):
    global _count 
    _count += 1
    lexer = solexer.Lexer(StringIO.StringIO(sortString))
    parser = soparser.Parser(lexer)
    parser.sort_list()
    ast = parser.getAST()
    _walk(ast, level=0)

def test_cache():
    _queryCache = _Cache(10)
    params1 = {'ml':'1', 'al':'2', 'dl':'3', 'ft':'4', 'gb':'5', 'so':'6', 'en':'7', 'rp':'8', 'eg':'9', 'xyz':'10'}
    params2 = {'abc':'10', 'eg':'9', 'rp':'8', 'dl':'3', 'ft':'4', 'gb':'5', 'so':'6', 'en':'7', 'al':'2', 'ml':'1'}
    query = 'query'
    assert id(params1) != id(params2)
 
    _queryCache.clear()
    assert len(_queryCache) == 0
    
    _queryCache.push(params1, query)
    assert len(_queryCache) == 1
    entry = _queryCache.get(params1)
    assert entry and id(entry) == id(query)
    
    entry = _queryCache.get(params2)
    assert entry and id(entry) == id(query)
    
    n = _queryCache.cacheSize
    for i in xrange(2*n):
        _queryCache.push({'ml':'%s' % i}, 'query%s' % i)
    assert len(_queryCache) == n

    _objCache = _Cache(10)
    key1 = 'key1'
    key2 = u'key1'
    key3 = 'key3'
    obj1 = object()
    obj2 = object()
    obj3 = object()
 
    _objCache.clear()
    assert len(_objCache) == 0
    
    _objCache.push(key1, obj1)
    assert len(_objCache) == 1
    entry = _objCache.get(key1)
    assert entry and id(entry) == id(obj1)
    
    entry = _objCache.get(key2)
    assert entry and id(entry) == id(obj1)
    _objCache.push(key2, obj2)
    assert len(_objCache) == 1
    entry = _objCache.get(key2)
    assert entry and id(entry) == id(obj2)

    entry = _objCache.get(key3)
    assert entry is None
    _objCache.push(key3, obj3)
    assert len(_objCache) == 2
    entry = _objCache.get(key3)
    assert entry and id(entry) == id(obj3)
    
    _objCache.clear()
    n = _objCache.cacheSize
    for i in xrange(2*n):
        _objCache.push('key%s' % i, object())
    assert len(_objCache) == n
     
