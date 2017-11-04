## HOME
HOME_DIR = '/opt/dexter/core/scripts/ads_data_migrator'

## DB Settings
DB_HOST = 'romer.ck12.org'
API_HOST = DB_HOST
DB_USER = 'dbadmin'
DB_PASSWD = 'D-coD#43'
DATABASE = 'ads'

## Dexter settings
DEXTER_HOST = 'chaplin.ck12.org/dexter'

## Field settings
FIELDS = {'artifactID': {'api':'http://%s/flx/get/info/@param'%API_HOST, 'mandatory':'true'}, 'memberID': {'api':'http://%s/flx/get/memb/info/@param'%API_HOST, 'mandatory':'true'}}

## Migration Data specific
MIGRATION_DATA_DETAILS_CONFIG = '%s/migrate_events.cfg' % HOME_DIR

## Maximum process that can spawn  Count
MAX_PROCESS_COUNT = 6

## Threads count
MAX_THREAD_COUNT = 10

## Wait time to check for the processes's status in seconds
STATUS_CHECK_WAIT_TIME = 5
