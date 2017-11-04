try:
    from setuptools import setup, find_packages
except ImportError:
    from ez_setup import use_setuptools
    use_setuptools()
    from setuptools import setup, find_packages

setup(
    name='flxadmin',
    version='0.1',
    description='',
    author='',
    author_email='',
    url='',
    install_requires=[
        "beaker>1.6.4,<1.7",
        "beakeredis",
        "BeautifulSoup",
        "Jinja2",
        "gunicorn",
        "Pylons>=1.0",
        "python-dateutil",
        "redis",
        "WebOb==1.3.1",

    ],
    setup_requires=["PasteScript>=1.6.3"],
    packages=find_packages(exclude=['ez_setup']),
    include_package_data=True,
    test_suite='nose.collector',
    package_data={'flxadmin': ['i18n/*/LC_MESSAGES/*.mo']},
    #message_extractors={'flxadmin': [
    #        ('**.py', 'python', None),
    #        ('public/**', 'ignore', None)]},
    zip_safe=False,
    paster_plugins=['PasteScript', 'Pylons'],
    entry_points="""
    [paste.app_factory]
    main = flxadmin.config.middleware:make_app

    [paste.app_install]
    main = pylons.util:PylonsInstaller
    """,
)
