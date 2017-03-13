# PFLR CAIT

Private Family Law - Child Arrangements Information Tool

## PRIVATE REPO

**This repo is private until the service reaches public beta.**

The service will not go into public beta until there is confidence that the guidance/information contained in the service is accurate.

That confidence is dependent upon sign off by Policy and Legal (and confirmation that the service is not at odds with any ministerial steer).

## Deploying

Please see the [PFLR Cait entry in the MoJ Ops Manual](https://opsmanual.dsd.io/run_books/pflr-cait.html)

The corresponding repo holding environment variables for deployment is [pflr-cait-deploy](https://github.com/ministryofjustice/pflr-cait-deploy)

## Pre-requisites

  [Node 7.7.1](https://nodejs.org)

  [Yarn 0.21.3](https://yarnpkg.com)

## Optional

  [Docker](https://www.docker.com)

## Installing

Clone the repo

    git clone git@github.com:ministryofjustice/pflr-cait.git

Install node module dependencies

    yarn install

Build the app

    yarn build

## Running

    yarn start

By default the app runs on port 3000, so the app will be available at:

    http://localhost:3000
  
## Developing

### Installing new modules

Use `yarn add <new_module>` rather than `npm install <new_module>`

Similarly, use `yarn remove <old_module>` rather than just deleting it from `package.json`

If you do add or remove a module, please run the dockerised tests to confirm that everything is as it should be - though you'll find out soon enough when Jenkins tries to build it…

The application architecture is as follows:

### Deployment artifacts

- `Dockerfile`

  provides the details to build the image that is used for running the app and tests against it

### Backend

- `scripts`

  Start up scripts

  Entry point to the app is `scripts/server.js`

- `lib`

  Application modules

- `views`

  Application templates (written in [EJS](http://ejs.co))

### Frontend

Resources in `src` are for use by the client and copied/processed by relevant parts of the `yarn build` scripts.

- JS

  `src/scripts`

  Transpiled using [Babel](https://babeljs.io) and output to `dist/static/scripts`

  Config provided by `.babelrc` (using es2015 preset)

- CSS

  `src/styles`

  Processed with [Stylus](http://stylus-lang.com) and output to `dist/static/styles`

- Other

  `robots.txt`

  copied to `dist`

  `src/fonts`

  `src/images`
  
  copied to `dist/static`

### Githooks

Installing the project's node modules also sets the repo's `hooksPath` to `.githooks`.

`.githooks` provides:

- `pre-commit`

  ensures that all necessary files are linted and tested

  (NB. can be skipped by passing `--no-verify` flag)

Git hooks can be disabled

    yarn githooksUnset

and reenabled

    yarn githooks

See [Git manual](https://git-scm.com/docs/githooks) for more info on git hooks

## Testing

    yarn test

Lints and runs both unit and functional tests (see below for details)

    yarn test:docker

Runs all the tests in docker containers

### Unit tests

    yarn test:unit

Unit tests are run before every commit (see `.githooks/pre-commit`)

[AVA](https://github.com/avajs/ava) is used as the test runner

The unit tests live next to the file/module they are for

They have the extension `.unit.spec.js`

The tests can also be run in a docker container as they are as part of the Jenkins build

    yarn test:unit:docker

### Functional tests (end-to-end)

    yarn test:functional

The tests expect a Selenium instance to be running. The following script is provided for convenience, but any Selenium instance will do.

    yarn docker:selenium

[CodeceptJS](http://codecept.io) is used as the end-to-end test framework

[WebdriverIO](http://webdriver.io/) is used as the backend driver

The CodeceptJS configuration file is `codecept.conf.js`


The functional tests live in `spec/functional/`

and have the extension `.functional.spec.js`

A `.wallaby.conf.js` file is provided if you use [Wallaby.js](https://wallabyjs.com/) for continuous testing in your editor

The tests can also be run in a docker container as they are as part of the Jenkins build

    yarn test:functional:docker

NB. this starts up a selenium container of its own automatically

## Linting

    yarn lint

Runs `eslint` and `jsonlint` over various locations

Linting is performed before any commit (see `.githooks/pre-commit`)

### ESLint

`.eslintrc.js` is the main configuration file

The following locations are linted:

- `scripts/**/*.js`, `lib/**/*.js`

  application files
- `src/scripts/**/*.js`

  client-side js

  config extended by `src/scripts/.eslintrc.js`

- `spec/**/*.js`

  tests that don't sit next to the file they are testing, eg. functional tests

  config extended by `spec/.eslintrc.js`

### JSONLint

The following locations are linted:

- `data/**/*.json`

  application json
