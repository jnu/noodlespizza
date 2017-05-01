#!/bin/bash -eux

docker build -t joen/noodlespizza:prod ./

docker push joen/noodlespizza:prod

rsync -r ./nginx noodles:~/
if [ "${1:-}" == "--secrets" ]; then
    ./tools/sync_secrets.sh
fi

ssh noodles 'bash -s' < ./tools/remote_deploy.sh
