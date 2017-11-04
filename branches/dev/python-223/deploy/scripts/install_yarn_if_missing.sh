#!/bin/bash
#===============================================================================
#
#          FILE:  install_yarn_if_missing.sh
# 
#         USAGE:  ./install_yarn_if_missing.sh 
# 
#   DESCRIPTION:  Install yarn if it's not already installed
# 
#       OPTIONS:  ---
#  REQUIREMENTS:  ---
#          BUGS:  ---
#         NOTES:  ---
#        AUTHOR:  Nac (nachiket@ck12.org), 
#       COMPANY:  CK-12 Foundation
#       VERSION:  1.0
#       CREATED:  03/03/2017 01:32:39 PM PST
#      REVISION:  ---
#===============================================================================
YARN_CMD="yarn --version &>/dev/null"
START_DIR=`pwd`
TMPDIR="/tmp/empty-yarn-directory-3338392"
mkdir $TMPDIR
cd $TMPDIR

$YARN_CMD

if [ $? -ne 0 ]; then
    echo "Yarn not found. Installing..."
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt-get update && sudo apt-get install yarn -y
fi

$YARN_CMD
if [ $? == 0 ]; then
    echo "Yarn is installed."
fi

cd $START_DIR
rm -rf $TMPDIR

