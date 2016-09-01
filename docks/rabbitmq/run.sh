#!/usr/bin/env sh

docker run -d --hostname rabbitmq -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:3-management
