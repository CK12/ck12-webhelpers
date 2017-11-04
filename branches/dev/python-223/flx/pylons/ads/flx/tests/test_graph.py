from flx.engine.repository import _walkGraph

_graphs = [
    {
        1:[2,3],
        3:[2,4,5,7],
        4:[6],
        5:[6],
        6:[7],
        9:[8]
    },
    {
        1:[3,4],
        2:[5],
        6:[1,2],
        7:[6],
        9:[8]
    },
    {
        1:[2],
        2:[1]
    },
    {
        1:[2],
        2:[3],
        3:[1]
    }
]

_pairs = [
    26,
    24,
     4,
     9
]

def _flatten(graph):
    pairs = {}
    for i in graph:
        pairs.update(_walkGraph(graph, [], i))
    
    pairs = pairs.keys()
    pairs.sort(lambda x,y: (x[0]*10+x[1])-(y[0]*10+y[1]))
    return pairs

def test_graph():
    for i, g in enumerate(_graphs):
        pairs = _flatten(g)
        assert len(pairs) == _pairs[i]
