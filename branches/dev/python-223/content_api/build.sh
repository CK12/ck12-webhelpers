#!/bin/bash

NODE_VERSION="$(node --version | sed -e 's|^v||')"
if [ "${NODE_VERSION##6.}" != "${NODE_VERSION}" ]; then
    sudo npm install -g gyp
    sudo npm install -g bower
    sudo npm install -g gulp
    sudo npm install
    bower install --allow-root
    gulp build --version=0.0.1
else
    echo "Need node v6 or newer to build content_api. Found node v${NODE_VERSION}"
    exit 0
fi

