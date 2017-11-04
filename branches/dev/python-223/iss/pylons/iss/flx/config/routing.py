"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from routes import Mapper

def make_map(config):
    """Create, configure and return the routes Mapper"""
    map = Mapper(directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'])
    map.minimization = False
    map.explicit = False

    # The ErrorController route (handles 404/500 error pages); it should
    # likely stay at the top, ensuring it can always be resolved
    map.connect('/error/{action}', controller='error')
    map.connect('/error/{action}/{id}', controller='error')
    map.connect('/get/error/{action}/{id}', controller='error')

    # CUSTOM ROUTES HERE
    map.connect('/create/resourceSatellite', controller='resource', action='createResourceSatellite')
    map.connect('/delete/resource', controller='resource', action='deleteResource')
    map.connect('/update/resource', controller='resource', action='updateResource')
    map.connect('/update/resource/hash', controller='artifact', action='updateResourceHash')
    map.connect('/get/info/resource/checksum/{checksum}', controller='resource', action='getResourceByChecksum')                                                                                               
    map.connect('/get/info/resource/{type}/{id}/{revisionID}', controller='resource', action='getInfo')
    map.connect('/get/info/resource/{type}/{id}', controller='resource', action='getInfo')
    map.connect('/get/info/resource/{id}/{revisionID}', controller='resource', action='getInfo')
    map.connect('/get/info/resource/{id}', controller='resource', action='getInfo')

    map.connect('/{controller}/{action}')
    map.connect('/{controller}/{action}/{id}')

    return map
