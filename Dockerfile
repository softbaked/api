FROM node:8-alpine
MAINTAINER Kam Low <hello@sourcey.com>

USER 0
WORKDIR /opt

RUN apt-get update && apt-get install python
RUN apk add --no-cache --virtual .gyp python3 make g++

RUN apk add --no-cache \
  nodejs nodejs-npm g++ \
  python python-dev

RUN npm install --unsafe-perm -g spectacle-docs
