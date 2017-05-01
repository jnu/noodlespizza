#!/bin/bash -eux

# Set up and run a noodlespizza box. Idempotent; if the machine is already set
# up this will just ensure that the latest version is running, without
# destroying existing data.


#
# CouchDB
#

# Set up database if it's not already running.
if [ ! "$(sudo docker ps | grep db)" ]; then
    sudo docker pull klaemo/couchdb:1.6.1

    # Delete image if it exists but isn't running.
    if [ "$(sudo docker ps -a | grep db)" ]; then
        sudo docker rm db
    fi

    sudo docker run -d \
                    -p 5984:5984 \
                    -v /data/var/lib/couchdb:/usr/local/var/lib/couchdb \
                    --name db klaemo/couchdb:1.6.1
fi


#
# Redis
#

# Set up container if it's not already running.
if [ ! "$(sudo docker ps | grep redis)" ]; then
    sudo docker pull redis:alpine

    # Delete image if it exists but isn't running.
    if [ "$(sudo docker ps -a | grep redis)" ]; then
        sudo docker rm redis
    fi

    sudo docker run --name redis -d redis:alpine redis-server --appendonly yes
fi


#
# Noodles pizza NodeJS server
#

# Always update the server; presumably if you're deploying it, it's changed

sudo docker pull joen/noodlespizza:prod

[ "$(sudo docker ps | grep pizza)" ] && sudo docker kill pizza
[ "$(sudo docker ps -a | grep pizza)" ] && sudo docker rm pizza

sudo docker run -d \
                -p 3030:3030 \
                --link db:db \
                --link redis:redis \
                --name pizza \
                -v /home/ec2-user/secrets:/etc/secrets \
                -v /var/www/noodlespizza \
                joen/noodlespizza:prod \
                node dist/server.js -s /etc/secrets/secrets.json -h http://noodles.pizza


#
# NginX
#

# Always update nginx to ensure it's linked with the new server.

sudo docker pull nginx:1.13.0

[ "$(sudo docker ps | grep nginx)" ] && sudo docker kill nginx
[ "$(sudo docker ps -a | grep nginx)" ] && sudo docker rm nginx

# Create & run new container. Mount nginx configs from host, and data volumes
# from the pizza machine (so nginx can take on some serving duty if desired).
sudo docker run -d \
                -p 80:80 \
                -p 443:443 \
                --link pizza:pizza \
                -v /home/ec2-user/nginx/noodlespizza.conf:/etc/nginx/conf.d/default.conf:ro \
                -v /home/ec2-user/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
                --volumes-from pizza \
                --name nginx nginx:1.13.0
