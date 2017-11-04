#!/bin/bash

# Build college flexbooks app
# wepback build
# wget -qO- https://raw.githubusercontent.com/xtuple/nvm/master/install.sh | sudo bash
media_dir=$1

cd "$media_dir/college-flexbooks"
npm set registry http://qarel3.ck12.org/sinopia
npm install
[ ! $? -eq 0 ] && echo "ERROR" && exit;

npm run build

