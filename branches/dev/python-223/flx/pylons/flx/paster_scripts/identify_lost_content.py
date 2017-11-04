import logging
from BeautifulSoup import BeautifulSoup

from flx.model import api

html_tags = ['html', 'head', 'title', 'body']
annotatable_tags = ['p', 'ul', 'ol', 'dl', 'table', 'div', 'pre', 'blockquote', 'iframe']

LOG_FILENAME = "/tmp/identify_lost_content.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

def run():

    member_emails_1 = ['EPISDalg1@episd.org',
            'EPISDgeom@episd.org',
            'EPISDalg2@episd.org',
            'EPISDprecal@episd.org',
            'EPISDaqr@episd.org',
            'EPISDapcalAB@episd.org',
            'EPISDapcalBC@episd.org',
            'EPISDapstats@episd.org',
            'EPISDdm@episd.org',
            'EPISDem@episd.org',
            'EPISDsrm@episd.org',
            'EPISDmm@episd.org']
    member_emails_2 = ['EPISDusHis@episd.org',
            'EPISDwg@episd.org',
            'EPISDwh@episd.org',
            'EPISDusgov@episd.org',
            'EPISDEcon@episd.org',
            'EPISDSociology@episd.org',
            'EPISDPsych@episd.org',
            'EPISDapUShis@episd.org',
            'EPISDapwh@episd.org',
            'EPISDaphg@episd.org',
            'EPISDapUSgov@episd.org',
            'EPISDapEuro@episd.org',
            'EPISDapmacroecon@episd.org']
    member_emails = member_emails_1 + member_emails_2

    for email in member_emails:
        member = api.getMemberByEmail(email=email)
        log.info('Processing memberEmail: [%s] memberID: [%s]' %(email, member.id))
        lessons = api.getArtifactsByOwner(owner=member, typeName='lesson')
        for each_lesson in lessons:
            concept = each_lesson.getChildren()
            if concept:
                concept = concept[0]
            else:
                log.warn('Lesson with artifactID: [%s] has no concept')
                continue
            if is_concept_empty(concept) and is_lesson_full(each_lesson):
                log.warn('Concept is empty, lesson has content. Lesson artifactID [%s], concept artifactID [%s]' %(each_lesson.id, concept.id))


def is_concept_empty(concept):
    html_str = concept.getXhtml()
    soup = BeautifulSoup(html_str)

    #if concept.id == 1836408:
    #    import pdb; pdb.set_trace()

    is_empty = False

    elements = soup.findAll(annotatable_tags)
    if len(elements) > 1:
        is_empty = False

    if len(elements) == 0:
        is_empty = True

    if len(elements) == 1:
        text = elements[0].text
        if text:
            text = text.strip()
        if not text or text == '&#160;':
            is_empty = True

    return is_empty

def is_lesson_full(lesson):
    html_str = lesson.getXhtml()
    soup = BeautifulSoup(html_str)

    is_full = False

    non_ck12_classes = soup.findAll(is_not_ck12_class)
    if len(non_ck12_classes) > 0:
        is_full = True
    return is_full

def is_not_ck12_class(tag):
    ck12_class = False
    if tag.name in ['html', 'head', 'title', 'body']:
        ck12_class = True
    elif tag.name in ['p', 'ul', 'ol', 'dl', 'table', 'div', 'pre', 'blockquote']:
        ck12_classes = ['x-ck12-data-objectives', 'x-ck12-data-concept', 'x-ck12-data-problem-set', 'x-ck12-data-vocabulary']
        class_name = tag.get('class', '').strip()
        if class_name in ck12_classes:
            ck12_class = True
    return not ck12_class
