#!/usr/bin/env sh

docker run -d --hostname elasticsearch -p 9200:9200 -p 9300:9300 -v $HOME/dev/microcrawler/data/elasticsearch:/usr/share/elasticsearch/data --name elasticsearch elasticsearch
