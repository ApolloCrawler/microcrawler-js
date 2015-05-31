#! /usr/bin/env bash

docker run -d -p 5601:5601 -e KIBANA_SECURE=false --link elasticsearch:es --name kibana korczis/docker-kibana
