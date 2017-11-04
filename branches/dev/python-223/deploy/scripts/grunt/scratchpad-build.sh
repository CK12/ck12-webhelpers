#!/bin/bash

# Grunt should pass this script the current media directory and the 
# newly created media build directory (timestamped build dir).
# This script will build the scratchpad files in the media dir and 
# move the entire project into the media build dir upon success. 

media_dir=$1 
media_build_dir=$2

cd "$media_dir/scratchpad"
npm install
[ ! $? -eq 0 ] && echo "ERROR" && exit;
npm install
[ ! $? -eq 0 ] && echo "ERROR" && exit;
grunt
[ ! $? -eq 0 ] && exit;
cd -
if [ ! -d "$media_build_dir/scratchpad" ]; then
    rm -rf "$media_build_dir/scratchpad"
fi
cp -r "$media_dir/scratchpad/" "$media_build_dir"

