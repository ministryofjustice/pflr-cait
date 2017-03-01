const express = require('express')
const router = express.Router()
const index = require('../src/json/index.json')
const pages = require('../src/json/pages.json')
const basicAuth = require('basic-auth')
// const fs = require('fs')
// const path = require('path')

const logger = require('./logger')

const { CAIT_USERNAME, CAIT_PASSWORD, GA_TRACKING_ID, ENV } = process.env

logger('Loading routes - environment:', ENV || 'not set')

// Authenticator
const auth = (req, res, next) => {
  if (!CAIT_USERNAME) {
    return next()
  }
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  if (ip.includes('127.0.0.1')) {
    return next()
  }
  function unauthorized (res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required')
    return res.send(401)
  }

  const user = basicAuth(req)

  if (!user || !user.name || !user.pass) {
    return unauthorized(res)
  }

  if (user.name === CAIT_USERNAME && user.pass === CAIT_PASSWORD) {
    return next()
  } else {
    return unauthorized(res)
  }
}

const errorPage = err => {
  throw new Error(err)
}

const renderPage = (res, template, params) => {
  const renderParams = Object.assign({ GA_TRACKING_ID }, params)
  return res.render(template, renderParams, (err, rendered) => {
    if (err) {
      errorPage(err)
    } else {
      res.send(rendered)
      // if (ENV) {
      //   let page = res.req.originalUrl.replace(/^\//, '')
      //   page = page || 'index'
      //   fs.writeFile(path.resolve('dist', page + '.html'), rendered, e => {
      //     if (e) {
      //       logger(e)
      //     }
      //   })
      // }
    }
  })
}

router.get('/', auth, (req, res) => {
  const groupIds = [...new Set(pages.map(p => p.filter_group || p.slug))]
  const groups = pages.filter(p => groupIds.includes(p.slug))
  renderPage(res, 'index', {
    type: 'index',
    page: index,
    pages,
    groups
  })
})

router.get('/*', auth, (req, res) => {
  const slug = req.url.replace('/', '')
  const renderRoute = page => {
    pages.some(p => {
      if (p.slug === page) {
        renderPage(res, 'detail', {
          type: 'detail',
          page: p
        })
      }
    })
  }
  const pageExists = pages.some(p => {
    if (p.slug === slug) {
      return true
    }
  })

  if (pageExists) {
    renderRoute(slug)
  } else {
    errorPage(404)
  }
})

// if the user hits a non-existing route, then show a 404 error on the utility template.
router.get('*', (req, res) => {
  errorPage(404)
})

module.exports = router
