#!/bin/bash -x

mydir="$(dirname ${0})"
mongo cache ${1} ${mydir}/clear_cache.js
mongo cache ${1} ${mydir}/cache_schema.js

