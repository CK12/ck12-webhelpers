
# location of log file
# For 1.x
#LOG_FILENAME = "/opt/lampp/website/ck12/epub_driver.log"
#For 2.0
LOG_FILENAME = "/opt/2.0/log/epub_generator.log"

#Ez's machine
#EPUB_LIBRARY_PREFIX = "/opt/repository/2.0/flx/pylons/flx/flx/lib/ck12_epub_lib"

#1.x Setup
#EPUB_LIBRARY_PREFIX = "/opt/lampp/website/ck12_epub_lib"
#For 2.0 Setup
EPUB_LIBRARY_PREFIX = "/opt/2.0/flx/pylons/flx/flx/lib/ck12_epub_lib"

#End Points for the REST API
# For 1.x
#GET_FLEXBOOK_ENDPOINT = "/rpc/ck12/jsonrpc?method=flexbook.getflexbook&fid="
#GET_CHAPTER_ENDPOINT = "/rpc/ck12/jsonrpc?method=save.getchapter&cid="
# For 2.0
GET_FLEXBOOK_ENDPOINT = "/flexr/api/ext/jsonrpc?method=flexbook.getflexbook&fid="
GET_CHAPTER_ENDPOINT = "/flexr/api/ext/jsonrpc?method=save.getchapter&cid="

# location of empty epub template dir
EPUB_TEMPLATE_DIR = EPUB_LIBRARY_PREFIX +"/epub_template"

#location of cover images dir
EPUB_COVER_IMAGES_DIR = EPUB_LIBRARY_PREFIX + "/images/generic_covers"

# Name of the Math Images Dir
MATH_IMAGES_DIR = "ck12_math_images_dir"

# Image failure log
IMAGES_FAILURE_LOG = "/tmp/ck12_image_failure.html"

# Error Image Path
ERROR_IMAGE_PATH = EPUB_LIBRARY_PREFIX + "/images/epub_img_na.png"

# Embed Image Path
EMBED_IMAGE_PATH = EPUB_LIBRARY_PREFIX + "/images/embvideo.png"

# Thumbnail images directory
THUMBNAIL_DIR = "/opt/2.0/flx/pylons/flx/flx/public/media/images/placeholders/"

# Video providers
VIDEO_PROVIDERS = ['youtube']

# working directory
ROOT_WORK_DIR = "/tmp"

#TOC snippet
TOC_ELEMENT_TEMPLATE ='<navPoint id=\"navpoint-%(num)d\" playOrder=\"%(num)d\">\n\t<navLabel><text>%(title)s</text></navLabel>\n\t<content src=\"%(source)s\"/>\n__CONCEPT_TOC__\n</navPoint>'

#HTML TOC snippet
HTML_TOC_ELEMENT_TEMPLATE ="   <li><a href=\"%(source)s\">%(title)s</a>__CONCEPT_TOC__</li> "

#MANIFEST snippet
MANIFEST_ELEMENT_TEMPLATE='    <item id=\"ck12content-%(num)d\" href=\"%(source)s\" media-type=\"application/xhtml+xml\"/>\n'

#Image MANIFEST snippet
IMAGE_MANIFEST_ELEMENT_TEMPLATE='    <item id=\"ck12image-%(num)s\" href=\"%(source)s\" media-type=\"%(format)s\"/>\n'

#Table MANIFEST snippet
TABLE_MANIFEST_ELEMENT_TEMPLATE='    <item id=\"ck12table-%(num)s\" href=\"%(source)s\" media-type=\"application/xhtml+xml\"/>\n'

#SPINE snippet
SPINE_ELEMENT_TEMPLATE='    <itemref idref=\"ck12content-%(num)d\"/>\n'

#TABLE_SPINE snippet
TABLE_SPINE_ELEMENT_TEMPLATE='    <itemref idref=\"ck12table-%(num)s\" linear=\"no\"/>\n'

#FLAG TO REMOVE TMP FOLDERS AFTER THE INTENDED PROCESS FINISHED
EPUB_DEBUG_FLAG = False

## IMAGE RESIZE OPTIONS

#Resize image, or use original
AUTO_RESIZE_IMAGES = True

#Resize cover image to size(638,825)
FOR_ITUNES_SUBMISSION = False
BOOK_COVER_IMAGE_SIZE = (638,825)

#Maximum height and weight of images
#MAX_IMAGE_SIZE = "1024x1024\\>"
MAX_IMAGE_SIZE = "512x512\\>"

# TABLE Related parameters. These parameter control how Tables are rendered
# Flag to indicate if wide tables need to be transformed. Used only by Kindle optimized ePub
TRANSFORM_TABLE = False
TRANSFORM_TABLE_OVERRIDE = False
# If the number of columns in the table is greater than this threshlold, then transform the table. Used only by Kindle optimized ePub
TABLE_WIDTH_THRESHOLD = 4
# Flag to indicate if table needs to be rendered into separate XHTML. Used only by ePub
TRANSFORM_TABLE_EPUB = True
# If the number of columns in the table is greater than this threshlold, then render the table as a separate XHTML. Used only by ePub
TABLE_WIDTH_THRESHOLD_EPUB = 8
# If the number of rows in the table is greater than this threshold, then render the table as a separate XHTML. Used only by ePub
TABLE_HEIGHT_THRESHOLD_EPUB = 15
# If the width of the math image is greater than this threshold, then render the table as a separate XHTML. Used only by ePub
TABLE_MATH_WIDTH_THRESHOLD_EPUB = 250
# If the height of the math image is greater than this threshold, then render the table as a separate XHTML. Used only by ePub
TABLE_MATH_HEIGHT_THRESHOLD_EPUB = 50
# The message to be displayed below the placeholder image
TABLE_PLACEHOLDER_MESSAGE_EPUB = 'Click on the image above to view the table'

# Custom cover related
CUSTOM_COVER_TEMPLATE = '/opt/2.0/flx/pylons/flx/data/images/CK12_CoverImage_Template.jpg'
CUSTOM_COVER_IMAGE = '/opt/2.0/flx/pylons/flx/data/images/generic_cover_images/1.jpg'
