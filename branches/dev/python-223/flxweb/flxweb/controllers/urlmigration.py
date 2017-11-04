import logging

from pylons import config, request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from flxweb.lib.base import BaseController, render
from flxweb.lib.remoteapi import RemoteAPI
from pylons.templating import render_jinja2
from flxweb.model.artifact import ArtifactManager

log = logging.getLogger(__name__)

class UrlmigrationController(BaseController):
    '''
    Controller to capture and handle 1.x urls within 2.x context
    '''
    ARCHIVE_SITE_ROOT = config.get('archive_site_root', 'http://archive.ck12.org/')
    ARCHIVE_SITE_FLEXR = config.get('archive_site_flexr',  '%sflexbook/' % (ARCHIVE_SITE_ROOT) )
    ARCHIVE_SITE_PDF_PREFIX = config.get('archive_site_pdf_prefix', '%spdf/'  % (ARCHIVE_SITE_FLEXR) )
    ARCHIVE_SITE_EPUB_PREFIX = config.get('archive_site_epub_prefix', '%sepub/'  % (ARCHIVE_SITE_FLEXR) )
    ARCHIVE_SITE_LIVEVIEW_PREFIX = config.get('archive_site_liveview_prefix', '%sliveview/'  % (ARCHIVE_SITE_FLEXR) )
    ARCHIVE_SITE_VIEWER_PREFIX = config.get('archive_site_viewer_prefix', '%sviewer/'  % (ARCHIVE_SITE_FLEXR) )
    ARCHIVE_SITE_REALM_PREFIX = config.get('archive_site_realm_prefix', '%sbooks/'  % (ARCHIVE_SITE_FLEXR) )
    ARCHIVE_SITE_APPS_PREFIX = config.get('archive_site_apps_prefix', '%sapps/'  % (ARCHIVE_SITE_FLEXR) )
    ARCHIVE_SITE_EMBED_PREFIX = config.get('archive_site_embed_prefix', '%sembed/view/'  % (ARCHIVE_SITE_FLEXR) )
    
    FLEXBOOKS_FOR_ARCHIVES_REDIRECT = config.get('archive_redirect_flexbook_ids','').split(',')
    
    SPECIAL_REDIRECTS = {
                         'ck12_modeling_and_simulation': url( controller='details', action='artifact_perma', 
                                                              artifact_type='book', artifact_title='CK-12-Modeling-and-Simulation-for-High-School-Teachers%3A-Principles%2C-Problems%2C-and-Lesson-Plans' , 
                                                              realm=None, ext=None)
    }

    def old_artifact(self, artifact_type, artifact_id):
        '''
        Handler for 1.x urls for books and chapters.
        If the 1.x artifact 
        '''
        for fbid in self.FLEXBOOKS_FOR_ARCHIVES_REDIRECT:
            if fbid.strip() == artifact_id:
                redirect_url = '%sbook/%s' % ( self.ARCHIVE_SITE_FLEXR, artifact_id )
                redirect (redirect_url, code=302)
        if artifact_type == 'flexbook':
            artifact_type='book'
        artifact_info = ArtifactManager.get_1x_artifact_info(artifact_type, artifact_id)
        if not artifact_info:
            if artifact_type == 'book':
                c.artifact_type = 'FlexBook'
                c.artifact_type_legal = 'FlexBook&reg;'
            else :
                c.artifact_type = c.artifact_type_legal = 'chapter'
            c.artifact_id = artifact_id
            return render_jinja2('urlmigration/unmigrated.html')
        else:
            if artifact_type == 'book':
                artifact = artifact_info.get('artifact')
                redirect_url = url(  controller='details', action='artifact_perma', 
                                     artifact_type = artifact.get('artifactType'), 
                                     artifact_title = artifact.get('handle'), 
                                     realm = artifact.get('realm'), 
                                     ext = 'r%s' % artifact.getVersionNumber()  )
                redirect(redirect_url, code=302)
            if artifact_type == 'chapter' :
                artifact = artifact_info.get('artifact')
                parent = artifact_info.get('parent')
                position = '%s.0' % artifact_info.get('position')
                redirect_url = url( controller='details', action='artifact_perma_context_book',
                                    booktype = parent.get('artifactType'), 
                                    book_handle = parent.get('handle'), 
                                    realm = parent.get('realm'), 
                                    version = parent.getVersionNumber(), 
                                    position=position,
                                    section_title = artifact.get('handle')  )
                redirect(redirect_url, code=302)
    
    def urlmigration_pdf(self, pdf_id): 
        '''
        Handler for 1.x PDF urls.
        '''
        #redirect to archive.ck12.org
        url_pdf = '%s%s' % (self.ARCHIVE_SITE_PDF_PREFIX, pdf_id)
        redirect(url_pdf, code=302)    
    
    def urlmigration_liveview(self, liveview_id):
        '''
        Handler for 1.x LiveView urls.
        '''
        #redirect to archive.ck12.org 
        url_liveview = '%s%s' % (self.ARCHIVE_SITE_LIVEVIEW_PREFIX, liveview_id)
        redirect(url_liveview, code=302)
    
    def urlmigration_viewer(self, viewer_id):
        '''
        Handler for 1.x flippo urls
        '''
        #redirect to archive.ck12.org
        url_viewer = '%s%s' % (self.ARCHIVE_SITE_VIEWER_PREFIX, viewer_id)
        redirect(url_viewer, code=302)
    
    def urlmigration_epub(self, epub_name):
        '''
        Handler for 1.x epub urls
        '''
        #redirect to archive.ck12.org
        url_epub = '%s%s' % (self.ARCHIVE_SITE_EPUB_PREFIX, epub_name)
        redirect(url_epub, code=302)
    
    def urlmigration_realm(self, realm):
        '''
        Handler for 1.x realm URLs
        '''
        #redirect to archive.ck12.org
        url_realm = '%s%s' % (self.ARCHIVE_SITE_REALM_PREFIX, realm)
        redirect(url_realm, code=302)
    
    def urlmigration_apps(self, app):
        '''
        Handler for 1.x realm URLs
        '''
        #redirect to archive.ck12.org
        url_realm = '%s%s' % (self.ARCHIVE_SITE_APPS_PREFIX, app)
        redirect(url_realm, code=302)
    
    def urlmigration_catchall(self, old_url):
        '''
        Catch-all for all other unhandled URLs
        '''
        old_url = old_url.lower().strip()
        if old_url in self.SPECIAL_REDIRECTS:
               redirect ( self.SPECIAL_REDIRECTS.get(old_url) )
        return render_jinja2('urlmigration/welcome.html')
    
    def urlmigration_embed(self, embed_id):
        #redirect to archive.ck12.org
        url_embed = '%s%s' % ( self.ARCHIVE_SITE_EMBED_PREFIX, embed_id)
        return redirect(url_embed, code=302)