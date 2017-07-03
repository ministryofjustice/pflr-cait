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
  // private beta email
  router.get('/revisit', (req, res) => {
    if (!req.cookies || !req.cookies.surveyData) {
      const surveyCookie = {
        campaignName: 'private-beta-cla',
        referrer: 'cla',
        uuid: req.query.uuid,
        visited: {}
      }
      for (var q in req.query) {
        if (q !== 'uuid') {
          surveyCookie.visited[q] = true
        }
      }
      res.cookie('surveyData', JSON.stringify(surveyCookie))
    }
    res.redirect('/')
  })

  // generic handling
  const allowedRegex = /\.[^.]{2,3}(\?[^?]+){0,1}$/
  router.use((req, res, next) => {
    if (req.connection.remoteAddress.includes('127.0.0.1')) {
      return next()
    }
    if (!req.url.match(allowedRegex)) {
      let campaignName
      let landing
      if (req.url.includes('/landing/')) {
        landing = true
        campaignName = req.url.replace(/.*\/landing\//, '').replace(/\?.*/, '')
      }
      if (!req.cookies || !req.cookies.surveyData) {
        let surveyData = Object.assign({}, req.query)
        let referrer = req.query.referrer || req.get('Referrer') || 'NULL'
        surveyData.referrer = referrer
        let uuid = req.query.uuid || uuidv4()
        surveyData.uuid = uuid
        if (campaignName) {
          surveyData.campaignName = campaignName
        }
        res.cookie('surveyData', JSON.stringify(surveyData))
      }
      if (landing) {
        res.redirect('/')
        return
      }
    }
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
    validateHealthcheck,
    screenUsers,
    basicAuth
  }, switchOffOptions, options)
  server.start(soptions)
}

module.exports = {
  start
}
