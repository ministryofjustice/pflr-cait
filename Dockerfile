FROM node:boron

# Install yarn
RUN apt-get update
RUN apt-get --assume-yes install apt-transport-https
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get --assume-yes install yarn

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install node modules
COPY package.json yarn.lock /usr/app/
RUN yarn install --ignore-scripts --ignore-optional

# Copy config files
COPY .babelrc .eslintrc.js /usr/app/

# Copy app
COPY lib /usr/app/lib
COPY scripts /usr/app/scripts

# Build static files
COPY src /usr/app/src
RUN npm run build

EXPOSE 3000
CMD [ "node", "scripts/server.js" ]