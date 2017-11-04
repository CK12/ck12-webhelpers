# Copyright 2008 Neil Martinsen-Burrell
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

"""
Test the command mechanism.
"""

from cStringIO import StringIO

from bzrlib.plugins.cmd.runner import Runner

from bzrlib.tests import TestCaseInTempDir
from bzrlib.bzrdir import BzrDir
from bzrlib.delta import TreeDelta


sample_config = ("[DEFAULT]\n"
                 "post_commit_cmd=pwd")

class TestCaseRemoteCmd(TestCaseInTempDir):

    def get_cmd(self, text=sample_config):
        self.branch = BzrDir.create_branch_convenience('from-branch')
        tree = self.branch.bzrdir.open_workingtree()
        tree.commit('foo bar baz\nfuzzy\nwuzzy', rev_id='A',
            allow_pointless=True,
            timestamp=1,
            timezone=0,
            committer="Sample <stephen@example.com>",
            )
        my_config = self.branch.get_config()
        config_file = StringIO(text)
        (my_config._get_global_config()._get_parser(config_file))
        return Runner(self.branch, 'A', my_config)        


class TestConfigs(TestCaseRemoteCmd):

    def testExistence(self):
        """Test if our test setup even works."""
        u = self.get_runner()
        self.assertIsInstance(u, Runner)
