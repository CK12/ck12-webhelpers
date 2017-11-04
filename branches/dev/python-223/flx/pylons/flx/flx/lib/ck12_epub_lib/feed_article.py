import feedparser
import logging


class FeedArticle:

    def __init__(self):
        self.title = ''
        self.content = ''
        self.author = ''
        
    def init_from_feed(self, url, offset):
        fullfeed = feedparser.parse(url)
        try:
            article = fullfeed['entries'][offset]
            self.title = article.title
            #self.author = article.author_detail.name
            
            #default and fallback content
            self.content = article['summary_detail'].value

            #complete content, if exist
            try:
                self.content = article.content[0].value
            except Exception, j:
                logging.debug(str(j))
                
            #Now, embelish content
            #ar_header = "<h2>"+ self.title +"</h2><br /><h3>by: <b>"+ self.author +"</b></h3><br/>"
            #self.content = ar_header + self.content
        except Exception, e:
            logging.debug(str(e))
