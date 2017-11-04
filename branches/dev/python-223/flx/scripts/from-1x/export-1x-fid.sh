#! /bin/bash

id=$1
#wget http://code.ck12.org/rpc/ck12/flexbook?fid=${id}&images=true
wget http://omega.ck12.org/ck12/flexbook?fid=${id}\&images=true
mv flexbook?fid=${id}\&images=true ${id}.zip
