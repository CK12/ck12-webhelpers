import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.txt')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

requires = [
    'pyramid',
    'pyramid-beaker',
    'pyramid_debugtoolbar',
    'pyramid-jinja2',
    'pyramid-simpleform==0.6.1',
    'pyramid-tm',
    'beaker',
    'beaker_extensions',
    'celery==3.0.22',
    'celery-with-redis==3.0',
    'jinja2',
    'PIL',
    'pyexecjs',
    'pylons==1.0.1',
    'pyPdf',
    'pymongo==2.8',
    'redis',
    'transaction',
    'waitress',
    'WebTest',
    'zope.sqlalchemy',
    'inflect',
    'pycrypto',
    'IP2Location',
    'kafka-python==0.9.4'
    ]

paster_plugins = ["Pylons", "WebHelpers", "PasteScript"]

setup(name='dexter',
      version='0.0',
      description='dexter',
      long_description=README + '\n\n' + CHANGES,
      classifiers=[
        "Programming Language :: Python",
        "Framework :: Pyramid",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        ],
      author='',
      author_email='',
      url='',
      keywords='web wsgi bfg pylons pyramid',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      test_suite='dexter',
      install_requires=requires,
      entry_points="""\
      [paste.app_factory]
      main = dexter:main
      [console_scripts]
      initialize_dexter_db = dexter.scripts.initializedb:main
      """,
      )
