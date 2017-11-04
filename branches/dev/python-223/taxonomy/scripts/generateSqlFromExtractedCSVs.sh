#!/bin/bash

mydir=$(dirname ${0})
cd ${mydir}

for file in $(ls -1 output/*-encoded.csv); do
    subBrn=$(echo $(basename $file) | sed -e 's|^\([A-Z]*\)\.\([A-Z]*\)\..*|\1.\2|')
    echo "subBrn=${subBrn}"
    echo "Converting to concept node CSV format ..."
    rm -f fg.csv
    python convertToConceptNodeCSV.py ${file}
    if [ ! -f fg.csv ]; then
        echo "ERROR: Could not convert ${file} to concept node format"
    else
        echo "Generating SQL script from concept node CSV ..."
        rm -f conceptnodes.sql
        python generateFGSql.py "fg.csv"
        if [ ! -f conceptnodes.sql ]; then
            echo "ERROR: Could not convert to conceptnodes.sql"
        else
            cp -vf conceptnodes.sql ../mysql/conceptnodes/${subBrn}.sql
        fi
    fi
done
