#!/usr/bin/python

## Script to generate MySQL syntax for 2.0, out of Flexr 1.2 system Books

import sys, os
import simplejson as json
import urllib2
from optparse import OptionParser
from tidylib import tidy_document
import MySQLdb
import time
import datetime

#GET_FLEXBOOK_ENDPOINT = "/flexr/api/ext/jsonrpc?method=flexbook.getflexbook&fid="
#GET_CHAPTER_ENDPOINT = "/flexr/api/ext/jsonrpc?method=save.getchapter&cid="
GET_FLEXBOOK_ENDPOINT = "/rpc/ck12/jsonrpc?method=flexbook.getflexbook&fid="
GET_CHAPTER_ENDPOINT = "/rpc/ck12/jsonrpc?method=save.getchapter&cid="

SQL_FILE_PATH = 'data.sql'

BOOK_TYPE = 1
CHAPTER_TYPE = 2

#ARTIFACT_ID = 191
#RESOURCES_ID = 280

'''
NOTE : You need to create a local database by using given "myflex_dump.sql" 

#Before migrate books, You need to change following variable for each book

ARTIFACT_ID                   #line no 24
RESOURCES_ID                  #line no 25
self.standardBoardID          #line no 79  
self.subjectID                #line no 80
book_cover_image_query        #line no 214  
chapter_cover_image_query     #line no 228
browseterms_query(termTypeID) #line no 258
browse_name                   #line no 273 
'''


class DataBuilder:
    
    def __init__(self):
        self.working_dir = ""
        self.content_host = ''
        self.chapter_dict = []
        self.book_title = ''
        self.book_desc = ''
        self.book_id = 0
        self.fid = ''
        self.resources_dir = 'xhtmls'
        self.sql_file = open(SQL_FILE_PATH, 'w')
        self.ARTIFACT_ID = ''
        self.RESOURCES_ID = ''
        self.attributer_first_name = ''
        self.attributer_middle_name = ''
        self.attributer_last_name = ''
        self.attribution_type = ''
        self.membertypeID = '3' 
        self.attributer_id = '1'   
        self.browseterms_id = ''           
        self.browseterms = []   
        self.created_date = ''
        self.grades= {}
        self.grades[1] = [1,'i','one'] 
        self.grades[2] = [2,'ii','two']
        self.grades[3] = [3,'iii','three']
        self.grades[4] = [4,'iv' ,'four']
        self.grades[5] = [5,'v','five']
        self.grades[6] = [6,'vi','six']
        self.grades[7] = [7,'vii','seven']
        self.grades[8] = [8,'viii','eight']
        self.grades[9] = [9,'ix','nine']
        self.grades[10] = [10,'x','ten']
        self.grades[11] = [11,'xi','eleven']
        self.grades[12] = [12,'xii','twelve']
        self.standardBoardID = 7
        self.subjectID = 1 
        self.section = 1
        self.member_is_admin = False
        self.browsetermID = 1
        self.browseterm = ''

    def get_flexbook_data(self, fid):
        url = self.content_host + GET_FLEXBOOK_ENDPOINT + fid
        result = doGet(url)
        print str(result[0])
        print result[1]
        if result[0] == 200 :
            s = json.JSONDecoder().decode(result[1])
            self.book_title = s['ftitle']
            self.book_desc = s['fdesc']
            self.fid = fid
            self.chapter_dict = s['chapters']
            try:              
                 self.attributer_first_name = s['attributions'][0]['first_name']
                 self.attributer_middle_name = s['attributions'][0]['middle_name']
                 self.attributer_last_name = s['attributions'][0]['last_name']
                 self.attribution_type = s['attributions'][0]['attribution_type']  
                 self.attributer_id = s['attributions'][0]['attributer_id']
            except Exception:
                 self.member_is_admin = True 
                 self.attributer_first_name = 'CK-12'
                 self.attributer_middle_name = 'Foundation'
                 self.attributer_last_name = ''
                 self.attribution_type = 'admin'
                 self.attributer_id = '1' 
                 self.membertypeID = '1'

                   
            self.resources_dir = str(self.attributer_id)
            datestring =  s['fcreateddate']
            c=time.strptime(datestring,"%Y-%m-%d %H:%M:%S.0")
            date=datetime.datetime(year=c.tm_year,month=c.tm_mon,day=c.tm_mday,hour=c.tm_hour,minute=c.tm_min,second=c.tm_sec)
            self.created_date = date.isoformat()
            print s['categories'][0]
            for category in s['categories']: 
                print category['name']
                self.browseterms.append(category['name'])
            return True
        else :
            return False

    def connect_db(self):
        #        db = MySQLdb.connect(host="localhost",user="", passwd="ck123",db="myflex",unix_socket='/opt/lampp/var/mysql/mysql.sock')
        db = MySQLdb.connect(host="localhost",user='dbadmin',passwd="D-coD#43",db="flx2")
        cursor = db.cursor()
        return cursor
        
    def add_browseterm_database(self,browseterm):
#        db = MySQLdb.connect(host="localhost",user="", passwd="ck123",db="myflex",unix_socket='/opt/lampp/var/mysql/mysql.sock')
#        db = MySQLdb.connect(host="localhost",user='dbadmin',passwd="D-coD#43",db="flx2") 
#        cursor = db.cursor()
#        cursor.execute("insert into browseterms2(name,book_title) values('%s','%s');" %(escape_content(str(browseterm)),escape_content(str(self.book_title)))) 
        cursor = self.connect_db() 
        cursor.execute("select * from BrowseTerms where name='%s';" %(escape_content(str(browseterm))))
        result = cursor.fetchall()
        cursor.close()  
        if len(result)==0:
             return True      
        else:
             return False     
   
    def create_artifact_id(self):      
        cursor = self.connect_db()
        cursor.execute('select max(id) from Artifacts');
        row = cursor.fetchone()
        pre_id = row[0]
        new_id = pre_id+1    
        return new_id

    def create_resource_id(self):
        cursor = self.connect_db()
        cursor.execute('select max(id) from Resources');
        row = cursor.fetchone()
        pre_id = row[0]
        new_id = pre_id+1 
        return new_id
     
    def get_book_browseterm(self):
        browseterm_dic = {'39':'biology','40':'chemistry','41':'mathematics','42':'engineering','43':'history','44':'physics','45':'science','46':'technology'}
        browse_id = str(self.browsetermID)
        try:
            browse_term  = browseterm_dic[browse_id]  
            return browse_term
        except Exception:
            return None

    def add_book(self, host, fid,standard_id,subject_id,browseterm_id):
        self.standardBoardID = standard_id
        self.subjectID = subject_id
        self.browsetermID = browseterm_id    
        self.browseterm = self.get_book_browseterm()   
        if self.browseterm == None:
             print 'Browseterm id is not available'    
             return
        self.content_host = host
        self.ARTIFACT_ID = self.create_artifact_id()
        self.RESOURCES_ID = self.create_resource_id()     
        if self.get_flexbook_data(fid):
            chapter_number = 0
   
            self.add_book_to_sql(self.book_title, self.book_desc)
            self.ARTIFACT_ID = self.ARTIFACT_ID + 1
            for chapter in self.chapter_dict :
                chapter_number += 1
                 
                chapter_title = "Chapter "+ str(chapter_number) +": "+ chapter['ctitle']
                url = self.content_host + GET_CHAPTER_ENDPOINT + chapter['cid']
                result = doGet(url)
                if result[0] == 200 :
                    s = json.JSONDecoder().decode(result[1])
                    xhtml_body = s['xhtml']
                    chapter_date=s['chapter_date'] 
                    c=time.strptime(chapter_date,"%a, %d %b %Y %H:%M:%S")
                    
                    try:
                        chapter_grades =s['chapter_grade']
                        grades = chapter_grades.split(',')
                    except Exception:
                         grades = None
                                                           
                    chapter_browseterms = []
                    for category in s['categories']: 
                        print category['name']
                        check = self.check_browseterms(chapter_browseterms,category['name'])
                        if check == True:
                            chapter_browseterms.append(category['name'])
                 
                  
                    date=datetime.datetime(year=c.tm_year,month=c.tm_mon,day=c.tm_mday,hour=c.tm_hour,minute=c.tm_min,second=c.tm_sec)
                    chapter_date = date.isoformat()

                    xhtml_path = self.get_xhtml_path(xhtml_body)
                    self.add_chapter_to_sql(chapter['ctitle'],s['chapter_summary'],xhtml_path, chapter_number,chapter_date,grades,chapter_browseterms)
                    self.ARTIFACT_ID = self.ARTIFACT_ID + 1
                    self.RESOURCES_ID = self.RESOURCES_ID + 1

            print self.ARTIFACT_ID
            print self.RESOURCES_ID       

    def check_browseterms(self,chapter_browseterms,string):
       for term in chapter_browseterms:
             if term == string:
                 return False
       return True                            
 

    def get_xhtml_path(self, xhtml):
        if not os.path.exists(self.resources_dir):
            os.mkdir(self.resources_dir)

        option = {"output-xhtml":1, "clean":1, "tidy-mark":0}
        document, errors = tidy_document(xhtml, option)
     
        document = document.replace("src=\""+self.content_host, "src=\"")
        xhtml_path = self.resources_dir + "/" + str(self.RESOURCES_ID) + ".xhtml" 
        f = open(xhtml_path, 'w')
        f.write(document)
        f.close()
   
        return xhtml_path


  
          
    def add_book_to_sql(self, title, description):
            
        # add book data 
        if self.member_is_admin == False:
            self.sql_file.write("INSERT INTO `Members` (`id`, `memberTypeID`, `gender`, `login`, `givenName`, `surname`, `suffix`, `title`, `organizationID`) VALUES(%s,%s,'male','%s','%s','%s','','',NULL);"  %(self.attributer_id,self.membertypeID,self.attributer_first_name,self.attributer_first_name +' '+ self.attributer_middle_name +' '+ self.attributer_last_name,self.attributer_first_name))
            self.sql_file.write("\n")

        self.sql_file.write("insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `creatorID`, `parentID`, `creationTime`) values (%s,1,'%s','%s',%s, NULL, '%s');" %(self.ARTIFACT_ID, escape_content(title), escape_content(description),self.attributer_id,self.created_date))
        self.sql_file.write("\n")
        self.sql_file.write("insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (%s, %s, 1, 0, '%s', '2010-01-01T12:12:27Z');" %(self.ARTIFACT_ID, self.ARTIFACT_ID,self.created_date))
        self.sql_file.write("\n")

        #add book cover 
        book_cover_image_query = "INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `ownerID`, `languageID`) VALUES (%s,2,'book_cover_image','Cover page image for the book','CK12_Life_Science.png',%s,1);" %(self.RESOURCES_ID,self.attributer_id)
        self.sql_file.write(book_cover_image_query)
        self.sql_file.write("\n") 
        self.sql_file.write("insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (%s,%s,1,'%s');" %(self.RESOURCES_ID, self.RESOURCES_ID,'2010-01-01T12:12:27Z'))
        self.sql_file.write("\n") 
        self.sql_file.write("insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (%s, %s);" %(self.ARTIFACT_ID, self.RESOURCES_ID))
        self.sql_file.write("\n")
        self.sql_file.write("\n")

        self.RESOURCES_ID = self.RESOURCES_ID+1
        self.chapter_cover_id = self.RESOURCES_ID
        self.RESOURCES_ID = self.RESOURCES_ID+1

        # add chapter cover   
        chapter_cover_image_query = "INSERT INTO `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `ownerID`, `languageID`) VALUES (%s,2,'chapter_cover_image','Cover page image for the chapter','chapter_cover.png',%s,1);" %(self.chapter_cover_id,self.attributer_id)
        self.sql_file.write(chapter_cover_image_query)
        self.sql_file.write("\n") 
        self.sql_file.write("insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`) values (%s,%s,1,'%s');" %(self.chapter_cover_id, self.chapter_cover_id,'2010-01-01T12:12:27Z'))
        self.sql_file.write("\n")
        self.book_id = self.ARTIFACT_ID



    def add_chapter_to_sql(self, title, description, uri, chapter_seq, chapter_date,grades,chapter_browseterms):

        # add chapter data
        self.sql_file.write("insert into `Resources` (`id`, `resourceTypeID`, `name`, `description`, `uri`, `ownerID`, `languageID`) values (%s,1,'%s','%s','%s', %s, 1);" %(self.RESOURCES_ID, escape_content(title), escape_content(description), os.path.basename(uri),self.attributer_id))
        self.sql_file.write("\n")
        self.sql_file.write("insert into `ResourceRevisions` (`id`, `resourceID`, `revision`, `creationTime`)  values (%s,%s,1,'%s');" %(self.RESOURCES_ID, self.RESOURCES_ID,chapter_date))
        self.sql_file.write("\n")
        self.sql_file.write("insert into `Artifacts` (`id`, `artifactTypeID`, `name`, `description`, `creatorID`, `parentID`, `creationTime`)  values (%s,2,'%s','%s',%s,NULL, '%s');" %(self.ARTIFACT_ID, escape_content(title), escape_content(description),self.attributer_id,chapter_date))
        self.sql_file.write("\n")
        self.sql_file.write("insert into `ArtifactRevisions` (`id`, `artifactID`, `revision`, `downloads`, `creationTime`, `publishTime`)  values (%s, %s, 1, 0, '%s', '2010-01-01T12:12:27Z');" %(self.ARTIFACT_ID, self.ARTIFACT_ID,chapter_date))
        self.sql_file.write("\n")
        self.sql_file.write("insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (%s, %s);" %(self.ARTIFACT_ID, self.RESOURCES_ID))
        self.sql_file.write("\n")
        self.sql_file.write("insert into `ArtifactRevisionRelations`(`artifactRevisionID`, `hasArtifactRevisionID`, `sequence`) values (%s, %s, %s);" %(self.book_id, self.ARTIFACT_ID, chapter_seq))
        self.sql_file.write("\n")
        

        # add chapter browse data
        for browseterm in chapter_browseterms:
             
            result = self.add_browseterm_database(escape_content(browseterm))
            if result == True: 
                browseterms_query = "INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, '%s', 4,%s from BrowseTerms;" %(escape_content(browseterm),self.browsetermID)
                self.sql_file.write(browseterms_query)
                self.sql_file.write("\n")
                ArtifactHasBrowseTerms_query = "INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select %s,max(id) from BrowseTerms;" %(self.ARTIFACT_ID)
                self.sql_file.write(ArtifactHasBrowseTerms_query)
                self.sql_file.write("\n")
            else:
                print 'allready inserted'
                self.sql_file.write("\n")
                ArtifactHasBrowseTerms_query = "INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select %s,id from BrowseTerms where name='%s' and termTypeID =4 ;" %(self.ARTIFACT_ID,escape_content(browseterm))
                self.sql_file.write(ArtifactHasBrowseTerms_query)
                self.sql_file.write("\n")

        # add browse name  
        browse_name= self.browseterm 
        result = self.add_browseterm_database(escape_content(browseterm))
        if result == True:  
             self.add_browseterm_database(escape_content(browse_name))
             browseterms_query = "INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, '%s', 3,NULL from BrowseTerms;" %(browse_name)
             self.sql_file.write(browseterms_query)
             self.sql_file.write("\n")
             ArtifactHasBrowseTerms_query = "INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select %s,max(id) from BrowseTerms;" %(self.ARTIFACT_ID)
             self.sql_file.write(ArtifactHasBrowseTerms_query)
             self.sql_file.write("\n")
          
        else:
                ArtifactHasBrowseTerms_query = "INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select %s,id from BrowseTerms where name='%s' and termTypeID = 3 ;" %(self.ARTIFACT_ID,browse_name)
                self.sql_file.write(ArtifactHasBrowseTerms_query)
                self.sql_file.write("\n")

        # add 'ca' in browse terms    
        result = self.add_browseterm_database('ca')
        if result ==True:
            browseterms_query = "INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, '%s', 1,NULL from BrowseTerms;" %('ca')
            self.sql_file.write(browseterms_query)
            self.sql_file.write("\n")
            ArtifactHasBrowseTerms_query = "INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select %s,max(id) from BrowseTerms;" %(self.ARTIFACT_ID)
            self.sql_file.write(ArtifactHasBrowseTerms_query)
            self.sql_file.write("\n")
        else:
                ArtifactHasBrowseTerms_query = "INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select %s,id from BrowseTerms where name='%s' and termTypeID = 1 ;" %(self.ARTIFACT_ID,'ca')
                self.sql_file.write(ArtifactHasBrowseTerms_query)
                self.sql_file.write("\n")
        
        
        # add browse terms for grades
        if grades != None: 
            for grade in grades:
                for value in self.grades[int(grade)]:
                 result = self.add_browseterm_database(value)
                 if result == True:
                    browseterms_query = "INSERT INTO `BrowseTerms` (`id`,  `name`, `termTypeID`, `parentID`) select max(id)+1, '%s', 2, NULL  from BrowseTerms;" %(value)
                    self.sql_file.write(browseterms_query)
                    self.sql_file.write("\n")
                    ArtifactHasBrowseTerms_query = "INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select %s,max(id) from BrowseTerms;" %(self.ARTIFACT_ID)
                    self.sql_file.write(ArtifactHasBrowseTerms_query)
                    self.sql_file.write("\n")
                 else:
                     print 'allready inserted'
                     self.sql_file.write("\n")
                     ArtifactHasBrowseTerms_query = "INSERT INTO `ArtifactHasBrowseTerms` (`artifactID`,  `browseTermID`) select %s,id from BrowseTerms where name='%s' and termTypeID =4 ;" %(self.ARTIFACT_ID,value)
                     self.sql_file.write(ArtifactHasBrowseTerms_query)
                     self.sql_file.write("\n")


        # add book cover for chapter(refer same cover for all chapters)
        self.sql_file.write("insert into `ArtifactRevisionHasResources`  (`artifactRevisionID`, `resourceRevisionID`)  values (%s, %s);" %(self.ARTIFACT_ID, self.chapter_cover_id))
        self.sql_file.write("\n")
        self.sql_file.write("\n")

           
        #add standards
        standards_query = "INSERT INTO `Standards` (`id`, `standardBoardID`, `subjectID`, `section`, `title`, `description`) select max(id)+1 , %s , %s , '%s' ,'%s','%s'  from `Standards`;" %( self.standardBoardID, self.subjectID,escape_content(title),escape_content(title), escape_content(description))
        self.sql_file.write(standards_query)
        self.sql_file.write("\n")
        if grades != None:
            for grade in grades:
                 self.sql_file.write("INSERT INTO `StandardHasGrades` (`standardID`, `gradeID`)  select max(id), %s from `Standards`;" %(int(grade)+1))
                 self.sql_file.write("\n")
        self.sql_file.write("INSERT INTO `ArtifactRevisionHasStandards` (`artifactRevisionID`, `standardID`) select %s, max(id) from `Standards`;" %(self.ARTIFACT_ID))  
        self.sql_file.write("\n")

        self.section = self.section + 1    

def doGet(url):
    f = urllib2.urlopen(url);
    return [f.code, f.read()]

def escape_content(content):
    return content.replace("'", "\\\'")

if __name__ == "__main__":
    my_driver = DataBuilder()
    cover_image_path = ''
    book_isbn_number=' '
    Usage = "python 1.2_to_2.0_data.py <host URL> <Flexbook Id> "
    parser = OptionParser(usage=Usage)
    parser.add_option("-s", "--standard",dest="standard_id",help="Enter standard id for the book",default = '')
    parser.add_option("-l", "--subject",dest="subject_id",help="Enter subject id for the book",default = '')
    parser.add_option("-b", "--browseterm",dest="browseterm_id",help="Enter browseterm id for the book",default = '')
    (options,args)=parser.parse_args()

    if options.standard_id !='' and options.subject_id !='' and options.browseterm_id != '': 
        if len(sys.argv) >= 3:
            my_driver.add_book(sys.argv[1],sys.argv[2],options.standard_id,options.subject_id,options.browseterm_id)
        else:
            print '''Usage: python 1.2_to_2.0_data.py <host URL> <Flexbook Id> -s <standard_id> -l <subject_id> -b <browseterm_id>'''
    else:
        print '''Usage: python 1.2_to_2.0_data.py <host URL> <Flexbook Id> -s <standard_id> -l <subject_id> -b <browseterm_id>'''       
