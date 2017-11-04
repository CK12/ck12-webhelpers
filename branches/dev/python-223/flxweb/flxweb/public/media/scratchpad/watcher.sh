#!/bin/bash

while [[ `inotifywait -r -e modify ./js ./css` ]] ; do
  grunt
done
