from __future__ import with_statement
from distutils.command.build import build
from distutils.core import Command
from os.path import exists

class build_script(Command):
    description = 'build export2xhtml from export2xhtml.in with ' + \
                  'template substitutions'

    def initialize_options(self):
        pass
    def finalize_options(self):
        pass
    def run(self):
        if not exists('bin/export2xhtml.in'):
            if exists('bin/export2xhtml'):
                return                  # source distribution
            else:
                raise Exception('Defective source distribution')

        with open('bin/export2xhtml', 'w') as output:
            with open('bin/export2xhtml.in', 'r') as input:
                output.write(input.read())

build.sub_commands.insert(0, ('build_script', None))
