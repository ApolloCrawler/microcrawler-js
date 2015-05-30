#! /usr/bin/env bash

docker run -d -p 80:80 -p 5601:5601 -e KIBANA_SECURE=false --link elasticsearch:es --name kibana korczis/docker-kibana
