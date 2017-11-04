import logging
import traceback
from datetime import date
from datetime import datetime
from datetime import time
from datetime import timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from jinja2 import Environment, FileSystemLoader
from celery import task

from dexter.views.celerytasks.generictask import GenericTask

log = logging.getLogger(__name__)

@task(name="tasks.entity_reporter", base=GenericTask)
class EntityReporter(GenericTask):

    def run(self, **kwargs):
        GenericTask.run(self, **kwargs)
        log.info('Running EntityReporterTask with taskID: %s' %(self.taskID))
        # Prepare today's & yesterday's midnight object.
        previousday = date.today() - timedelta(days = 1)
        today = datetime.combine(date.today(), time(0))
        yesterday = datetime.combine(previousday, time(0))
        # Get all the Invalid Event Counts fro yesterday.
        data = self.db.InvalidEvents.aggregate([{"$match":{"timestamp":{"$gte":yesterday, "$lt":today}}},
                                                {"$group": {"_id": "$eventType", "total": {"$sum":1}}}])
        if data['result']:
            result = data['result']
            totalCount = 0
            for record in result:
                eventType = record['_id']
                del record['_id']
                record['eventType'] = eventType
                totalCount += record['total']
            eventInfo = dict()
            eventInfo['events'] = result
            eventInfo['totalCount'] = totalCount
            eventInfo['currentDate'] = yesterday.date()
            log.info("eventInfo: %s" % eventInfo)
            self.sendMail(eventInfo)

    def sendMail(self, eventInfo):
        """
        Send email.
        """
        templatePath = self.config.get('dexter_templates')
        COMMASPACE = ', '
        # Prepare the email template.
        templates = Environment(loader=FileSystemLoader(templatePath))
        template = templates.get_template('ENTITY_REPORTER.html')
        emailHtml = template.render(eventInfo)
        msgHtml = MIMEText(emailHtml.encode('utf-8'), 'html', 'UTF-8')
        msg = MIMEMultipart('alternative')
        msg.attach(msgHtml)

        sender_email = self.config.get('sender_email')
        to_email = self.config.get('to_email')
        to_emails = to_email.split(',')
        msg['Subject'] = 'Invalid Events Summary Date:%s' % eventInfo['currentDate']
        msg['From'] = sender_email
        msg['To'] = COMMASPACE.join(to_emails)

        s = smtplib.SMTP('localhost')
        s.sendmail(sender_email, to_emails, msg.as_string())
        s.quit()
        log.info("Email sent successfully.")
