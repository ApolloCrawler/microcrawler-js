#!/usr/bin/env bash

docker run -d -v /Users/tomaskorcak/dev/microcrawler/data/couchbase:/opt/couchbase/var/lib/couchbase/data -p 8091:8091 -p 8092:8092 -p 11207:11207 -p 11209:11209 -p 11210:11210 -p 11211:11211 -p 11214:11214 -p 11215:11215 -p 18091:18091 -p 18092:18092 -p 4369:4369 --name couchbase korczis/couchbase
