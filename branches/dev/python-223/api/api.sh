#!/usr/bin/env bash

# [[file:~/prg/scm/api/TODO.org::*Flask-restless][Flask-restless:2]]

curl -v \
    -H "Content-Type: application/json" \
    -X POST \
    -d '{"mask": "/2.0/.*"}' \
    localhost/api-manager/api/path

curl -v \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"name": "Internal app", "email": "dev@ck12.org", "hash": "ck12", "paths":[{"mask":"/2.0/.*"}]}' \
    localhost/api-manager/api/application

curl -v \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"name": "iPad app", "email": "maurice@ck12.org", "hash": "5386f4d2f3008abe34221e82b3242caf3fd9695e", "paths":[{"mask":"/2.0/.*"}]}' \
    localhost/api-manager/api/application

curl -v \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"name": "Skoolpad Market place", "email": "sreedhar@skoolpad.com", "hash": "4cde5ea61a8a719d361403a1ff7427f11ebe50f3", "paths":[{"mask":"/2.0/.*"}]}' \
    localhost/api-manager/api/application

curl -v \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"name": "DTS", "email": "glennpeterm@yahoo.com", "hash": "d86ddd0b6867feab3c8156b68bd043ffbb48b6f0", "paths":[{"mask":"/2.0/.*"}]}' \
    localhost/api-manager/api/application

curl -v \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"name": "North Carolina Learning Object Repository", "email": "sweetinj@nccommunitycolleges.edu", "hash": "cdc7145542ae6232f9f6a2f50c298e13bb03b9c2", "paths":[{"mask":"/2.0/.*"}]}' \
    localhost/api-manager/api/application

curl -v \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"name": "Digital Learning Tree", "email": "glennpeterm@yahoo.com", "hash": "ef85042520c369a09234dbe4259ef18f72cee567", "paths":[{"mask":"/2.0/.*"}]}' \
    localhost/api-manager/api/application

curl -v \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"name": "BetterAt", "email": "kdenney@id.iit.edu,jeff.x.tang@gmail.com", "hash": "7854d04c0af7d5ee8a76aa58da01e0bbda529c3e", "paths":[{"mask":"/2.0/.*"}]}' \
    localhost/api-manager/api/application

curl -v \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"name": "Lesson Plan Builder", "email": "mwalker@microk12.com", "hash": "1cd717f4c484a1afdeb0f79b2c9b617b7fcd5329", "paths":[{"mask":"/2.0/.*"}]}' \
    localhost/api-manager/api/application

curl -v \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"name": "LRServer", "email": "khagel@3wedcg.com", "hash": "86262157db09ff22c378dc89c0c0b901742e64cf", "paths":[{"mask":"/2.0/.*"}]}' \
    localhost/api-manager/api/application

# Flask-restless:2 ends here
