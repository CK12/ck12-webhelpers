from pyramid.config import Configurator
from pyramid.events import NewRequest

from gridfs import GridFS
import pymongo
from pyramid_beaker import session_factory_from_settings
from pyramid_beaker import set_cache_regions_from_settings

import logging
log = logging.getLogger(__name__)

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    #engine = engine_from_config(settings, 'sqlalchemy.')
    #DBSession.configure(bind=engine)
    #Base.metadata.bind = engine

    set_cache_regions_from_settings(settings)
    config = Configurator(settings=settings)

    ## Add support for jinja2 templates
    config.include('pyramid_jinja2')
    ## Add support for beaker
    config.include('pyramid_beaker')

    config.add_static_view('static', 'static', cache_max_age=3600)

    from dexter.lib.helpers import getDBAndCollectionFromUrl
    db_url, dbname, collection = getDBAndCollectionFromUrl(settings['mongo_uri'])
    log.debug("db_url[%s], dbname[%s], collection[%s]" % (db_url, dbname, collection))
    max_pool_size = int(settings['mongo.max_pool_size'])
    replica_set = settings.get('mongo.replica_set')
    if replica_set:
        conn = pymongo.MongoReplicaSetClient(hosts_or_uri=db_url, max_pool_size=max_pool_size,
            replicaSet=replica_set, read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
        log.debug("Using Replica Set: %s" % replica_set)
    else:
        conn = pymongo.MongoClient(host=db_url, max_pool_size=max_pool_size)
    config.registry.settings['db_conn'] = conn

    def add_mongo_db(event):
        settings = event.request.registry.settings
        db = settings['db_conn'][dbname]
        event.request.db = db
        event.request.fs = GridFS(db)

    config.add_subscriber(add_mongo_db, NewRequest)

    session_factory = session_factory_from_settings(settings)
    config.set_session_factory(session_factory)

    # home 
    config.add_route('home', '/')

    ##Client Related
    config.add_route('get_client', '/get/client')
    config.add_route('register_client', '/register/client')
    config.add_route('update_client', '/update/client')
    config.add_route('unregister_client', '/unregister/client')
    config.add_route('get_clients', '/get/clients')
    config.add_route('get_clients_form', '/get/clientsForm')
    config.add_route('register_client_form', '/register/clientForm')
    config.add_route('unregister_client_form', '/unregister/clientForm')

    ##Event task Related
    config.add_route('get_event_task', '/get/event_task')
    config.add_route('register_event_task', '/register/event_task')
    config.add_route('unregister_event_task', '/unregister/event_task')
    config.add_route('update_event_task', '/update/event_task')
    config.add_route('get_event_tasks', '/get/event_tasks')

    ##Events Related
    config.add_route('register_event', '/register/event')
    config.add_route('unregister_event', '/unregister/event')
    config.add_route('record_event', '/record/event')
    config.add_route('record_event_bulk', '/record/event/bulk')
    config.add_route('record_event_bulk_zip', '/record/event/bulk/zip')
    config.add_route('get_bulk_zip_test_form', '/test/bulkzipForm')
    config.add_route('get_event', '/get/event')
    config.add_route('get_resolved_event', '/get/resolved_event')
    config.add_route('get_eventtypes_by_client_id', '/get/eventTypes')
    config.add_route('register_event_form', '/register/eventForm')
    config.add_route('unregister_event_form', '/unregister/eventForm')
    config.add_route('get_eventtype_form', '/get/eventTypesForm')

    ##Parameters Related
    config.add_route('get_parameter', '/get/parameter')
    config.add_route('register_parameter', '/register/parameter')
    config.add_route('unregister_parameter', '/unregister/parameter')
    config.add_route('update_parameter', '/update/parameter')
    config.add_route('register_parameter_form', '/register/parameterForm')
    config.add_route('unregister_parameter_form', '/unregister/parameterForm')
    config.add_route('get_parameters', '/get/parameters')
    config.add_route('get_parameters_form', '/get/parametersForm')

    # Rules Related
    config.add_route('create_rule', '/create/rule')
    config.add_route('get_rules', '/get/rules')
    #config.add_route('get_question_type_info', '/get/info/questionType/{id}')

    ## Entity Related
    config.add_route('get_entity', '/get/entity')

    # Aggregation Related
    config.add_route('top5concepts', '/get/top5concepts')
    config.add_route('top_aggregates', '/get/top_aggregates')
    config.add_route('recent_modality_views', '/get/recent_modality_views')
    config.add_route('pageviews_per_day', '/get/pageviews_per_day')

    # Search Aggregation Related
    config.add_route('trending_searches', '/get/trending/searches')
    config.add_route('top_5_searches_form', '/search/topsearchesform')

    # Concept Aggregation Related
    config.add_route('trending_concepts', '/get/trending/concepts')
    config.add_route('top_5_concepts_form', '/search/topconceptsform')

    # Modality Aggregation Related
    config.add_route('trending_modalities', '/get/trending/modalities')
    
    # ADS APIs
    config.add_route('get_fbsdownloads', '/get/info/fbsdownloads/{artifactID}')
    config.add_route('get_lmsinstall', '/get/lmsinstalls')
    config.add_route('get_assessment_answered_count', '/get/assessments/count')

    # IP Address related
    config.add_route('get_location_from_ip', '/get/location/ip')

    # ADS Trace User
    config.add_route('trace_members', '/get/trace/members')

    # Top search terms
    config.add_route('get_top_regional_search_terms', '/get/regional_search_terms')
    # Top encodedIDs
    config.add_route('get_top_regional_eids', '/get/regional_eids')

    # Detect EID
    #config.add_route('detect_eids', '/detect/eids')

    # School artifacts related
    config.add_route('get_school_artifacts', '/get/school/artifacts')
    config.add_route('create_school', '/create/school')
    config.add_route('update_school', '/update/school')
    config.add_route('associate_school_artifact', '/associate/school/artifact')
    config.add_route('update_school_artifacts', '/update/school/artifacts')
    config.add_route('display_school_artifacts', '/display/school/artifacts')
    config.add_route('display_school_artifacts_new', '/display/school/artifacts/new')
    config.add_route('get_school_counts', '/get/school/counts')
    config.add_route('get_schools', '/get/schools')
    config.add_route('get_schools_by_attributes', '/get/schools_by_attributes')

    # Other APIs
    config.add_route('get_pageview_count', '/get/pageview/count')
    config.add_route('get_pageview_artifacts', '/get/pageview/artifacts')

    ##Event Parameters Related
    config.add_route('get_event_parameters', '/get/event/parameters')
    config.add_route('get_all_event_parameters', '/get/all/event/parameters')
    config.add_route('add_event_parameters', '/add/event/parameters')
    config.add_route('update_event_parameters', '/update/event/parameters')
    config.add_route('event_parameters_form', '/event/parametersform')
    config.add_route('trigger_event_parameters_celery', '/trigger/event/parameters/celery')

    #Artifact Views related
    config.add_route('get_artifact_views', '/get/artifact/views')

    config.scan()
    return config.make_wsgi_app()
