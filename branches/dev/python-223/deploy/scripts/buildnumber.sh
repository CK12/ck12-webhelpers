#!/bin/bash

#
# Script to update the build number in the ini file pointed out by the passed parameter.
#

EXPECTED_ARGS=2

if [ $# -ne $EXPECTED_ARGS ]
then
  echo "Usage: `basename $0` <svn path> <file_to_modify.ini>"
  echo "Example: `basename $0` /opt/2.0 /opt/2.0/flxweb/development.ini"
  exit 
fi

SVN_BRANCH=`svn info $1 | egrep -o "URL: svn://dev.ck12.org/ck12/(.*)"` 
echo $SVN_BRANCH
case "$SVN_BRANCH" in
  */trunk/*) SVN_BRANCH="TRUNK" ;;
  */branches/fbs/features/*) SVN_BRANCH=`echo $SVN_BRANCH | sed 's/.*\/branches\/fbs\/features\/\([^\/]*\)\/\(.*\)/\1/'` ;;
  */branches/releases/*) SVN_BRANCH=`echo $SVN_BRANCH | sed 's/.*\/branches\/releases\/\([^\/]*\)/\1/'` ;;
  */branches/*) SVN_BRANCH=`echo $SVN_BRANCH | sed 's/.*\/branches\/\([^\/]*\)\/\([^\/]*\).*$/\1_\2/I'` ;;
  *)         SVN_BRANCH="2.0" ;;
esac
SVN_BRANCH=${SVN_BRANCH^^}
SVN_REVISION=`svn log -l 1 $1 --username=build --password=ck1234 | egrep -o "r([0-9]+)" | sed 's/.\(.*\)/\1/' | head -n 1`
sed "s/\(build_minor_version\)\(.*\)/\1 = $SVN_REVISION/" -i $2
sed "s/\(build_major_version\)\(.*\)/\1 = $SVN_BRANCH/" -i $2
echo "Build number changed in $2, to $SVN_BRANCH.$SVN_REVISION using the SVN details from $1"
 
