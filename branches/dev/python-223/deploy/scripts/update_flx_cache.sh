#!/bin/bash
#
# Updates the flx cache
#

HOST="$1"
modality="${2}"

usage() {
    echo "Usage: ${0} <host> [<modality>]"
    echo "   where <host> is the host for which we want to refresh the cache (eg: gamma.ck12.org)"
}

if [ $# -lt 1 ]; then
    echo ">>> Incorrect number of parameters"
    usage
    exit 1
fi

echo "Flx cache update script"

branches=("MAT.ALY" "MAT.ARI" "MAT.GEO" "MAT.PRB"\
            "MAT.CAL" "MAT.ALG" "MAT.TRG" "MAT.MEA"\
            "MAT.STA" "SCI.BIO"\
            "SCI.PHY" "SCI.CHE"\
            "SCI.PSC" "SCI.LSC"\
            "SCI.ESC" "ENG.TST" "ELA.SPL")

other_subjects=("engineering" "technology" "writing" "astronomy" "history" "economics" "exam%20preparation")

echo "generating the overall browse cache:"

maxLevels=7
i=1
while [ ${i} -le ${maxLevels} ]; do
    echo "Level: ${i}"
    echo "https://$HOST/flx/get/info/browseTerm/descendants/CKT/${i}?pageSize=1000&nocache=true"
    curl "https://$HOST/flx/get/info/browseTerm/descendants/CKT/${i}?pageSize=1000&nocache=true" > /dev/null
    let i=i+1
done

echo "Refreshing browse cache..."
for branch in "${branches[@]}"
do
    echo "Processing $branch ..."
    echo "https://$HOST/flx/get/info/browseTerm/descendants/$branch/${maxLevels}?pageSize=1000&nocache=true"
    curl "https://$HOST/flx/get/info/browseTerm/descendants/$branch/${maxLevels}?pageSize=1000&nocache=true" > /dev/null
    echo "https://$HOST/flx/browse/modality/artifact/$branch/all?pageSize=5000"
    curl "https://$HOST/flx/browse/modality/artifact/$branch/all?pageSize=5000" > /dev/null
    echo "https://$HOST/flx/browse/subject/book/$branch?sort=stitle%2Casc&pageNum=1&ck12only=True&pageSize=1000&extendedArtifacts=True&filters=False&includeEIDs=1&nocache=true"
    curl "https://$HOST/flx/browse/subject/book/$branch?sort=stitle%2Casc&pageNum=1&ck12only=True&pageSize=1000&extendedArtifacts=True&filters=False&includeEIDs=1&nocache=true" > /dev/null
done

for subject in "${other_subjects[@]}"; do
    echo "https://$HOST/flx/browse/subject/book/$subject?sort=stitle%2Casc&pageNum=1&ck12only=True&includeEIDs=1&pageSize=1000&extendedArtifacts=True&filters=False&nocache=true"
    curl "https://$HOST/flx/browse/subject/book/$subject?sort=stitle%2Casc&pageNum=1&ck12only=True&includeEIDs=1&pageSize=1000&extendedArtifacts=True&filters=False&nocache=true" > /dev/null
done

if [ "${modality}" = "modality" ]; then
    echo "Refreshing artifact cache..."
    for branch in "${branches[@]}"
    do
        echo "Processing $branch ..."
        echo "https://$HOST/flx/browse/minimal/artifact/$branch.?format=json&termAsPrefix=true&ck12only=true&pageSize=5000&termTypes=domainIDs"
        curl "https://$HOST/flx/browse/minimal/artifact/$branch.?format=json&termAsPrefix=true&ck12only=true&pageSize=5000&termTypes=domainIDs" > /dev/null
    done
fi

#echo "https://$HOST/assessment/api/build/cache/concepts"
#curl "https://$HOST/assessment/api/build/cache/concepts" > /dev/null

echo "Flx cache update script completed"

