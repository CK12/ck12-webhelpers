"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from pylons import config
from routes import Mapper

def make_map():
    """Create, configure and return the routes Mapper"""
    map = Mapper(directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'], explicit=True)
    map.minimization = False

    # The ErrorController route (handles 404/500 error pages); it should
    # likely stay at the top, ensuring it can always be resolved
    map.connect('/error/{action}', controller='error')
    map.connect('/error/{action}/{id}', controller='error')

    map.connect('/get/error/{action}/{id}', controller='error')

    # CUSTOM ROUTES HERE
    # Domain can have an optional domain field as an additional level.

    #
    # Event Collection API
    #
    map.connect('/event', controller='ads', action='event')
    map.connect('/ads/event', controller='ads', action='event')
    map.connect('/event/xhr', controller='ads', action='eventXHR')
    map.connect('/ads/event/xhr', controller='ads', action='eventXHR')

    #
    # Data Retrieval/Update API
    #
    map.connect('/query', controller='ads', action='query')
    map.connect('/query/cdo/{name}', controller='ads', action='runCDO')
    map.connect('/delete/data', controller='ads', action='deleteData')

    #
    # Meta Repository Management API
    #
    map.connect('/meta/register/eventgroup', controller='ads', action='registerEventGroup')
    map.connect('/meta/register/event', controller='ads', action='registerEvent')
    map.connect('/meta/register/metric', controller='ads', action='registerMetric')
    map.connect('/meta/register/dimension', controller='ads', action='registerDimension')
    map.connect('/meta/add/hierarchy', controller='ads', action='addHierarchy')
    map.connect('/meta/add/level', controller='ads', action='addLevel')
    map.connect('/meta/add/attribute', controller='ads', action='addAttribute')
    map.connect('/meta/set/dimension/loadscript', controller='ads', action='setDimensionLoadScript')
    map.connect('/meta/set/dimension/updatescript', controller='ads', action='setDimensionUpdateScript')
    map.connect('/meta/load/dimension', controller='ads', action='loadDimension')

    #
    # Guidance API
    #
    map.connect('/guidance/mastery', controller='guidance', action='mastery')
    map.connect('/guidance/mastery/levels', controller='guidance', action='levels')
    map.connect('/guidance/advice', controller='guidance', action='advice')
    map.connect('/guidance/nextsteps', controller='guidance', action='nextsteps')
        
    #
    # Demo pages
    #
    map.connect('/demo', controller='demo', action='demo')

    return map
