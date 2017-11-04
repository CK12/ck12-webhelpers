import logging
import flx.lib.helpers as h


cfg = h.load_pylons_config()

#Host name
FLX_PREFIX = cfg.get('flx_prefix_url')

# Wiki importer library home dir
IMPORTER_LIB_HOME = '/opt/2.0/flx/pylons/flx/flx/lib/wiki_importer_lib/'
 
#Math URLs for substitutions 
OLD_INLINE_MATH_PREFIX = 'http://localhost/flx/math/inline/'
NEW_INLINE_MATH_PREFIX= '/flx/math/inline/'
OLD_BLOCK_MATH_PREFIX = 'http://localhost/flx/math/block/'
NEW_BLOCK_MATH_PREFIX=  '/flx/math/block/'

# location of log file
LOG_FILENAME = "/opt/2.0/log/wiki_importer.log"

# log level
LOG_LEVEL = "DEBUG"

LEVELS = {'DEBUG': logging.DEBUG,
          'INFO': logging.INFO,
          'WARNING': logging.WARNING,
          'ERROR': logging.ERROR,
          'CRITICAL': logging.CRITICAL}

# Wiki Username
WIKI_USERNAME = 'wiki.importer'

# Wiki Password
WIKI_PASSWORD = 'Fila-668'

# wiki extractor Response log file
WIKI_EXT_LOG_FILENAME = "/opt/2.0/log/wiki_ext_response.log"

# Wiki extractor engine
WIKI_EXTRACTOR_ENGINE = "e2x"
#WIKI_EXTRACTOR_ENGINE = "mwdocbook1.5"

# Enable caching?
WIKI_CACHE = False

# Use the pre-downloaded metadata.xml
CACHED_METADATA = False

# Location where the library uses to download and process.
WORKING_DIR = "/tmp/wikiimport2.0/"

# CSV file name for Browse terms
BROWSE_TERM_CSV_PATH = "browse_term.csv"

# CSV file name for State Standards
STATE_STANDARD_CSV_PATH = "state_standard.csv"

# Default cover images
COVER_IMAGES_DIR = '%ssupport_files/cover_images/'%(IMPORTER_LIB_HOME)
DEFAULT_BOOK_COVER = '%scover_flexbook_generic.png'%(COVER_IMAGES_DIR)
DEFAULT_CHAPTER_COVER = '%scover_chapter_generic.png'%(COVER_IMAGES_DIR)
DEFAULT_CONCEPT_COVER = '%sread_gicon.png'%(COVER_IMAGES_DIR)
DEFAULT_LESSON_COVER = '%sread_gicon.png'%(COVER_IMAGES_DIR)

# Image actual - internal(fedora) path mapper file
IMG_PATH_MAPPER_FILE = 'img_path_mapper.map'

# Lesson skeleton content
CHAPTER_SKELETON_FILE = '%ssupport_files/chapter_skeleton_content.xhtml'%(IMPORTER_LIB_HOME)

# Book skeleton content
BOOK_SKELETON_FILE = '%ssupport_files/book_skeleton_content.xhtml'%(IMPORTER_LIB_HOME)

# Lesson - Objectives subsections
LESSON_HEAD_SUBSECTIONS = ['Learning Objectives', 'Lesson Objectives']

# Lesson - Problem set, Summary subsections
LESSON_TAIL_SUBSECTIONS = ['Lesson Summary', 'Review Questions', 'Review Answers', 'Points to consider', 'Vocabulary', 'Practice Set', 'Quick Quiz']

# Chapter - Summary subsections 
CHAPTER_TAIL_SUBSECTIONS = ['Chapter Summary', 'Chapter Review']

# POST CODE for selected embed objects
POST_CODE_EMBED_TYPES = ['customembed', 'applet']

# Allowed artifact types to have shortened encoded ID as domain
ALLOWED_TYPES_FOR_DOMAINS = ['concept', 'lesson', 'application']

## The external file directory for book
EXTERNAL_DOMAIN_TERM_ASSOCIATIONS_DIR = '%ssupport_files/encodes/' % (IMPORTER_LIB_HOME)

# To generate math cache and reindex after importing?
# Defaults to True; but should set to False when importing in big volume.
GENERATE_CACHE = False

# Custom cover related
BOOK_COVER_IMAGES_DIR = '/opt/2.0/flx/pylons/flx/data/images/generic_cover_images/'
CUSTOM_COVER_TEMPLATE = '/opt/2.0/flx/pylons/flx/data/images/CK12_CoverImage_Template.jpg'
CUSTOM_COVER_WORKDIR = '/tmp/custom_cover_workdir/'
