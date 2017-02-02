FROM node:boron

# Install yarn
RUN apt-get update
RUN apt-get --assume-yes install apt-transport-https
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get --assume-yes install yarn

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
# TODO - only copy package.json yarn.lock gulpfile.babel.js now and bundle app files later

RUN yarn install

# Bundle app source
# COPY . /usr/src/app

EXPOSE 3000
CMD [ "node", "server.js" ]