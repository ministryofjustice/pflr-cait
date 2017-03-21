FROM node:7.7.1

# Install jq
RUN apt-get update
RUN apt-get install jq

# Install phantomjs
RUN wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2
RUN tar -xjvf phantomjs-2.1.1-linux-x86_64.tar.bz2
RUN ln -s /phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs


# Install yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 0.21.3
RUN ln -sf /root/.yarn/bin/yarn /usr/local/bin/yarn

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app
ENV PATH=/usr/app/node_modules/.bin:$PATH

# Install node modules
COPY package.json yarn.lock ./
RUN yarn install --ignore-scripts --ignore-optional

# Copy config files
COPY .babelrc .eslintrc.js ./

# Copy standalone test files
COPY codecept.conf.js ./
COPY spec ./spec

# Copy app
COPY lib ./lib
COPY scripts ./scripts

# Build static files
COPY src ./src
RUN yarn run build

# Copy data
COPY data ./data

EXPOSE 3000
CMD [ "node", "scripts/server.js" ]