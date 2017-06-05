'use strict'

const path = require('path')
const server = require('pflr-express-kit')
const router = require('express').Router()

const { ENV } = require('pflr-express-kit/lib/constants')

const flags = require(path.join(__dirname, '../metadata/flags.json'))
const indexJson = require(path.join(__dirname, '../metadata/blocks/en/route:summary.json'))
const unavailableJson = require(path.join(__dirname, '../metadata/blocks/en/route:notavailable.json'))

const validateHealthcheck = html => {
  const indexMatch = new RegExp(`<h1[^>]*>${indexJson.heading}</h1>`)
  return !!html.match(indexMatch)
}

// Shut out users who have not come via private beta
const screenUsers = (ENV) => {
  if (ENV === 'prod' || ENV === 'staging' || ENV === 'private-beta') {
    const disqualifiedUser = (req, code = 403) => {
      req.disqualified = true
      throw new Error(code)
    }
    router.get('/sorry', req => disqualifiedUser(req, 401))
    router.get('/revisit', (req, res) => {
      if (!req.cookies || !req.cookies.surveyData) {
        const surveyCookie = {
          campaignName: 'private-beta-cla',
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
    const allowedRegex = /\.[^.]{2,3}(\?[^?]+){0,1}$/
    router.use((req, res, next) => {
      if (req.connection.remoteAddress.includes('127.0.0.1')) {
        return next()
      }
      if (!req.url.match(allowedRegex)) {
        if (!req.cookies || !req.cookies.surveyData) {
          let referrer = req.query.referrer
          let uuid = req.query.uuid
          if (!referrer || !referrer.includes('private-beta-cla') || !uuid) {
            disqualifiedUser(req)
          } else {
            res.cookie('surveyData', JSON.stringify({
              campaignName: 'private-beta-cla',
              uuid
            }))
            if (req.url.includes('/landing')) {
              res.redirect('/accepted')
              return
            }
          }
        }
      }
      return next()
    })
  }

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
if (flags.unavailable && ENV !== 'testing') {
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
