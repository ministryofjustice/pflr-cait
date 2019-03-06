FROM node:10.15.2

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

ENV PATH=/usr/app/node_modules/.bin:$PATH

# Install node modules
COPY package.json yarn.lock ./
RUN yarn install --ignore-scripts --ignore-optional

COPY app ./app
COPY lib ./lib

RUN yarn build

COPY metadata ./metadata

ARG APP_BUILD_DATE
ENV APP_BUILD_DATE ${APP_BUILD_DATE}

ARG APP_BUILD_TAG
ENV APP_BUILD_TAG ${APP_BUILD_TAG}

ARG APP_GIT_COMMIT
ENV APP_GIT_COMMIT ${APP_GIT_COMMIT}

ARG APP_VERSION
ENV APP_VERSION ${APP_VERSION}

EXPOSE 3000
ENTRYPOINT ["yarn", "start"]
