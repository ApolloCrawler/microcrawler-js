#!/usr/bin/env sh

docker run -d --hostname kibana -e KIBANA_SECURE=false --link elasticsearch:elasticsearch -p 5601:5601 --name kibana kibana
