FROM node:6.10.2-onbuild

# Install Redis
RUN apt-get update && apt-get -y install redis-server

# Create app directory
RUN mkdir -p /usr/src/humix
WORKDIR /usr/src/humix

# Install app dependencies
#COPY package.json /usr/src/humix/

# Bundle app source
COPY . /usr/src/humix
RUN npm install

RUN mkdir /data && chown redis:redis /data
VOLUME /data

EXPOSE 3000 
CMD [ "./bin/start.sh" ]
