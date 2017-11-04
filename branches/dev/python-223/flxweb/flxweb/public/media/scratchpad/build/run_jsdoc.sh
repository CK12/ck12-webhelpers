#!/bin/bash

ROOT_DIR=$(pwd)
MEDIA_PATH="$ROOT_DIR/../.."
PROJECT_DIR="$MEDIA_PATH/scratchpad/"
README="$PROJECT_DIR/README.md"
JS_FILES=""
OUTPUT="$PROJECT_DIR/scratchpad_docs" #note: 'console' directs output to stdout


JS_FILES=$(find $PROJECT_DIR/js -name *.js)
JSDOC_FLAGS="--private"
jsdoc $JS_FILES $README -d $OUTPUT $JSDOC_FLAGS
