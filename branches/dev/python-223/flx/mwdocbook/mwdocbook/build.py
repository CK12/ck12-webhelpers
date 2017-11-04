from __future__ import with_statement
from distutils.command.build import build
from distutils.core import Command
from subprocess import Popen, PIPE
from os.path import exists

class build_script(Command):
    description = 'build mwdocbook from mwdocbook.in with ' + \
                  'template substitutions'

    def initialize_options(self):
        pass
    def finalize_options(self):
        pass
    def run(self):
        if not exists('bin/mwdocbook.in'):
            if exists('bin/mwdocbook'):
                return                  # source distribution
            else:
                raise Exception('Defective source distribution')

        with open('bin/mwdocbook', 'w') as output:
            with open('bin/mwdocbook.in', 'r') as input:
                output.write(input.read())

build.sub_commands.insert(0, ('build_script', None))
