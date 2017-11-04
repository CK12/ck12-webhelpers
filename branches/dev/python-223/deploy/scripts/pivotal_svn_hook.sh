#!/bin/bash

set -e

## dev@ck12.org
TOKEN="c1decf82d9c2315b7a46d846f752e2d5"

REPO="$1"
REV="$2"

echo "REPO=$REPO, REV=$REV"

AUTHOR=`/usr/bin/svnlook author $REPO -r $REV`
MESSAGE=`/usr/bin/svnlook log $REPO -r $REV`
CHANGES=`/usr/bin/svnlook changed $REPO -r $REV`
URL="https://insight.ck12.org/svn?view=rev&root=ck12&revision=${REV}"

# You must HTML-escape the XML post data
MESSAGE=$(cat <<EOF
$MESSAGE

CHANGES:

    $CHANGES
EOF
)
MESSAGE=${MESSAGE//&/&amp;}
MESSAGE=${MESSAGE//</&lt;}
MESSAGE=${MESSAGE//>/&gt;}
# This is just a simple example.  You also need to handle the AUTHOR, as well as quotes, backticks, etc...
# If you have a better one, please let us know, and we'll add it to the list of Tracker 3rd Party Tools
# at http://pivotaltracker.com/help/thirdpartytools.

echo curl -H "X-TrackerToken: $TOKEN" -X POST -H "Content-type: application/xml" -d "<source_commit><message>$MESSAGE</message><author>$AUTHOR</author><commit_id>$REV</commit_id><url>$URL</url></source_commit>" "https://www.pivotaltracker.com/services/v4/source_commits"

RESPONSE=$(curl -H "X-TrackerToken: $TOKEN" -X POST -H "Content-type: application/xml" \
  -d "<source_commit><message>$MESSAGE</message><author>$AUTHOR</author><commit_id>$REV</commit_id><url>$URL</url></source_commit>" \
  https://www.pivotaltracker.com/services/v4/source_commits)

echo $RESPONSE >> /tmp/tracker_post_commit.log

