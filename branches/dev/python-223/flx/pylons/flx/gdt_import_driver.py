#!/usr/bin/python
import logging
import os, hashlib, random, sys
import json
from datetime import datetime
import shutil
from tempfile import NamedTemporaryFile

from celery.task import Task

from flx.controllers.celerytasks import gdt

log = logging.getLogger(__name__)

if __name__ == '__main__':
    
    print sys.argv
    if len(sys.argv) > 4:
        docID = sys.argv[1]
        if not docID:
            raise Exception("Must specify a docID")

        title = sys.argv[2]
        if not title:
            raise Exception("Must specify artifact title")

        type = sys.argv[3]
        if not type:
            raise Exception("Must specify a type 'lesson' or 'section'")

        userID = int(sys.argv[4])
        if not userID:
            raise Exception("Must specify a user id")
    else:
        raise Exception('Not enough arguments. Usage python gdt_import_driver.py <docID> <title> <lesson|section> [<googleAuthToken>]')

    authKey = None
    if len(sys.argv) > 5:
        authKey = sys.argv[5]

    handle = title.replace(' ', '-')

    print "Converting with docID: %s, authToken: %s" % (docID, authKey)

    tempf = NamedTemporaryFile(suffix='.xhtml', delete=False)
    tempf.close()
    tofile = tempf.name

    gdtTask = gdt.GdtTask()
    handle = gdtTask.delay('gdoc2xhtml', docID, tofile, userID, title, handle, type, authKey, loglevel='INFO', user=userID)
    taskID = handle.task_id
    print "Task id: %s" % taskID
