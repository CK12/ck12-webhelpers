try:
    from setuptools import setup, find_packages
except ImportError:
    from ez_setup import use_setuptools
    use_setuptools()
    from setuptools import setup, find_packages

setup(
    name='flx',
    version='0.1',
    description='',
    author='',
    author_email='',
    url='',
    install_requires=[
        "beaker>1.6.4,<1.7",
        "beakeredis",
        "BeautifulSoup",
        "boto",
        "boto3",
        "bzr",
        "celery[redis]<3.2,>3.1",
        "configobj",
        "pyclamd",
        "coverage",
        "cssutils",
        "eventlet",
        "fcrepo",
        "feedparser",
        "gdata",
        "google-api-python-client",
        "jsonlib",
        "Pylons>=1.0.1",
        "SQLAlchemy==1.1.9",
        "Jinja2",
        "gp.fileupload==1.1",
        "M2Crypto",
        "MySQL-python",
        "WebOb==1.2.3",
        "pillow",
        "oauth2client",
        "pyclamd",
        "pycrypto",
        "pymongo==2.8",
        "pytidylib",
        "pytz",
        "redis",
        "requests",
        "solrpy",
        "xmltodict",
        "gcm",
        "apns"
    ],
    dependency_links=[
    ],
    setup_requires=["PasteScript>=1.6.3"],
    packages=find_packages(exclude=['ez_setup']),
    include_package_data=True,
    test_suite='nose.collector',
    package_data={'flx': ['i18n/*/LC_MESSAGES/*.mo']},
    #message_extractors={'flx': [
    #        ('**.py', 'python', None),
    #        ('public/**', 'ignore', None)]},
    zip_safe=False,
    paster_plugins=['PasteScript', 'Pylons'],
    entry_points="""
    [paste.app_factory]
    main = flx.config.middleware:make_app

    [paste.app_install]
    main = pylons.util:PylonsInstaller

    [nose.plugins]
    pylons = pylons.test:PylonsPlugin
    """,
)
