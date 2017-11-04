import itertools
import mimetools
import mimetypes
from cStringIO import StringIO
import urllib
import urllib2
import cookielib

class MultiPartForm(object):
    """Accumulate the data to be used when posting a form."""

    def __init__(self):
        self.form_fields = []
        self.files = []
        self.boundary = mimetools.choose_boundary()
        return
    
    def get_content_type(self):
        return 'multipart/form-data; boundary=%s' % self.boundary

    def add_field(self, name, value):
        """Add a simple field to the form data."""
        self.form_fields.append((name, value))
        return

    def add_file(self, fieldname, filename, fileHandle, mimetype=None):
        """Add a file to be uploaded."""
        body = fileHandle.read()
        if mimetype is None:
            mimetype = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
        self.files.append((fieldname, filename, mimetype, body))
        return
    
    def __str__(self):
        """Return a string representing the form data, including attached files."""
        # Build a list of lists, each containing "lines" of the
        # request.  Each part is separated by a boundary string.
        # Once the list is built, return a string where each
        # line is separated by '\r\n'.  
        parts = []
        part_boundary = '--' + self.boundary
        
        # Add the form fields
        parts.extend(
            [ part_boundary,
              'Content-Disposition: form-data; name="%s"' % name,
              '',
              value,
            ]
            for name, value in self.form_fields
            )
        
        # Add the files to upload
        parts.extend(
            [ part_boundary,
              'Content-Disposition: file; name="%s"; filename="%s"' % \
                 (field_name, filename),
              'Content-Type: %s' % content_type,
              '',
              body,
            ]
            for field_name, filename, content_type, body in self.files
            )
        
        # Flatten the list and add closing boundary marker,
        # then return CR+LF separated data
        flattened = list(itertools.chain(*parts))
        flattened.append('--' + self.boundary + '--')
        flattened.append('')
        return '\r\n'.join(flattened)

if __name__ == '__main__':
    # Create the form with simple fields
    form = MultiPartForm()
    form.add_field("authorID","1")
    form.add_field("cover image description","Electricity")
    form.add_field("cover image description","Electricity")
    form.add_field("cover image name","electricity")
    form.add_field("cover image uri","")
    form.add_field("xhtml","")
    form.add_field("xhtml path","")
    form.add_field("summary","This is test book")
    form.add_field("title",'Electricity')
    form.add_field("type","book")

    fp = open('/opt/20_ck12_cover.png')
    # Add a fake file
    form.add_file('cover image path', 'cover.png',fp)
    cid=4
    form.add_field("children",str(cid))
    form.add_field("submit","OK")
    import cookielib
    cj = cookielib.CookieJar()
    import urllib2
    opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cj))
    urllib2.install_opener(opener)
    auth_res=urllib2.urlopen('http://pioneer.ck12.org/demo/member/login?name=admin&password=')
    m = auth_res.read() 
    print m
    body = str(form)
    request = urllib2.Request('http://pioneer.ck12.org/demo/create/book')
    request.add_header('Content-type', form.get_content_type())
    request.add_header('Content-length', len(body))
    request.add_data(body)
    s = urllib2.urlopen(request) 
    l = s.read()
    print l

'''
    form = MultiPartForm()
    form.add_field("authorID","1")
    form.add_field("cover image description","Electricity")
    form.add_field("cover image name","electricity")
    form.add_field("cover image uri","")
    form.add_field("xhtml","")
    form.add_field("xhtml path","")
    book_name="electricity"
    form.add_field("summary","This is test book")
    form.add_field("title",book_name)
    form.add_field("type","book")
    cid=4
    form.add_field("children",str(cid))
    form.add_field("submit","OK")
    
  
     
    cj = cookielib.CookieJar()
    opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cj))
 
    urllib2.install_opener(opener) 
     
    auth_res=urllib2.urlopen('http://pioneer.ck12.org/demo/member/login?name=admin&password=')
 
#    print auth_res.read()
       
    fp = open('/opt/20_ck12_cover.png')
 
    # Add a fake file
    form.add_file('cover image path', 'cover.png',fp)
   
 
    # Build the request
    request = urllib2.Request('http://pioneer.ck12.org/demo/create/book')
#    request.add_header('User-agent', 'PyMOTW (http://www.doughellmann.com/PyMOTW/)')
    body = str(form)
    request.add_header('Content-type', form.get_content_type())
    request.add_header('Content-length', len(body))
    request.add_data(body)

    print
    print 'OUTGOING DATA:'
    #print request.get_data()

    print
    print 'SERVER RESPONSE:'
    s = urllib2.urlopen(request)
    print s
    print s.read()
'''
