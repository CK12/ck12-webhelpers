#!/bin/bash

mydir="$(dirname ${0})"
if [ ! -f "${mydir}/IPV6-COUNTRY-REGION-CITY-LATITUDE-LONGITUDE-ZIPCODE-ISP-DOMAIN.BIN" ]; then
    curl -o "${mydir}/IPV6-COUNTRY-REGION-CITY-LATITUDE-LONGITUDE-ZIPCODE-ISP-DOMAIN.BIN" "https://s3.amazonaws.com/ip2location.ck12.org/IPV6-COUNTRY-REGION-CITY-LATITUDE-LONGITUDE-ZIPCODE-ISP-DOMAIN.BIN"
    chmod a+x "${mydir}/IPV6-COUNTRY-REGION-CITY-LATITUDE-LONGITUDE-ZIPCODE-ISP-DOMAIN.BIN"
else
    echo "File already exists."
fi
