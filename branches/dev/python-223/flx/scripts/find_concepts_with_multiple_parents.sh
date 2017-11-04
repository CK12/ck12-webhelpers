#!/bin/bash
passwd="${1}"
memberID="${2}"
mysql -u dbadmin -p${passwd} flx2 -e "select aac.childID, count(distinct aac.id) from flx2.Artifacts as a, flx2.Artifacts as a2,  flx2.ArtifactAndChildren as aac where a.creatorID = ${memberID} and a.artifactTypeID = 4 and a.id = aac.childID and a2.id = aac.id and a2.creatorID = ${memberID} and a2.artifactTypeID = 3 group by aac.childID having count(distinct aac.id) > 1;" | sed -e 's/^| \([0-9]*\).*$/\1/' | cut -f1 | sed -e 's|$|,|' | xargs
