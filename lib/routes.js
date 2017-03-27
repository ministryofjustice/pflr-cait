const express = require('express')
const router = express.Router()
const index = require('../data/index.json')
const pages = require('../data/pages.json')
const fs = require('fs')
const path = require('path')

const logger = require('./logger')

const { GA_TRACKING_ID, ENV } = process.env

logger('Loading routes - environment:', ENV || 'not set')

const errorPage = err => {
  throw new Error(err)
}

const renderPage = (res, template, params) => {
  const req = res.req
  const renderParams = Object.assign({
    req,
    GA_TRACKING_ID,
    env: process.env || {}
  }, params)
  return res.render(template, renderParams, (err, rendered) => {
    if (err) {
      errorPage(err)
    } else {
      res.send(rendered)
      if (ENV) {
        let page = req.originalUrl.replace(/^\//, '')
        page = page || 'index'
        fs.writeFile(path.resolve('dist', page + '.html'), rendered, e => {
          if (e) {
            logger(e)
          }
        })
      }
    }
  })
}

router.get('/', (req, res) => {
  const groupIds = [...new Set(pages.map(p => p.filter_group || p.slug))]
  const groups = pages.filter(p => groupIds.includes(p.slug))
  renderPage(res, 'index', {
    type: 'index',
    page: index,
    pages,
    groups
  })
})

// router.get('/about/:about', (req, res) => {
//   renderPage(res, 'about', {
//     page: {},
//     about: req.params.about
//   })
// })

router.get('/*', (req, res) => {
  const slug = req.url.replace('/', '')
  const renderRoute = route => {
    pages.some(page => {
      if (page.slug === route) {
        if (!page.body_copy) {
          // page.body_copy = 'WTF?'
        }
        renderPage(res, 'detail', {
          type: page.type || 'detail',
          page,
          pages
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

module.exports = router
