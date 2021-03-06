FROM node:8.9.0
# TODO use alpine image. need to update to use apk instead of apt-get
# FROM mhart/alpine-node:4.6
MAINTAINER Joe Nudell <joenudell@gmail.com>

# Set up yarnpkg repo
RUN apt-get update && \
    apt-get install -y --no-install-recommends apt-utils && \
    apt-get install -y --no-install-recommends apt-transport-https && \
    apt-get install -y --no-install-recommends locales
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && \
    apt-get install -y --no-install-recommends yarn
RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
RUN locale-gen en_US.UTF-8 && dpkg-reconfigure locales

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV LC_CTYPE en_US.UTF-8



# Set up cached dependencies
RUN mkdir -p /tmp/npm-cache && \
    mkdir -p /var/www/noodlespizza
RUN chown -R www-data:www-data /var/www/noodlespizza

# Install dependencies
WORKDIR /tmp/npm-cache
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install


# Copy built app
WORKDIR /var/www/noodlespizza
COPY ./src /var/www/noodlespizza/src
#COPY ./assets /var/www/noodlespizza/assets
#RUN ln -s /tmp/npm-cache/node_modules ./
RUN cp -r /tmp/npm-cache/node_modules ./node_modules
RUN ln -s /tmp/npm-cache/package.json .

# Build
RUN npm run build


# Default Command
CMD [ "node", "dist/server.js" ]
EXPOSE 3030
