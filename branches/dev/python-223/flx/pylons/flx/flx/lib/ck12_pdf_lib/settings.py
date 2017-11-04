
# location of log file
LOG_FILENAME = "/opt/2.0/log/pdf_generator.log"

#Directory for storing math images(separate directory for math images)
MATH_IMAGES_DIR = "ck12_maths"

ERROR_IMAGES_DIR = "error_images"

#Host name for getting resources(images) if http prefix not available with image pattern 
#DEFAULT_HTTP_PREFIX = "http://pioneer.ck12.org" 
DEFAULT_HTTP_PREFIX = "https://gamma.ck12.org"

#Error image file path (replacing render(download) failed image)
ERROR_IMAGE_PATH = "/opt/2.0/flx/pylons/flx/flx/lib/ck12_pdf_lib/epub_img_na.png"

#Fb2n home dir
FB2N_HOME = "/usr/local/bin/"

#Root work dir for pdf 
ROOT_WORK_DIR ="/tmp/pdf"

#pdf_template version
PDF_TEMPLATE = 1

#Document rating for pdf
PDF_DOCUMENT_RATING = 'CR0'

#Default book name 
DEFAULT_BOOK_NAME = 'book.pdf'

#FLAG TO REMOVE TMP FOLDERS AFTER THE INTENDED PROCESS FINISHED
PDF_DEBUG_FLAG = True

#f2pdf Home
F2PDF_HOME  = '/opt/2.0/flx/f2pdf/'

#Latex Template
F2PDF_TEMPLATES = ['twocolumn', 'onecolumn']

BOOK_COVER_IMAGE = "/opt/2.0/flx/pylons/flx/flx/public/media/images/ck12_generic_cover.png"

GENERIC_PLACEHOLDER_IMAGE = "/opt/2.0/flx/pylons/flx/flx/public/media/images/placeholders/emb_multimedia.png"

GENERIC_PLACEHOLDER_ERROR_IMAGE = "/opt/2.0/flx/pylons/flx/flx/public/media/images/placeholders/emb_multimedia_na.png"

ONECOUMN_TEMPLATE_BOOKS = ['CK-12-Calculus',
                           'CK-12-Algebra-I---Second-Edition',
                           'CK-12-Geometry---Second-Edition',
                           'CK-12-Trigonometry---Second-Edition',
                           'CK-12-Probability-and-Statistics---Advanced-(Second-Edition)',
                           'CK-12-Algebra---Basic',
                           'CK-12-Geometry---Basic',
                           'CK-12-Middle-School-Math---Grade-7',
                           "CK-12-Calculus-Teacher\'s-Edition",
                          ]

# Thumbnail images directory
THUMBNAIL_DIR = "/opt/2.0/flx/pylons/flx/flx/public/media/images/placeholders/"

# Video providers
VIDEO_PROVIDERS = ['youtube', 'ck12-embed']
