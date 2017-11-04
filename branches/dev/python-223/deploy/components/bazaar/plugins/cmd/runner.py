# Copyright 2008 Neil Martinsen-Burrell
# Copyright (C) 2005, 2006, 2007 Canonical Ltd
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA 

import subprocess
from bzrlib import (
    branch,
    errors,
    trace,
)

class Runner(object):

    """Run command after commit"""

    def __init__(self, branch, revid, config):
        self.branch = branch
        self.revid = revid
        self.config = config

    def __get_command(self):
        command = self.config.get_user_option('post_commit_cmd')
        if command is None:
            return [
		    'pssh',
                    '-Piv',
		    '--hosts=/vcs/.pssh-hosts',
		    'bzr update /opt/2.0/flx/pylons/flx/data/bzr'
		   ]
        if isinstance(command, unicode):
            return [command]
        return command
 
    def run_command(self):
        """Run the command."""
	command = self.__get_command()
        trace.mutter("update targets: %s" % command)
        subprocess.call(command)
