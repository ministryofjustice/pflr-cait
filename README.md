# PFLR CAIT

[![repo standards badge](https://img.shields.io/badge/dynamic/json?color=blue&style=for-the-badge&logo=github&label=MoJ%20Compliant&query=%24.data%5B%3F%28%40.name%20%3D%3D%20%22pflr-cait%22%29%5D.status&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fgithub_repositories)](https://operations-engineering-reports.cloud-platform.service.justice.gov.uk/github_repositories#pflr-cait "Link to report")

[![CI and CD](https://github.com/ministryofjustice/pflr-cait/actions/workflows/test-build-deploy.yml/badge.svg)](https://github.com/ministryofjustice/pflr-cait/actions/workflows/test-build-deploy.yml)

Private Family Law - Child Arrangements Information Tool

## Pre-requisites

```
brew install nvm
nvm install 12.22.6
```

  [Node Version Manager](https://github.com/nvm-sh/nvm)

  [Node 12.22.6](https://nodejs.org)

  [Yarn >= 1.12](https://yarnpkg.com)

## Optional

  [Docker](https://www.docker.com)

  (Required if running a11y checks and/or pushing code to the repo - see `.githooks/pre-push`)

## Installing

Clone the repo

    git clone git@github.com:ministryofjustice/pflr-cait.git

Install node module dependencies

    yarn install

## Running

    yarn start

By default the app runs on port 3000, so the app will be available at:

    http://localhost:3000

## Developing

### Running in dev mode

    yarn dev:start

### Installing new modules

Use `yarn add <new_module>` rather than `npm install <new_module>`

Similarly, use `yarn remove <old_module>` rather than just deleting it from `package.json`

If you do add or remove a module, please run the dockerised prepush tests to confirm that everything is as it should be - though you'll find out soon enough when Jenkins tries to build it…

## Application architecture

- `.githooks/`

  Scripts that run before commits and pushes

- `app/`

  - `assets/`

    - `images/`

    - `javascripts/`

    - `stylesheets/`

    Static files

  - `components/`

    Bundles comprising component templates, code, styling and tests

  - `css/`

    Entrypoint for compiling CSS files

  - `templates/`

    Bundles comprising page templates, code, styling and tests

- `ci/`

  Scripts for continuous integration

- `lib/`

  Application modules

- `metadata/`

  JSON files

- `spec`

  Miscellaneous tests (ie. ones that do not reside in the same directory as the code they’re testing)

- `Dockerfile`

  provides the details to build the image that is used for running the app and tests against it

- `start.js`

  Entry point to the application


### Auto-generated directories

The following locations are created and are ignored by git

- `public/`

  Built assets

- `reports/`

  Output of tests


## Transpilation

<!--
- JS

  Transpiled using [Babel](https://babeljs.io) and output to `public/javasscripts`
-->

### CSS

Processed with [PostCSS](http://postcss.org/) using the [CSSNext plugin](http://cssnext.io/) and output to `public/stylesheets/`

The following paths are passed to PostCSS:

  - `app/css/`

  - `app/templates/`

  - `app/components/`

  - `app/assets/stylesheets/`

Files found in `app/css/` are used as entry points


## Githooks

Installing the project's node modules also sets the repo's `hooksPath` to `.githooks`.

`.githooks` provides:

- `pre-commit`

    - ensures that all necessary files are linted and tested

    - ensures that commits are not made to the main branch

  NB. can be skipped by passing `--no-verify` flag

- `pre-push`

    - ensures all unit, functional and a11y tests are run

  NB. can be skipped by setting `SKIP_PRE_PUSH_CAIT` environment variable to `true`

  eg. `env SKIP_PRE_PUSH_CAIT=true git push`

### Disabling githooks

Git hooks can be disabled

    yarn githooks:unset

and reenabled

    yarn githooks

See [Git manual](https://git-scm.com/docs/githooks) for more info on git hooks


## Testing

### Unit tests

    yarn test:unit

Unit tests are run before every commit (see `.githooks/pre-commit`), every push (see `.githooks/pre-push`) and as part of every build

[AVA](https://github.com/avajs/ava) is used as the test runner

The unit tests live next to the file/module they are for

They have the extension `.unit.spec.js`

To run the tests in a docker container as they would be in during CI

    yarn test:unit:prepush

### Functional tests (end-to-end)

    yarn test:functional

Functional tests are run before every push (see `.githooks/pre-push`) and as part of every Jenkins build

[CodeceptJS](http://codecept.io) is used as the end-to-end test framework

[WebdriverIO](http://webdriver.io/) is used as the backend driver

The CodeceptJS configuration file is `codecept.conf.js`


The functional tests live in `spec/functional/`

and have the extension `.functional.spec.js`

A `.wallaby.conf.js` file is provided if you use [Wallaby.js](https://wallabyjs.com/) for continuous testing in your editor

To run the tests in a docker container as they would be in during CI

    yarn test:functional:prepush

NB. this starts up a selenium container of its own automatically

### A11Y checks (accessibility)

    yarn test:a11y

Accessibility checks are run every push (see `.githooks/pre-push`)

[pa11y-crawl](https://github.com/18F/pa11y-crawl) is used as the accessibility checking tool

The checks are performed using a docker container and the resulting report is output to `reposts/a11y.json`


### Run all the tests

    yarn test

Lints and runs both unit and functional tests

    yarn test:prepush

Runs all the tests plus a11y checks in the same context as used in CI (as used by `pre-push` githook)

## Linting

    yarn lint

Runs `eslint` and `jsonlint` over various locations

Linting is performed before any commit (see `.githooks/pre-commit`)

### Javascript linting

JS files are linted with [ESLint](http://eslint.org/) using the configuration file from `pflr-express-kit`

The following locations are linted:

- `lib/**/*.js`

  application files

- `app/**/*.js`

  client-side js

- `spec/**/*.js`

  tests that don't sit next to the file they are testing, eg. functional tests

### CSS linting

CSS files are linted with [stylelint](https://stylelint.io)

The following locations are linted:

- `app/**/*.pcss`

  CSS files written to be compiled using CSSNext

- `app/**/*.css`

  Any other CSS files

### Template linting

The following location are checked to ensure the Nunjucks templates located there are syntactically valid

- `app/**/*.njk`

- `app/**/*.html`

### JSON linting

The following locations are linted:

- `metadata/blocks**/*.json`

  application json for routes and content

- `metadata/*.json`

  auxilliary json files

## Deploy to kubernetes cloud platform

Refer to the [deploy repository](https://github.com/ministryofjustice/fj-cait-deploy)

## Ops Manual (deprecated)

There is a [PFLR Cait entry in the MoJ Ops Manual](https://opsmanual.dsd.io/run_books/pflr_cait.html)

Please note the ops manual has some references to the old template deploy.  
This has now been replaced with kubernetes (see above), but other than that, the ops manual is accurate and the service has not changed its architecture or code base.
