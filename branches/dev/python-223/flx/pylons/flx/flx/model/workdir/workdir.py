#import flx.lib.workdir.config as config
import config
import flx.lib.helpers as h
import shutil
import logging
from datetime import datetime
from flx.model import model
from flx.model import api
import os


class WorkDirectoryUtil:
    def __init__(self):
        self.c = config.config()
        self.local_prefix = self.c.local_prefix
        self.dbsession = self.c.createDBSession()
        self.log = logging.getLogger(__name__)
        self.log.setLevel(logging.DEBUG)

        
    def getWorkdir(self):
        """
            Creates a new working directory in the shared area.
            Returns the relative path from the local mount.
        """
        self.log.debug("Getting a directory for working.")
        local_path = self.__makeNewDir()
        path =  self.__getRelativePath(local_path)
        self.dbsession.begin()
        record = model.WorkDirectory(relativePath=path,toPurge=0)
        try:
            self.dbsession.add(record)
            self.dbsession.flush()
            self.dbsession.commit()
        except Exception, e:
            self.dbsession.rollback()
            self.purgeWorkDir()
            
        return [record.id, path]
    
    def purgeWorkDir(self, path):
        """
            Given a relative path, removes the working directory (but not the bucket dirs)
        """
        #test if path was really a path, or a directory id
        self.log.debug("Removing directory: %s" % path)
        if path.rfind('/') < 0:
            relPath = self.getRelativePathFromID(path)
            path = self.__getFullPath(relPath)
        else :
            path = self.__getFullPath(path)
            relPath = self.__getRelativePath(path)
            
        self.dbsession.begin()
        try:
            record = self.__getRecordByRelPath(relPath)
            self.dbsession.delete(record)
            self.dbsession.commit()
            return shutil.rmtree(path)
        except Exception, e:
            self.dbsession.rollback()
            self.log.exception("Error attempting to remove working directory. Exception: %s" % str(e))
            raise e
    
    def getRelativePathFromID(self, id):
        try :
            record = self.__getRecordByID(id)
            return record.relativePath
        except Exception, e:
            self.log.exception("Unable to get record. Exception: %s " % str(e))
        
    def __getRecordByID(self, id):
        try:
            record = self.__getUnique('id', id)
            return record
        except Exception, e:
            self.log.exception("Unable to get record. Exception: %s " % str(e))
        
    def __getRecordByRelPath(self, path):
        try:
            record = self.__getUnique('relativePath', path)
            return record
        except Exception, e:
            self.log.exception("Unable to get record. Exception: %s " % str(e))
        
    def __getUnique(self, term, value):
        query = self.dbsession.query(model.WorkDirectory)
        kwargs = { term: value}
        try :
            record =  query.filter_by(**kwargs).one()   
            return record
        except Exception, e:
            self.log.exception("Unable to get record. Exception: %s " % str(e))
    
    #def purgeBuckets()
    #Removes empty buckets?
    #May not be needed.
    
    def __makeNewDir(self):
        work_dir = ""
        attempt = 0  
        created = False
        while attempt < 3:
            attempt +=1   
            time_str = self.__create_timestamp()
            bucket = self.__getBucketPath(time_str)
            work_dir = self.__getFullPath(bucket)
            if h.makedirs(work_dir,startFromRoot=True):
                created = True 
                break;
        
        if created:
            os.chmod(work_dir, 0777)
            return work_dir
        else :    
            raise IOError("Failed to create working directory. Permission issue?")
        
    def __getFullPath(self, path):
        if path.rfind(self.local_prefix) < 0:
            return os.path.join(self.local_prefix, path)
        else:
            return path

    def __getRelativePath(self, path):
        return path.replace(self.local_prefix,'')
                
    def __create_timestamp(self):
        return datetime.now().strftime("%m%d%H%M%S%f")
     
    
    def __getBucketPath(self, name):
        """
            Similar to helper.getBucketPath.
            Use a 2-level bucket for allowing a huge amount of directory names.

            name          The unique identifier of the directory. Typically timestamp.

            It will return a path in the form of:

                <level 1 bucket number>/<level 2 bucket number>/name/   
        """

        if type(name) is not str:
            name = str(name)
        
        #Padding name to make sure splice works
        tmp = '00000000'+ name 
        level1Bucket = tmp[-4:]    
        level2Bucket = tmp[-8:-4]
        path = '%s/%s/%s/' % (level1Bucket, level2Bucket, name)
        return path
