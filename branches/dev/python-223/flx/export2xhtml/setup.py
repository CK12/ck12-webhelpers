from distutils.core import setup
import re

from export2xhtml.build import build_script

versionString = '2.3.3.1'
fd = open('bin/export2xhtml', 'r')
content = fd.read()
fd.close()
content = re.sub('(VERSION = "%prog)(.*)(")', '\\1 %s\\3' %(versionString), content)
fd = open('bin/export2xhtml', 'w')
fd.write(content)
fd.close()

setup(name='export2xhtml',
      version='%s' %(versionString),
      description='Mediawiki to XHTML translator through mwlib',
      author='Thejaswi Raya, Deepak Babu',
      author_email='thejaswi@ck12.org, deepak@ck12.org',
      url='',
      packages=['export2xhtml'],
      scripts=['bin/export2xhtml'],
      cmdclass={'build_script': build_script},
      )
