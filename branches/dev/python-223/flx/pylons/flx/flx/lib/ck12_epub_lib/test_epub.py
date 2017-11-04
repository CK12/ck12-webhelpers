from ck12_epub import CK12EPub


#file_handle = open("/opt/repository/2.0/flx/pylons/flx/data/chapters/22.xhtml")
file_handle = open("/opt/data/bzr/0/0/3/272.xhtml")
body1 = file_handle.read()

#file_handle = open("/opt/repository/2.0/flx/pylons/flx/data/chapters/9.xhtml")
#body2 = file_handle.read()

#file_handle = open("/opt/repository/2.0/flx/pylons/flx/data/chapters/18.xhtml")
#body3 = file_handle.read()


myEPub = CK12EPub()
myEPub.book_title = "Ez FlexFeed 1"
myEPub.add_new_chapter("Chapter 1", body1, "http://localhost")
#myEPub.add_new_chapter("Chapter 2", body2, "http://pioneer.ck12.org")
#myEPub.add_new_chapter("Chapter 3", body3, "http://pioneer.ck12.org")
#myEPub.add_new_chapter_from_url('http://docs.python.org/library/urllib.html')
#myEPub.add_new_chapter_from_url('http://docs.python.org/library/re.html')
#myEPub.add_new_chapter_from_url('http://www.cnn.com/2010/TECH/web/07/26/afghanistan.wikileaks/index.html')
#myEPub.add_new_chapter_from_url('http://www.informit.com/articles/article.aspx?p=1278986')
#myEPub.add_new_chapter_from_url('http://www.annotea.org/mozilla/ubi.html')
#myEPub.add_new_chapter_from_url('http://www.moma.org/explore/exhibitions')
#myEPub.add_new_chapter_from_url('http://en.wikipedia.org/wiki/San_Francisco')
myEPub.add_new_chapter_from_feed('http://feeds.feedburner.com/TechCrunch', 1)
myEPub.add_new_chapter_from_feed('http://feeds.feedburner.com/TechCrunch', 2)
myEPub.add_new_chapter_from_feed('http://feeds.feedburner.com/TechCrunch', 3)
#myEPub.add_new_chapter_from_feed('http://rss.cnn.com/rss/cnn_topstories.rss',3)
#myEPub.add_new_chapter_from_feed('http://www.moma.org/feeds/exhibitions.rss',1)
myEPub.add_new_chapter_from_feed('http://www.engadget.com/rss.xml',1)
myEPub.add_new_chapter_from_feed('http://www.engadget.com/rss.xml',2)
myEPub.add_new_chapter_from_feed('http://www.engadget.com/rss.xml',3)
#myEPub.add_new_chapter_from_url('http://en.wikipedia.org/wiki/Wicked:_The_Life_and_Times_of_the_Wicked_Witch_of_the_West')
myEPub.render()
print myEPub.__str__()


#Test using web resources
