#! /usr/bin/env bash

docker run -d -p 9200:9200 -p 9300:9300 -v $HOME/dev/microcrawler/data/elasticsearch:/usr/share/elasticsearch/data --name elasticsearch elasticsearch
