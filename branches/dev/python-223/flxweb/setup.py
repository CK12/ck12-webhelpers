#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#      
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Ravi Gidwani
#
# $Id$

try:
    from setuptools import setup, find_packages
except ImportError:
    from ez_setup import use_setuptools
    use_setuptools()
    from setuptools import setup, find_packages

setup(
    name='flxweb',
    version='0.1',
    description='',
    author='',
    author_email='',
    url='',
    install_requires=[
        'BeautifulSoup',
        "Jinja2>=2.2.5",
        'gunicorn',
        "Pylons>=1.0",
        'python-dateutil',
        'beaker>1.6.4,<1.7',
        'beakeredis',
        'redis',
        'WebOb==1.3.1',
        ###
        # Uncomment babel requirement development, only required on development boxes 
        # TODO: see if this can only be included for 'develop' not 'setup'
        ###
        #"Babel>=0.9.5",
    ],
    setup_requires=["PasteScript>=1.6.3"],
    packages=find_packages(exclude=['ez_setup']),
    include_package_data=True,
    test_suite='nose.collector',
    package_data={'flxweb': ['i18n/*/LC_MESSAGES/*.mo']},
    message_extractors={'flxweb': [
            ('**.py', 'python', None),
            ('public/media/js/**.js', 'jinja2', None),
            ('public/**', 'ignore', None),
            ('**.html', 'jinja2', None)]},
    zip_safe=False,
    paster_plugins=['PasteScript', 'Pylons'],
    entry_points="""
    [paste.app_factory]
    main = flxweb.config.middleware:make_app

    [paste.app_install]
    main = pylons.util:PylonsInstaller
    """,
)
