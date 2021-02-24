'use strict'

const path = require('path')
const server = require('pflr-express-kit')
const router = require('express').Router()
const uuidv4 = require('uuid/v4')

const { ENV } = require('pflr-express-kit/lib/constants')

const flags = require(path.join(__dirname, '../metadata/flags.json'))
const indexJson = require(path.join(__dirname, '../metadata/blocks/en/route:summary.json'))
let unavailableJson = {}
if (flags.unavailable) {
  unavailableJson = require(path.join(__dirname, `../metadata/blocks/en/${flags.unavailableId}.json`))
}

// Stop some assets we don't even use from raising 404 (bots/crawlers)
// The few icons we use are SVG and will bypass this
router.get(/\/images\/icon-.*\.png$/, (req, res) => {
  return res.status(200).send()
})

const validateHealthcheck = html => {
  const indexMatch = new RegExp(`<h1[^>]*>${indexJson.heading}</h1>`)
  return !!html.match(indexMatch)
}

const disqualifiedUser = (req, code = 403) => {
  req.disqualified = true
  throw new Error(code)
}

// Record where users have come from and assign uuid
const screenUsers = (ENV) => {
  // normalize cookie name
  router.use((req, res, next) => {
    if (req.cookies && req.cookies.surveyData && !req.cookies.analytics) {
      req.cookies.analytics = req.cookies.surveyData
      res.cookie('analytics', req.cookies.surveyData)
    }
    next()
  })
  // private beta email
  router.get('/revisit', (req, res) => {
    if (!req.cookies || !req.cookies.analytics) {
      const analyticsCookie = {
        campaignName: 'private-beta-cla',
        referrer: 'cla',
        uuid: req.query.uuid,
        visited: {}
      }
      for (var q in req.query) {
        if (q !== 'uuid') {
          analyticsCookie.visited[q] = true
        }
      }
      res.cookie('analytics', JSON.stringify(analyticsCookie))
    }
    res.redirect('/')
  })

  // generic handling
  const allowedRegex = /\.[^.]{2,3}(\?[^?]+){0,1}$/
  router.use((req, res, next) => {
    // Avoid double slashes by merging 2 or more into one, before continuing
    // with the following rules. This mitigates a redirection vulnerability.
    // Examples:
    //   service.com//google.co.uk/ -> service.com/google.co.uk/
    //   service.com/a//b/c///d/ -> service.com/a/b/c/d/
    //
    req.url = req.url.replace(/\/+/g, '/')

    if (req.connection.remoteAddress.includes('127.0.0.1')) {
      return next()
    }

    // redirect staging to new k8s cluster
    if (req.get('Host').includes('cait-staging.herokuapp.com')) {
      return res.redirect(301, 'https://fj-cait-staging.apps.live-1.cloud-platform.service.justice.gov.uk')
    }

    if (!req.url.match(allowedRegex)) {
      let campaignName
      let landing
      if (req.url.includes('/landing/')) {
        landing = true
        campaignName = req.url.replace(/.*\/landing\//, '').replace(/\?.*/, '')
      }
      if (!req.cookies || !req.cookies.analytics) {
        let analytics = Object.assign({}, req.query)
        let referrer = req.query.referrer || req.get('Referrer') || 'NULL'
        analytics.referrer = referrer
        let uuid = req.query.uuid || uuidv4()
        analytics.uuid = uuid
        if (campaignName) {
          analytics.campaignName = campaignName
        }
        res.cookie('analytics', JSON.stringify(analytics))
      }
      if (landing) {
        res.redirect('/')
        return
      }
    }
    req.url = req.url.replace(/\?.*/, '')
    req.originalUrl = req.url
    return next()
  })

  return router
}


// Block all pages
const postStaticRoutes = () => {
  return (req, res, next) => {
    if (req.url !== unavailableJson.url) {
      res.redirect(unavailableJson.url)
    } else {
      req.disqualified = true
      next()
    }
    //// Alternative method
    // req.disqualified = true
    // res.setHeader('Retry-After', 3600)
    // errorHandler.render(req, res, 503)
  }
}

let switchOffOptions = {}
if (unavailableJson.url && ENV !== 'testing') {
  switchOffOptions = {
    postStaticRoutes,
    fakeHealthcheck: true
  }
}

const { CAIT_USERNAME, CAIT_PASSWORD } = process.env
const basicAuth = {
  username: CAIT_USERNAME,
  password: CAIT_PASSWORD
}

const start = (options = {}) => {
  const soptions = Object.assign({}, {
    robots: {},
    validateHealthcheck,
    screenUsers,
    basicAuth
  }, switchOffOptions, options)
  server.start(soptions)
}

module.exports = {
  start
}
