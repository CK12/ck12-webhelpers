#!/usr/bin/python
import logging
import os, sys
import json
import tarfile
import zipfile
from optparse import OptionParser, OptionGroup
import shutil

from celery.task import Task
from celery.task.sets import subtask

from flx.model.workdir import workdir as WD
from flx.controllers.celerytasks import importer
from flx.lib.wiki_importer_lib import settings
from flx.lib.wiki_importer_lib.translator import CK12Translator
from flx.lib.wiki_importer_lib.rosetta_xhtml import CK12RosettaXHTML

log = logging.getLogger(__name__)

class QuickImportDriver():

    def __init__(self):
        global log_level
        self.log = logging.getLogger(__name__)
        self.log.debug("Initializing WikiImporter object")
        self.working_dir = settings.WORKING_DIR
        if not os.path.exists(self.working_dir):
            os.mkdir(self.working_dir)

    def create_working_location(self):
        myUtil = WD.WorkDirectoryUtil()
        workdir_prefix = "/opt/2.0/work/"
        if not os.path.exists(workdir_prefix):
            os.mkdir(workdir_prefix)
            
        self.working_dir = workdir_prefix + myUtil.getWorkdir()[1]
        return self.working_dir

    def transform_1x_to_2x(self, source_dir, wiki_content_dir):
        dir_walker = os.walk(source_dir)
        translator = CK12Translator()
        rosetta_xhtml = CK12RosettaXHTML()
        f = open(source_dir+"/metadata.xml",'r')
        try:
            metadata_content = f.read()
        except Exception as e:
            metadata_content = ""
        finally:
            f.close()
        raw_content_paths = dir_walker.next()
        for each_file in raw_content_paths[2]:
            if each_file.startswith('metadata'):
                continue
            number = each_file.replace('chapter_','').replace('.xml','')
            new_chapter_path = 'chapter_%s' % str(int(number))
            os.makedirs("%s/%s" % (wiki_content_dir, new_chapter_path))
            old_image_dir = 'images_%s' % number
            new_image_dir = "%s/%s" % (new_chapter_path, 'chapter_images')
            shutil.copy("%s/%s" % (source_dir, each_file), "%s/%s/%s" % (wiki_content_dir, new_chapter_path, 'chapter.xml'))
            if os.path.exists("%s/%s" % (source_dir, old_image_dir)):
                shutil.copytree("%s/%s" % (source_dir, old_image_dir), "%s/%s" % (wiki_content_dir, new_image_dir))
            metadata_content = metadata_content.replace(each_file, "%s/%s/%s" % (wiki_content_dir, new_chapter_path, 'chapter.xml') )

            rf = open("%s/%s/%s" % (wiki_content_dir, new_chapter_path, 'chapter.xml'), "r")
            try:
                chapter_content = rf.read()
            finally:
                rf.close()
            chapter_content = chapter_content.replace(old_image_dir,"%s%s" % (wiki_content_dir, new_image_dir))
            chapter_xhtml_content = translator.get_rosetta_xhtml(chapter_content)
            chapter_xhtml_content = rosetta_xhtml.to_rosetta_xhtml(chapter_xhtml_content)
            #inline math images
            chapter_xhtml_content = chapter_xhtml_content.replace('localhost:8983/ck12/ucs?math=','localhost/flx/math/inline/')
            chapter_xhtml_content = chapter_xhtml_content.replace('localhost:8983/ck12/ucs/?math=','localhost/flx/math/inline/')
            chapter_xhtml_content = chapter_xhtml_content.replace('localhost/ck12/ucs?math=','localhost/flx/math/inline/')
            chapter_xhtml_content = chapter_xhtml_content.replace('localhost/ck12/ucs/?math=','localhost/flx/math/inline/')
            #block math images
            chapter_xhtml_content = chapter_xhtml_content.replace('localhost:8983/ck12/ucs?blockmath=','localhost/flx/math/block/')
            chapter_xhtml_content = chapter_xhtml_content.replace('localhost:8983/ck12/ucs/?blockmath=','localhost/flx/math/block/')
            chapter_xhtml_content = chapter_xhtml_content.replace('localhost/ck12/ucs?blockmath=','localhost/flx/math/block/')
            chapter_xhtml_content = chapter_xhtml_content.replace('localhost/ck12/ucs/?blockmath=','localhost/flx/math/block/')

            #renive double http://
            chapter_xhtml_content = chapter_xhtml_content.replace('http://http://','http://')

            wf = open("%s/%s/%s" % (wiki_content_dir, new_chapter_path, 'chapter.xml'), "w")
            try:
                wf.write(chapter_content)
            finally:
                wf.close()
            wxf = open("%s/%s/%s" % (wiki_content_dir, new_chapter_path, 'chapter.xhtml'), "w")
            try:
                wxf.write(chapter_xhtml_content)
            finally:
                wxf.close()

        f = open(wiki_content_dir+"/metadata.xml", "w")
        try:
            f.write(metadata_content)
        finally:
            f.close()
        return 

    def wikiImport(self, wiki_url, user_id, granularity, is_metadata_mode, content_splitter_guide=None, contentVersion=None, wait=False):
        if contentVersion not in ["1", "2"]:
            contentVersion = '2'
            if wiki_url and wiki_url.startswith('http') and 'authors2.ck12.org' in wiki_url.lower(): # or 'authors.ck12.org' in wiki_url.lower():
                print "Loading content from 2.0 source"
                contentVersion = '2'
            else:
                print "Loading content from 1.x source"
                contentVersion = '1'

        processingTar = False
        wiki_content_dir = self.create_working_location()
        if wiki_url.endswith('zip'):
            source_dir = wiki_content_dir
            wiki_content_dir = self.create_working_location() 
            zf = zipfile.ZipFile(wiki_url)
            zipfile.ZipFile.extractall(zf, source_dir)
            self.transform_1x_to_2x(source_dir, wiki_content_dir)
        elif os.path.exists(wiki_url) and wiki_url.endswith('tar.gz'):
            tf = tarfile.open(wiki_url)
            tf.extractall(path=wiki_content_dir)
            processingTar = True
       
        import_drill_mode = granularity
        if not processingTar:
            #Task 1: Downloading content from wiki
            wiki_importer = importer.WikiImporter()
        #Task 2: Process images
        image_processor = importer.ImageProcessor()

        #Task 3: Load content
        content_loader = importer.ContentLoader()
        
        if not processingTar:
            task = wiki_importer.delay(wiki_url, user_id, contentVersion=contentVersion, workdir=wiki_content_dir, is_metadata_mode=is_metadata_mode,
                    import_drill_mode=import_drill_mode, content_splitter_guide=content_splitter_guide, toWait=wait, toCache=True)
        else:
            task = image_processor.delay(wiki_content_dir, user_id, contentVersion=contentVersion, import_drill_mode=import_drill_mode, content_splitter_guide=content_splitter_guide, is_metadata_mode=is_metadata_mode, callback=content_loader.subtask(), toWait=wait, toCache=False, wikiurl=wiki_url)

        task_id = task.task_id
        print "Scheduled task with id: %s" % task_id
        if wait:
            print "Waiting for task to finish ..."
            sys.stdout.flush()
            task.wait()

        response = {}
        response['task_id'] = task_id
        return json.dumps(response)

    def wikiImportStatus(self, taskId):  
        response = {}
        response['status_message'] = 'Downloading from wiki..'
        got_current_status = False
        current_task_id = taskId
        while not got_current_status:
            if current_task_id == "":
                break
            wiki_import_task =  Task.AsyncResult(task_id=current_task_id)    
            response['status']  = wiki_import_task.status
        
            if response['status'] == 'SUCCESS':
                response = wiki_import_task.result   
                response['status'] = wiki_import_task.status
                try:
                    current_task_id = response['task_id']
                except Exception as e:
                    got_current_status = True
                    response['status_message'] = 'Task completed'
            else:
                response['status'] = wiki_import_task.status
                got_current_status = True
 
        return json.dumps(response)   

if __name__ == "__main__":
    quick_import_driver = QuickImportDriver()
    wiki_extracted_content_tar_path = ''
    user_id=''
    Usage = "python quick_import_driver.py <wiki_url|book_tar_path> [<UserID> [<Granularity {lesson|chapter|concept}> [<Is metadata only? {True|False}> [<new-metadata-format {True|False}>[<Path to content splitter guide(Optional)>]]]]]"
    parser = OptionParser()
    group = OptionGroup(parser, "Input Options (any one of the following)")
    group.add_option("-u","--url", dest="wiki_url", help="Book wiki url to be imported", metavar="wikiurl")
    group.add_option("-t","--tar-path", dest="tar_path", help="Book docbook tar path", metavar="tarfilepath")
    group.add_option("-z","--zip-path", dest="zip_path", help="1.x Book docbook zip file path", metavar="zipfilepath")
    parser.add_option_group(group)
    parser.add_option("-i","--userid", dest="user_id", help="User ID on which book is to be imported (default 3 (CK12Editor))", metavar="userid", default="3")
    parser.add_option("-m","--mode", dest="importer_mode", help="the mode in which contents are to be categorized (default 'section')", metavar="<concept|section>", default="section")
    parser.add_option("-o","--metadata-only", dest="is_metadata_mode", help="Specify if only the metadata of the book is to be updated (default False)", metavar="<True|False>", default=False)
    parser.add_option("-s","--splitter-guide", dest="splitter_guide", help="Specify config file path containing rules for the content splitting", metavar="split_config_file", default=None)
    parser.add_option("-w","--wait", dest="wait", help="Wait for the import to finish (default False)", metavar="<True|False>", default=False)
    parser.add_option("-v","--content-version", dest="contentVersion", help="Specify content version for this book (by default the script assumes based on wiki url)", metavar="<1|2>", default=None)
    (options,args)=parser.parse_args()
    print "Calling wiki import with parameters: %s" % str(options)
    if options.wiki_url:
        quick_import_driver.wikiImport(options.wiki_url, options.user_id, options.importer_mode, options.is_metadata_mode, options.splitter_guide, contentVersion=options.contentVersion, wait=options.wait)
    elif options.tar_path:
        quick_import_driver.wikiImport(options.tar_path, options.user_id, options.importer_mode, options.is_metadata_mode, options.splitter_guide, contentVersion=options.contentVersion, wait=options.wait)
    elif options.zip_path:
        quick_import_driver.wikiImport(options.zip_path, options.user_id, options.importer_mode, options.is_metadata_mode, options.splitter_guide, contentVersion=options.contentVersion, wait=options.wait)
    else:
        parser.print_help()
    '''
    logging.info("Calling wiki import with arguments: %s" % str(params))
    print "Calling wiki import with arguments: %s" % str(params)
    quick_import_driver.wikiImport(params['url'], params['userID'], params['granularity'], params['metadataMode'], params['isNewMetadataFormat'], params['splitterGuide'])
    '''
