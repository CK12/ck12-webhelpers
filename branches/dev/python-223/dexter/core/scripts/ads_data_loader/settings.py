## HOME
HOME_DIR = '/opt/2.0/dexter/code/scripts/ads_data_loader'

## Migration Data specific
MIGRATION_DATA_DETAILS_CONFIG = '%s/load_data.cfg' % HOME_DIR

## Mongo DB settings
MONGO_HOST = 'localhost'
MONGO_PORT = 27017
MONGO_DB = 'dexter'
MONGO_COLLECTION_NAME = 'Artifacts'

## Log files
LOG_FILE_PATH = '/opt/2.0/dexter/code/scripts/ads_data_loader/log/ads.log'

## Maximum process that can spawn  Count
MAX_PROCESS_COUNT = 5

## Threads count
MAX_THREAD_COUNT = 5

## Wait time to check for the processes's status in seconds
STATUS_CHECK_WAIT_TIME = 5

## Resolving API
ARTIFACT_API = 'http://gamma.ck12.org/flx/get/info/@param'

## Status field
STATUS_FIELD = 'responseHeader.status'

