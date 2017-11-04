#!/bin/bash

subjectName=${1}

mydir=$(dirname ${0})
cd ${mydir}

if [ -n "${subjectName}" ]; then
    maps="${subjectName}"
else
    maps="Algebra-I|alg Arithmetic|ari Measurement|mea Biology|bio Calculus|cal Chemistry|che EarthScience|esc Geometry|geo LifeScience|lsc Physics|phy ProbStat|aps Trigonometry|tri"
    maps="Algebra_v2|alg_v2 Arithmetic_v2|ari_v2 Biology_v2|bio_v2 EarthScience_v2|esc_v2 Geometry_v2|geo_v2 Physics_v2|phy_v2 Probability_v2|prb_v2 Statistics_v2|sta_v2"
fi

[ ! -d maps ] && mkdir -p maps
cp -f mapnav.js maps/
cp -f raphael.js maps/

for map in ${maps}; do
    filename="$(echo ${map} | cut -d'|' -f1)"
    branch="$(echo ${map} | cut -d'|' -f2)"
    echo "Filename=${filename}, branch=${branch}"

    if [ -f CXL/${filename}.cxl ]; then
        echo "Running: python cxlParse.py CXL/${filename}.cxl"
        python cxlParse.py CXL/${filename}.cxl
        if [ $? -eq 0 ]; then
            echo "Generated map for ${branch}"
            cp map.htm maps/${branch}.html
            cp map.js maps/${branch}.js
            sed -e "s|map\.js|${branch}.js|" -i maps/${branch}.html
        else
            echo "Error generating map for ${branch}"
        fi
    fi
done
