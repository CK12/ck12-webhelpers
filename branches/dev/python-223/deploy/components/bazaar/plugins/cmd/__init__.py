# Copyright 2010 Ck-12 Foundation
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


"""
Run command after committing.

This is a Bazaar (http://bazaar-vcs.org) plugin to run command.
The most common use case is to update a remote working tree.
"""

from bzrlib import trace
from bzrlib.branch import Branch
from bzrlib.lazy_import import lazy_import
lazy_import(globals(), """
from bzrlib.plugins.cmd.runner import Runner
""")


def branch_commit_hook(local, master,
                       old_revno, old_revid,
                       new_revno, new_revid):
    """This is the hook that will actually run after commit."""
    Runner(master, new_revid, master.get_config()).run_command()


def branch_tip_change_hook(params):
    branch = params.branch
    new_revid = params.new_revid
    Runner(branch, new_revid, branch.get_config()).run_command()


def install_hooks():
    """Install the hooks to run after commit."""
    """
    if 'post_change_branch_tip' in Branch.hooks:
        Branch.hooks.install_named_hook(
            'post_change_branch_tip', branch_tip_change_hook, 'cmd')
        trace.mutter("Installed the cmd plugin under post_change_branch_tip")
    else:
        Branch.hooks.install_named_hook(
            'post_commit', branch_commit_hook, 'cmd')
        trace.mutter("Installed the cmd plugin under post_commit")
    """
    Branch.hooks.install_named_hook('post_commit', branch_commit_hook, 'cmd')
    trace.mutter("Installed the cmd plugin under post_commit")


def test_suite():
    from unittest import TestSuite
    import bzrlib.plugins.cmd.tests
    res = TestSuite()
    res.addTest(bzrlib.plugins.cmd.tests.test_suite())
    return res

trace.mutter("Installing the cmd plugin")
install_hooks()
