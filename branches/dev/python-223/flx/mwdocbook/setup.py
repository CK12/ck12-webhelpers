from distutils.core import setup

from mwdocbook.build import build_script

setup(name='mwdocbook',
      version='2.0',
      description='wiki to docbook translator over mwlib',
      author='Peter Danenberg, Deepak Babu',
      author_email='peter@ck12.org, deepak@ck12.org',
      url='',
      packages=['mwdocbook'],
      scripts=['bin/mwdocbook'],
      cmdclass={'build_script': build_script},
      )
