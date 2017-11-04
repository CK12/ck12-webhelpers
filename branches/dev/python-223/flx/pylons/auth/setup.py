try:
    from setuptools import setup, find_packages
except ImportError:
    from ez_setup import use_setuptools
    use_setuptools()
    from setuptools import setup, find_packages

setup(
    name='auth',
    version='0.1',
    description='',
    author='',
    author_email='',
    url='',
    install_requires=[
        "requests==2.9.1",
        "beaker>1.6.4,<1.7",
        "beakeredis",
        "docutils",
        "futures==3.0.5",
        "boto==2.38.0",
        "boto3",
        "Pylons>=1.0.1",
        "celery[redis]<3.2,>3.1",
        "configobj==5.0.6",
        "cssutils",
        "fcrepo",
        "feedparser==5.2.1",
        "jsonlib==1.6.1",
        "SQLAlchemy==1.1.9",
        "hapipy", ## HubSpot python library
        "Jinja2",
        "gdata==2.0.18",
        "google-api-python-client==1.4.2",
        "gp.fileupload==1.1",
        "MySQL-python",
        "WebOb==1.2.3",
        "oauth2",
        "oauth2client==1.4.6",
        "oauthlib==1.0.3",
        "pycrypto==2.6.1",
        "pyjwt==1.4.2",
        "pymongo==2.8",
        "pytz",
        "redis==2.10.5",
        "requests_oauthlib==0.8.0",
        "xmltodict",
    ],
    dependency_links=[
    ],
    setup_requires=["PasteScript>=1.6.3"],
    packages=find_packages(exclude=['ez_setup']),
    include_package_data=True,
    test_suite='nose.collector',
    package_data={'auth': ['i18n/*/LC_MESSAGES/*.mo']},
    #message_extractors={'auth': [
    #        ('**.py', 'python', None),
    #        ('public/**', 'ignore', None)]},
    zip_safe=False,
    paster_plugins=['PasteScript', 'Pylons'],
    entry_points="""
    [paste.app_factory]
    main = auth.config.middleware:make_app

    [paste.app_install]
    main = pylons.util:PylonsInstaller
    """,
)
