import sys
from flx.model import api
import os.path
import logging
from flx.controllers.celerytasks.generictask import GenericTask
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
from email.mime.text import MIMEText
import smtplib
import urllib
log = logging.getLogger(__name__)

class getUnPublishedBooksTask(GenericTask):
    """Class to getting unpublished books details
    """
    loglevel = "INFO"

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.dir = os.path.join(self.config.get('flx_home'), 'flx', 'templates', self.config.get('instance'), 'email')

    def run(self, **kwargs):
        """Main function.
        """   
        userId=3
        member=api.getMemberByID(userId)
        userlogin=member.defaultLogin
        bookTypes=['book', 'tebook', 'workbook', 'studyguide', 'labkit', 'quizbook']
        data=[]

        for bookType in bookTypes:
            artifacts=api.getArtifacts(typeName=bookType, ownerID=userId)
            for book in artifacts.results:
                try:
                    tempBook={}
                    notPublished=0
                    tempBook['name']=book.name
                    tempBook['id']=str(book.id)
                    tempBook['status']=""
                    tempBook['chapters']=[]
                    tempBook['url']= self.config.get('web_prefix_url')+'/'+urllib.quote_plus('user:'+userlogin)+'/'+bookType+'/'+book.handle

                    if not str(book.revisions[0].publishTime):
                        tempBook['status']="- Not Published"
                        notPublished=1
                    else:
                        #getting chapters
                        chapters = book.revisions[0].getChildren()
                        i=1
                        for ch in chapters:
                            tempChapters={}
                            tempChapters['name']=ch.name
                            tempChapters['id']=str(ch.id)
                            tempChapters['status']=""   
                            tempChapters['section']=[]
                            tempChapters['url']=tempBook['url']+"/section/"+str(i)+".0"

                            if not str(ch.revisions[0].publishTime) :
                                tempChapters['status']= "- Not Published"
                                notPublished=1
                                tempBook['chapters'].append(tempChapters)

                            #getting sections details
                            section = ch.revisions[0].getChildren()
                            j=1
                            sectionNotPublished=0
                            for se in section:
                                if not se.revisions[0].publishTime :
                                    t={'name': se.name, 'id':str(se.id),'status': '- Not Published','url': tempBook['url']+"/section/"+str(i)+"."+str(j) }
                                    tempChapters['section'].append(t)
                                    notPublished=1
                                    sectionNotPublished=1
                                j=j+1

                            if sectionNotPublished:
                                tempBook['chapters'].append(tempChapters)

                            i=i+1

                    if notPublished:
                        data.append(tempBook)

                except Exception, e: 
                    log.info("Exception Handle : ")
                    log.info(sys.exc_info()[0])
                    log.info(str(e))

            #Outside of results loop
        #Outside of bookTypes loop
        self.sendEmail(data)

    def sendEmail(self, data):

        fromAddr = self.config.get('email_from')
        smtpHost = self.config.get('smtp_server')

        # Create message container - the correct MIME type is multipart/alternative.
        msg = MIMEMultipart('alternative')
        msg['From'] = fromAddr

        msg['Reply-To'] = fromAddr
        htmlTemplate, txtTemplate = self.loadTemplates('GET_UNPUBLISHED_BOOKS')
        msg['Subject'] ="Unpublished Book details (celerytasks)"

        #strings = {'events': eventDicts, 'member': notification.subscriber, 'site': self.config.get('web_prefix_url'), 'flxhost': self.config.get('flx_prefix_url')}
        strings = {'books': data}
        html = htmlTemplate.render(strings)
        log.debug("HTML: %s" % html)
        text = txtTemplate.render(strings)
        log.debug("Text: %s" % text)

        # Record the MIME types of both parts - text/plain and text/html.
        part1 = MIMEText(text.encode('utf-8'), 'plain', 'UTF-8')
        part2 = MIMEText(html.encode('utf-8'), 'html', 'UTF-8')

        # Attach parts into message container.
        # According to RFC 2046, the last part of a multipart message, in this case
        # the HTML message, is best and preferred.
        msg.attach(part1)
        msg.attach(part2)

        emailIds = self.config.get('content.email')
        emailIdList = None
        if emailIds:
            emailIdList=emailIds.split(',')
        else:
            log.info("No email id fount in development.ini please configure 'content.email' ")

        if emailIdList and isinstance(emailIdList, list):
            for to in emailIdList:
                to = to.strip('')
                msg['To'] = to
                # Send the message via local SMTP server.
                log.info("Connecting to: %s" % smtpHost)
                s = smtplib.SMTP(smtpHost, timeout=10)
                # sendmail function takes 3 arguments: sender's address, recipient's address
                # and message to send - here it is sent as one string.
                #log.debug("Sending email from[%s] to[%s] " % (fromAddr, to))
                #log.debug('Sending email msg[%s]' % msg.as_string())

                s.sendmail(fromAddr, to, msg.as_string())
                s.quit()
                #log.debug("Email sent to [%s] " % (to))
        else:
            log.info("Invalid email id configuration ")


    def loadTemplates(self, notification):

        templateEnv = Environment(loader=FileSystemLoader(self.dir))
        log.info("Template dir: %s" % self.dir)
        log.info("Template templateEnv: %s" % templateEnv)
        try:
            htmlName = '%s.html' % notification
            htmlTemplate = templateEnv.get_template(htmlName)
        except Exception, e:
            log.warn("Could not find template: %s.html. Defaulting to basic.html. error[%s]" % (notification, str(e)))
            htmlTemplate = templateEnv.get_template('basic.html')

        try:
            txtName = '%s.txt' % notification
            txtTemplate = templateEnv.get_template(txtName)
        except Exception:
            #log.warn("Could not find template: %s.txt. Defaulting to basic.txt" % notification.eventType.name)
            txtTemplate = templateEnv.get_template('basic.txt')

        return htmlTemplate, txtTemplate
