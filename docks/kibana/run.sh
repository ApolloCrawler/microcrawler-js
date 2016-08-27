#! /usr/bin/env bash

docker run -e KIBANA_SECURE=false --link elasticsearch:elasticsearch -p 5601:5601 --name kibana -d kibana
