#!/bin/bash

# Build lmsbridge
# wepback build using npm script build-prod
media_dir=$1
media_build_dir=$2

cd "$media_dir/lmsbridge"
npm set registry http://qarel3.ck12.org/sinopia
npm install
[ ! $? -eq 0 ] && echo "ERROR" && exit;
npm install
[ ! $? -eq 0 ] && echo "ERROR" && exit;
npm run build-prod
