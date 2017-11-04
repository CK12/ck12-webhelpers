try:
    from setuptools import setup, find_packages
except ImportError:
    from ez_setup import use_setuptools
    use_setuptools()
    from setuptools import setup, find_packages

setup(
    name='iss',
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
        "celery[redis]<3.2,>3.1",
        "eventlet",
        "fcrepo",
        "jsonlib",
        "Pylons>=1.0.1",
        "pymongo==2.8",
        "requests",
        "SQLAlchemy>=1.0",
        "MySQL-python",
    ],
    setup_requires=["PasteScript>=1.6.3"],
    packages=find_packages(exclude=['ez_setup']),
    include_package_data=True,
    test_suite='nose.collector',
    package_data={'iss': ['i18n/*/LC_MESSAGES/*.mo']},
    #message_extractors={'iss': [
    #        ('**.py', 'python', None),
    #        ('templates/**.mako', 'mako', {'input_encoding': 'utf-8'}),
    #        ('public/**', 'ignore', None)]},
    zip_safe=False,
    paster_plugins=['PasteScript', 'Pylons'],
    entry_points="""
    [paste.app_factory]
    main = flx.config.middleware:make_app

    [paste.app_install]
    main = pylons.util:PylonsInstaller
    """,
)
