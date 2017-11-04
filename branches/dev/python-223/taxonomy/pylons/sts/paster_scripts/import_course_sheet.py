from sts.model import api, graph_model

from pylons import config

import sys,csv
import Cookie,logging

import os, urllib2

## Initialize logging
def initLog():
    try:
        global log
        if log:
            return log
        LOG_FILENAME = "/tmp/save_preview_images.log"
        log = logging.getLogger(__name__)
        log.setLevel(logging.DEBUG)
        handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
        log.addHandler(handler)
        return log
    except:
        pass

def run(csvPilePath, overwrite=False):
    ''' input file is a csv file: course_name,course_shortname,course_country,course_handle,unit_name,concept_eid '''

    log = initLog()
    f = open (csvPilePath, 'rb')   
    reader = csv.reader(f, delimiter=',', quotechar='"')
    index = {}
    courses = {}
    currentCourseHandle = ''
    currentUnitEid = ''
    currentUnitIndex = 0
    input_keys = []
    for line_num, row in enumerate(reader):
        #print line_num
        if line_num==0:
            input_keys = row
            if not all([k in input_keys for k in ("course_name","course_shortname","unit_name","concept_eid")]):
                print '"course_name","course_shortname","unit_name","concept_eid" are required columns'
                return
            continue
        if not(row and len(row) >=4):
            print 'Empty row ... line number %s' % line_num
            continue

        in_dict = dict(zip(input_keys,row))
        course_name = in_dict.get('course_name','').strip()
        course_shortname = in_dict.get('course_shortname','').strip()
        course_country = in_dict.get('course_country','').strip()
        course_previewImageUrl = in_dict.get('course_previewImageUrl','').strip()
        course_description = in_dict.get('course_description','').strip()
        unit_name = in_dict.get('unit_name','').strip()
        unit_previewImageUrl = in_dict.get('unit_previewImageUrl','').strip()
        unit_description = in_dict.get('unit_description','').strip()
        concept_eid = in_dict.get('concept_eid','').strip()
        
        #course_name=row[index['course_name']].strip()
        
        if course_name and course_shortname:
            course_handle = graph_model.name2Handle(course_name)
            currentCourseHandle = course_handle
            if not course_country:
                course_country = 'US'
            if not currentCourseHandle in courses.keys():
                courses[currentCourseHandle] = {
                    'courseHandle':currentCourseHandle,
                    'courseStructure':[],
                    'courseCountry':course_country,
                    'courseName':course_name,
                    'shortname':course_shortname,
                    'courseDescription': course_description,
                    'coursePreviewImageUrl': course_previewImageUrl
                }
        elif unit_name:
            courses[currentCourseHandle]['courseStructure'].append( {'conceptEIDs':[],'name':unit_name,'previewImageUrl':unit_previewImageUrl,'description':unit_description})
            currentUnitIndex = len(courses[currentCourseHandle]['courseStructure']) - 1
        elif concept_eid:
            courses[currentCourseHandle]['courseStructure'][currentUnitIndex]['conceptEIDs'].append(concept_eid)
           
    for courseHandle,courseStructure in courses.iteritems():
        c = api.getCourseNode(courseStructure['shortname'])
        if c:
            print 'found existing node'
            if overwrite:
                print 'deleting structure'
                api.deleteCourseStructure(c.shortname)
        else:
            kwargs = {
                'name': courseStructure['courseName'],
                'handle': courseStructure['courseHandle'],
                'country':courseStructure['courseCountry'],
                'shortname':courseStructure['shortname'],
                'description':courseStructure['courseDescription'],
                'previewImageUrl':courseStructure['coursePreviewImageUrl']
            }
            print 'creating node'
            c = api.createCourseNode(**kwargs)
        print 'course node ::'
        print str(c)

        if c:
            createdCourseStruct =  api.createCourseStructure(**courseStructure)
        #log.info('createdCourseStruct :: %s ' % createdCourseStruct)
        print 'createdCourseStruct :: %s ' % createdCourseStruct
