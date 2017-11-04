try:
    from setuptools import setup, find_packages
except ImportError:
    from ez_setup import use_setuptools
    use_setuptools()
    from setuptools import setup, find_packages

setup(
    name='sts',
    version='0.1',
    description='',
    author='',
    author_email='',
    url='',
    install_requires=[
        "beaker>1.6.4,<1.7",
        "beakeredis",
        "Pylons>=1.0",
        "SQLAlchemy>=0.5",
        "Jinja2",
        "coverage",
        "py2neo==1.5",
        "MySQL-python",
        "oauth2client==1.4.6",
        "oauth2",
        "redis",
    ],
    dependency_links=[
    ],
    setup_requires=["PasteScript>=1.6.3"],
    packages=find_packages(exclude=['ez_setup']),
    include_package_data=True,
    test_suite='nose.collector',
    package_data={'sts': ['i18n/*/LC_MESSAGES/*.mo']},
    #message_extractors={'sts': [
    #        ('**.py', 'python', None),
    #        ('public/**', 'ignore', None)]},
    zip_safe=False,
    paster_plugins=['PasteScript', 'Pylons'],
    entry_points="""
    [paste.app_factory]
    main = sts.config.middleware:make_app

    [paste.app_install]
    main = pylons.util:PylonsInstaller

    [nose.plugins]
    pylons = pylons.test:PylonsPlugin
    """,
)
