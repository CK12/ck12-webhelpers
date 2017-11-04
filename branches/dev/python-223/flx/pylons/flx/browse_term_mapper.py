#!/usr/bin/python
import logging
import os, hashlib, random, sys
import json
from datetime import datetime

from celery.task import Task

from flx.model.workdir import workdir as WD
from flx.controllers.celerytasks import browseTerm

log = logging.getLogger(__name__)

if __name__ == '__main__':

    if len(sys.argv) < 4:
        raise Exception("Insufficient arguments. Use %s <bookID> <CSV file> <userID>" % sys.argv[0])

    bookID = int(sys.argv[1])
    csvFilePath = sys.argv[2]
    if not os.path.exists(csvFilePath):
        raise Exception("No such CSV file: %s" % csvFilePath)
    userID = int(sys.argv[3])

    csvFilePath = os.path.abspath(csvFilePath)

    mapper = browseTerm.BrowseTermMapper()
    task = mapper.delay(bookID, csvFilePath, user=userID)
    task.wait()
