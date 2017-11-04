#!/usr/bin/python

import sys
import urllib2
import json
from ck12pdf import CK12Pdf
import logging

API_INSTANCE_PREFIX = '/flx'
FLEXBOOK_ENDPOINT =  '/get/info/book/'
CHAPTER_DETAIL_ENDPOINT = '/get/detail/chapter/'
LOG_FILENAME = "/opt/lampp/website/ck12/pdf_driver.log"

#Initialing Debugger
logging.basicConfig(filename=LOG_FILENAME,level=logging.DEBUG,)

class Pdf_Driver:

     def __init__(self):
         self.host_name = ''
         self.fid = ''
         self.chapters_array = []
         self.book_meta_data = {}

     def get_flexbook_data(self):
         url = self.host_name+API_INSTANCE_PREFIX+FLEXBOOK_ENDPOINT+self.fid
         result = doGet(url)
         if result[0] == 200 :
            s = json.JSONDecoder().decode(result[1])
            logging.debug("Pdf Driver :"+str(s))
            if s['responseHeader']['status']== 0:
                  self.book_title = s['response']['book']['title']
                  self.get_book_metadata(s['response']['book'])
                  self.chapters_array = s['response']['book']['revisions'][0]['children']
                  return True
            else:
                 logging.debug("Pdf Driver :Cound not get book information.Status code : "+str(s['responseHeader']['status']))
                 return False
         else:
            logging.debug("Pdf Driver :Could not get book information. Check if the server is up. Error code: "+ result[0])
            return False

     def get_book_metadata(self,book_dic):
         self.book_meta_data['id'] = book_dic['id']
         self.book_meta_data['author'] = book_dic['author']
         self.book_meta_data['title'] = book_dic['title']
         self.book_meta_data['created'] = book_dic['created']
         self.book_meta_data['modified'] = book_dic['modified']
         self.book_meta_data['summary'] = book_dic['summary']

     def create_pdf_from_book(self,host_name,fid):
         self.host_name = host_name
         self.fid = fid
         logging.debug("Pdf Driver :Host : "+self.host_name+" fid :"+self.fid)
         result = self.get_flexbook_data()
         mypdf = CK12Pdf()
         mypdf.create_metadata_pdf(self.book_meta_data,'book')
         for chapter in self.chapters_array:
               cid = chapter['id']
               detail_url = self.host_name+ API_INSTANCE_PREFIX +CHAPTER_DETAIL_ENDPOINT+str(cid)
               result = doGet(detail_url)
               if result[0] == 200 :
                   s = json.JSONDecoder().decode(result[1])
                   if s['responseHeader']['status']== 0:
                        result = mypdf.save_chapter_xml(s['response']['chapter'])
                        if result == True:
                            mypdf.create_metadata_pdf(chapter,'chapter')
                        else:
                            logging.debug("Pdf Driver :Could not save chapter details Cid:"+str(cid))
                   else:
                         logging.debug("Pdf Driver :Could not get chapter details Cid:"+str(cid)+" Status:"+str(s['responseHeader']['status']))
         mypdf.save_metadata_file()
         mypdf.create_pdf()
         logging.debug(mypdf.pdf_file)

def doGet(url):
    f = urllib2.urlopen(url);
    return [f.code, f.read()]


if __name__ == "__main__":
    my_driver = Pdf_Driver()
    host_name =  sys.argv[1]
    fid = sys.argv[2]
    my_driver.create_pdf_from_book(host_name,fid)
