#!/bin/bash

redis-cli FLUSHALL
sudo /etc/init.d/redis-server restart
