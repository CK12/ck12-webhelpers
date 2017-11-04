########### Config Params ################

# Debug log file
LOG_FILENAME = '/opt/2.0/log/email_gw.log'

# The RPC Prefix URL

RPC_PREFIX_URL = '/rpc/ck12/'

# Mail box path
MAIL_BOX_DIR_PATH = '/opt/users/printnow/mailbox'

# EGX Admin Mail ID
EGX_ADMIN_MAIL_ID =  ''

# Number of processes to work on
NUM_PROCESSES = 2

# Sleep time for mail_queue_manager when there is none in mailbox (in seconds)
MAIL_QUEUE_MANAGER_SLEEP_TIME = 5

# Waiting time if all the processes are busy
WAIT_FOR_PROCESS_TIME = 20

#Threshold failure limit
THRESHOLD_FAILURE_LIMIT = 10

# EGX Cache dir
egx_cache_dir = '/tmp/ck12/egx/'

# Path to mail templates directory
MAIL_TEMPLATE_DIR ='/opt/2.0/flx/pylons/flx/flx/lib/ck12_eflex_lib/'
#MAIL_TEMPLATE_DIR ='/san/beta-setup/misc/email_gateway/'

# Default cover images
COVER_IMAGES_DIR = '%ssupport_files/cover_images/'%(MAIL_TEMPLATE_DIR)
DEFAULT_BOOK_COVER = '%scover_flexbook_generic.png'%(COVER_IMAGES_DIR)
DEFAULT_CHAPTER_COVER = '%scover_chapter_generic.png'%(COVER_IMAGES_DIR)
DEFAULT_CONCEPT_COVER = '%scover_concept_generic.png'%(COVER_IMAGES_DIR)
DEFAULT_LESSON_COVER = '%scover_lesson_generic.png'%(COVER_IMAGES_DIR)


#################
# Task Status INFO
##################
# 1: Queued
# 2: In Progress
# 3: Successful
# 4: Failure - Because of invalid request from user. [If Exceeds Max attempt, email Address is blacklisted]
# 5: Failure: Reason - Request from Unregistered user after one successful usage of eFlex. [If Exceeds Max attempt, email Address is blacklisted]
# 6: Failure - Reasons: No concepts matched User's request, Server Failure.
#
#########################################
