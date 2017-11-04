#!/usr/bin/env python
from distutils.core import setup


from info import (bzr_plugin_version,
                  bzr_minimum_version,
                  bzr_plugin_name,
                  __version__,
                 )

if __name__ == '__main__':
    setup(name="bzr-cmd",
          version=__version__,
          description="Run command on every change.",
          author="Stephen AuYeung",
          author_email="stephen@ck12.org",
          url="https://launchpad.net/bzr-cmd",
          packages=['bzrlib.plugins.cmd',
                    'bzrlib.plugins.cmd.tests',
                    ],
          package_dir={'bzrlib.plugins.cmd': '.'},
          classifiers=['Development Status :: 1 - Beta',
                       'Intended Audience :: Developers',
                       'License :: OSI Approved :: GNU General Public License (GPL)',
                       'Programming Language :: Python :: 2',
                       'Topic :: Software Development :: Version Control',
                      ]
         )
