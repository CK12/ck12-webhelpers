#! /bin/bash

BZR_HOME=${BZR_HOME:-/opt/data/bzr}
export_dir="/tmp/flx2export"

function exportBazaarData() {
    bzr_parent=`dirname ${BZR_HOME}`
    cd ${bzr_parent}
    echo "Exporting Bazaar data from ${BZR_HOME} to ${export_dir}"
    bzr fast-export --no-plain bzr ${export_dir}/export.fi
}

exportBazaarData
