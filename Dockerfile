FROM node:8.4.0

# Install yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 0.27.5
RUN ln -sf /root/.yarn/bin/yarn /usr/local/bin/yarn

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

ENV PATH=/usr/app/node_modules/.bin:$PATH

# Install node modules
COPY package.json yarn.lock ./
RUN yarn install --ignore-scripts --ignore-optional

COPY app ./app
COPY lib ./lib
COPY public ./public

RUN yarn build

COPY metadata ./metadata

EXPOSE 3000
ENTRYPOINT ["yarn", "start"]
