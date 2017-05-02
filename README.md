noodles.pizza
===

Digital pizza


# Development

## Requirements

Install the following:

* yarnpkg: https://github.com/yarnpkg
* Docker: https://www.docker.com/


## Workflow

The first time you set up your environment you'll need to pull and configure
some docker images.


### One-time setup:

On a mac you'll need to start the docker machine first. Note Docker may require sudo.

```
$ docker-machine start
$ eval $(docker-machine env)
```

*CouchDB*

This will set up a CouchDB instance and an admin user `noodlespizza` with the password `password`.

```
docker pull klaemo/couchdb:1.6.1
docker run -d -p 5984:5984 --name db klaemo/couchdb:1.6.1
DOCKERIP=$([ docker-machine ] && $(echo docker-machine ip) || localhost)
curl -X PUT $DOCKERIP:5984/_config/admins/noodlespizza -d '"password"'
```

*Redis*

This will set up a Redis instance.
```
docker pull redis:alpine
docker run --name redis -d redis:alpine redis-server --appendonly yes
```

### After initial setup:

After CouchDB and Redis images have been setup, just make sure they're running
when you need to develop with them.

```
docker start db
docker start redis
```

### Start a live reload server:

To work on the app itself:

```
# cd /path/to/noodlespizza
yarn install
npm start
```

Now the app is available at `localhost:3030`. This should instrument the
databases as necessary; it will complain loudly if it can't.


# Deployment

## Requirements

A remote machine that you're provisioning will need the following:

* Docker: https://www.docker.com/
* ssh access to prod host


## Deploying

The following script assumes the working directory is `/home/ec2-user`. Adjust
as necessary.

```
# cd /path/to/noodlespizza
./tools/deploy.sh
```

Right now we assume everything runs on a single node. Adjust the deployment
script as necessary to use multiple nodes.


### Secrets

To sync prod secrets, run the deploy script with the `--secrets` flag.
This assumes you have the secrets on your local machine.

```
# cd /path/to/noodlespizza
./tools/deploy.sh --secrets
```

SSL is set up separately through `letsencrypt`. Follow those instructions and
ensure that secrets are mounted correctly when the `nginx` container runs in the
deploy script.
