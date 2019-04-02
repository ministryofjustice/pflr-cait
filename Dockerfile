FROM node:10.15.2

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV PATH=/usr/src/app/node_modules/.bin:$PATH

# Install node modules
COPY package.json yarn.lock ./
RUN yarn install --ignore-scripts --ignore-optional

COPY app ./app
COPY lib ./lib

RUN yarn build

COPY metadata ./metadata

# Add application user
ENV APPUSER moj
ENV APPUID 1001

RUN adduser $APPUSER --disabled-password --gecos "" -u $APPUID \
    && chown -R $APPUSER:$APPUSER ./public

ARG APP_BUILD_DATE
ENV APP_BUILD_DATE ${APP_BUILD_DATE}

ARG APP_BUILD_TAG
ENV APP_BUILD_TAG ${APP_BUILD_TAG}

ARG APP_GIT_COMMIT
ENV APP_GIT_COMMIT ${APP_GIT_COMMIT}

ARG APP_VERSION
ENV APP_VERSION ${APP_VERSION}

USER $APPUID

EXPOSE 3000
ENTRYPOINT ["yarn", "start"]
