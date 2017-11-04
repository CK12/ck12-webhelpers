#!/bin/bash
#
# Updates the flxweb cache
#

HOST="$1"

usage() {
    echo "Usage: ${0} <host>"
    echo "   where <host> is the host for which we want to refresh the cache (eg: gamma.ck12.org)"
}

if [ $# -lt 1 ]; then
    echo ">>> Incorrect number of parameters"
    usage
    exit 1
fi

echo "Flxweb cache update script"

branches=("analysis" "arithmetic" "geometry" "probability"\
            "calculus" "algebra" "trigonometry" "measurement"\
            "statistics" "biology"\
            "physics" "chemistry"\
            "physical-science" "life-science"\
            "earth-science" "engineering" "writing" "spelling"\
            "history" "technology" "sat-exam-prep"\
            "astronomy" "economics")

#echo "Generating summary cache"
#for brn in MAT SCI; do
#    curl "https://$HOST/flx/browse/modality/summary/artifact/${brn}" > /dev/null
#done

echo "generating the cache for default landing page:"
curl "https://$HOST/?nocache=true&key=grid" > /dev/null

echo "generating the cache for teacher page:"
curl "https://$HOST/teacher/?nocache=true&key=grid" > /dev/null

echo "generating the cache for student page:"
curl "https://$HOST/student/?nocache=true&key=grid" > /dev/null

echo "Refreshing browse cache for:"
for branch in "${branches[@]}"
do
    :
    echo $branch
    #curl --cookie 'browseview=gridview' "https://$HOST/$branch?nocache=true" > /dev/null
    curl --cookie 'browseview=listview' "https://$HOST/$branch/?nocache=true" > /dev/null
done

#echo "Rebuild Standard concept cache"
#curl --max-time 60 "https://$HOST/flx/rebuild/cache/concepts" > /dev/null

wait
echo "Flxweb cache update script completed"

