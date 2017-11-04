import MySQLdb
import re
import hashlib
import os
import logging, logging.handlers
import urllib2
import codecs

"""
    Gets images from all user created chapters and save them into a directory

    The images are stored with their original name from the database but the image id is 
    prepended to the names. For images that do not have an extension, one is guessed from
    the mime-type field.

    The math images are written to another files.

"""

MATH_SATELLITE_SERVER = 'http://math-dev.ck12.org'
IMG_DIR = '/mnt/1x_images'

LOG_FILENAME = "/tmp/export_1x_images.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

conn = None

process_docbooks = False
if process_docbooks:
    conn = MySQLdb.connect (host = "localhost", user = "dbadmin", passwd = "D-coD#43", db = "flexr") 

def getImagesFromDB(imageIDs):
    saved = failed = 0
    log.info("Saving %d images" % len(imageIDs))
    ## Get all images and save them to file
    if not os.path.exists(IMG_DIR):
        os.makedirs(IMG_DIR)

    i = 0
    for imageID in imageIDs:
        cursor = None
        try:
            i += 1
            log.info("[%d] Processing image: %s" % (i, imageID))
            cursor = conn.cursor()
            cursor.execute("select fbm_name, fbm_content_type, fbm_data, fbm_hash from flexbook_media where fbm_id = %s" % (imageID, ))
            row = cursor.fetchone()
            name = row[0]
            if not name or '.' not in name:
                contentType = row[1].split('/')[-1]
                name += '.' + contentType
            name = '1x-%d_%s' % (imageID, name)

            fpath = os.path.join(IMG_DIR, "%s" % name)
            if os.path.exists(fpath):
                log.warn('Image file already exists: %s, size: %d' % (fpath, os.path.getsize(fpath)))
                continue
            f = open(fpath, "wb")
            f.write(row[2])
            f.close()
            log.info("Wrote file: %s Size: %d bytes" % (fpath, os.path.getsize(fpath)))

            m = hashlib.md5()
            m.update(row[2])
            log.info('Digest: %s, %s' % (m.hexdigest(), row[3]))
            saved += 1
        except Exception, e:
            failed += 1
            log.error("Error saving image file: %d" % str(e), exc_info=e)
        finally:
            if cursor:
                cursor.close()
    log.info("Processed %d image files: saved: %d, failed: %d" % (len(imageIDs), saved, failed))

def createMathCache(expressions, type='inline'):
    i = 0
    success = failed = 0
    for expr in expressions:
        try:
            i += 1
            url = '%s/flx/math/%s/%s' % (MATH_SATELLITE_SERVER, type, expr)
            log.info("[%d] Processing [%s]: [%s] URL: %s" % (i, type, expr, url))
            r = urllib2.urlopen(url, timeout=30)
            r.read()
            success += 1
        except Exception, e:
            failed += 1
            log.error("Error creating math: %s" % str(e), exc_info=e)
    log.info("Processed %d math expressions [%s], failed: %d, success: %d" % (len(expressions), type, failed, success))

if __name__ == '__main__':
    chapterIDs = []
    imageIDs = {}
    mathExprs = {}
    bmathExprs = {}

    if process_docbooks:
        log.info("Processing docbooks ...")
        hrefRe = re.compile(r'''fileref=["'].[^"'\?]+\?id=([0-9]+)["']''', re.I)
        mathRef = re.compile(r'''fileref=["'].[^"'\?]+\?math=([^"']*)''', re.I)
        blockMathRef = re.compile(r'''fileref=["'].[^"'\?]+\?blockmath=([^"']*)''', re.I)

        pageSize = 1000
        offset = 0
        while True:
            log.info("Processing page: %d, Offset: %d" % (pageSize, offset))
            cursor = conn.cursor()
            cursor.execute("select chapter_id, chapter_body from flexbook_chapter where chapter_by_ck12 = 0 LIMIT %d OFFSET %d" % (pageSize, offset))
            rows = cursor.fetchall()
            if not rows:
                break
            i = 0
            for row in rows:
                chapterImages = {}
                chapterID = int(row[0])
                body = row[1]
                for match in hrefRe.findall(body):
                    match = int(match)
                    imageIDs[match] = str(match)
                for math in mathRef.findall(body):
                    mathExprs[math] = True
                for bmath in blockMathRef.findall(body):
                    bmathExprs[bmath] = True

                i += 1
            cursor.close()
            offset += pageSize

        ## Write the expression to files
        log.info("Writing inline_expressions.txt")
        f = codecs.open('inline_expressions.txt', 'w')
        for expr in mathExprs.keys():
            f.write('%s\n' % expr)
        f.close()

        log.info("Writing block_expressions.txt")
        f = codecs.open('block_expressions.txt', 'w')
        for expr in bmathExprs.keys():
            f.write('%s\n' % expr)
        f.close()
        
        log.info("Writing 1x_images.txt")
        f = codecs.open('1x_images.txt', 'w')
        for id in imageIDs.keys():
            f.write('%s\n' % id)
        f.close()
    else:
        ## Read expression from files
        log.info("Reading inline_expressions.txt")
        f = codecs.open('inline_expressions.txt', 'r')
        for l in f.readlines():
            l = l.strip()
            if l:
                mathExprs[l] = True
        f.close()

        log.info("Reading block_expressions.txt")
        f = codecs.open('block_expressions.txt', 'r')
        for l in f.readlines():
            l = l.strip()
            if l:
                bmathExprs[l] = True
        f.close()

        log.info("Get image list")
        f = codecs.open('1x_images.txt', 'r')
        for l in f.readlines():
            l = l.strip()
            if l:
                imageIDs[int(l)] = l
        f.close()

    log.debug("Number of Images: %d" % (len(imageIDs.keys())))
    log.debug("Number of inline math: %d" % (len(mathExprs.keys())))
    log.debug("Number of block math: %d" % (len(bmathExprs.keys())))

    createMathCache(mathExprs.keys(), 'inline')
    createMathCache(bmathExprs.keys(), 'block')
    if conn:
        getImagesFromDB(imageIDs.keys())

    if conn:
        conn.close ()

