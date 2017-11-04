$REPO=`git svn info  | grep "Repository Root: " | sed -e 's/Repository Root: //'`
git branch -r | sed 's|^[[:space:]]*||' | grep -v '^tags/' > git-branch-list
svn ls $REPO/branches | sed 's|^[[:space:]]*||' | sed 's|/$||' > svn-branch-list
diff -u git-branch-list svn-branch-list | grep '^-' | sed 's|^-||' | grep -v '^trunk$' | grep -v '^--' > old-branch-list
echo "Removing ..."
cat old-branch-list
#for i in `cat old-branch-list`; do git branch -d -r "$i"; rm -rf .git/svn/refs/remotes/"$i"; done
#rm -v old-branch-list svn-branch-list git-branch-list
