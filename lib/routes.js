const express = require('express')
const router = express.Router()
const index = require('../src/json/index.json')
const pages = require('../src/json/pages.json')
const basicAuth = require('basic-auth')

const { CAIT_USERNAME, CAIT_PASSWORD } = process.env

// Authenticator
const auth = (req, res, next) => {
  if (!CAIT_USERNAME) {
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

router.get('/', auth, (req, res) => {
  const groupIds = [...new Set(pages.map(p => p.filter_group || p.slug))]
  const groups = pages.filter(p => groupIds.includes(p.slug))
  res.render('index', {
    type: 'index',
    page: index,
    pages,
    groups
  })
})

router.get('/*', auth, (req, res) => {
  console.log('serving', req.url)
  const slug = req.url.replace('/', '')
  const renderPage = page => {
    pages.some(p => {
      if (p.slug === page) {
        res.render(
          'detail', {
            type: 'detail',
            page: p
          }
        )
      }
    })
  }
  const pageExists = pages.some(p => {
    if (p.slug === slug) {
      return true
    }
  })

  if (pageExists) {
    renderPage(slug)
  } else {
    errorPage(404)
  }
})

// if the user hits a non-existing route, then show a 404 error on the utility template.
router.get('*', (req, res) => {
  errorPage(404)
})

module.exports = router
