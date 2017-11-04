#!/bin/bash

## Usage ./clear_bt_cache.sh "<mongo connection parameter>"

echo "db.FlxForever.remove({'_id.key': { '$regex': /c-bt/ }})" > /tmp/bt_cache_removal_$$.js
cat /tmp/bt_cache_removal_$$.js
mongo cache "${1}" /tmp/bt_cache_removal_$$.js
rm -f /tmp/bt_cache_removal_$$.js
