#!/bin/bash

# Build roster app
# npm install roster should use node v6.3.1
# wepback build
# wget -qO- https://raw.githubusercontent.com/xtuple/nvm/master/install.sh | sudo bash
media_dir=$1

cd "$media_dir/roster"
npm set registry http://qarel3.ck12.org/sinopia
npm install
[ ! $? -eq 0 ] && echo "ERROR" && exit;
npm install
[ ! $? -eq 0 ] && echo "ERROR" && exit;
npm run webpack -- --bail
