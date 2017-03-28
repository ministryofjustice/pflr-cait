const fs = require('fs')
const express = require('express')
const path = require('path')
const request = require('request-promise-native')

// Express middleware
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const favicon = require('serve-favicon')
const compression = require('compression')

const logger = require('../lib/logger')
const auth = require('../lib/auth')

// Route loader
const routes = require('../lib/routes')

const rootDir = path.join(__dirname, '..')
const getDistPath = (srcDir = '') => path.join(rootDir, 'dist', srcDir)

const ENV = process.env.ENV
const PORT = process.env.PORT || 3000

if (!ENV || ENV === 'a11y') {
  try {
    fs.unlinkSync(getDistPath('robots.txt'))
  } catch (e) {}
}

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set('view engine', 'ejs')
app.set('views', path.join(rootDir, 'src', 'views'))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization')
  res.setHeader('X-Robots-Tag', 'noindex,nofollow')
  next()
})

const loggingPreset = ENV ? 'combined' : 'dev'
app.use(morgan(loggingPreset, {
  skip: () => ENV === 'test'
}))

// Gzip content
app.use(compression())

const { APP_VERSION, APP_BUILD_DATE, APP_GIT_COMMIT, APP_BUILD_TAG } = process.env
app.use('/ping.json', (req, res) => {
  res.json({
    version_number: APP_VERSION,
    build_date: APP_BUILD_DATE,
    commit_id: APP_GIT_COMMIT,
    build_tag: APP_BUILD_TAG
  })
})

const indexJson = require('../data/index.json')
const indexMatch = new RegExp(`<h1>${indexJson.title}</h1>`)
app.use('/healthcheck.json', (req, res) => {
  let status = true
  let statusCode
  request(`http://localhost:${PORT}`)
    .then(html => {
      statusCode = 200
      if (!html.match(indexMatch)) {
        status = false
      }
    })
    .catch(err => {
      status = false
      statusCode = err.statusCode
    })
    .then(() => {
      res.json({
        status,
        content: {
          statusCode
        }
      })
    })
})

// Set Favicon
app.use(favicon(getDistPath('static/images/site-icons/favicon.ico')))

// Enable reading of cookies
app.use(cookieParser())

// Run everything through basic auth
app.use(auth)

// Shut out users who have not come via private beta
if (ENV === 'prod' || ENV === 'dev' || ENV === 'private-beta') {
  app.use((req, res, next) => {
    if (req.connection.remoteAddress.includes('127.0.0.1')) {
      return next()
    }
    if (!req.url.match(/\.(css|js)/)) {
      if (!req.cookies || !req.cookies.surveyData) {
        let referrer = req.query.referrer
        let uuid = req.query.uuid
        if (!referrer || !referrer.includes('private-beta-cla') || !uuid) {
          req.disqualified = true
          throw new Error(401)
        }
        res.cookie('surveyData', JSON.stringify({
          campaignName: 'private-beta-cla',
          uuid
        }))
      }
    }
    return next()
  })
}

// Set a static files folder (css, images etc...)
app.use('/', express.static(getDistPath(), {
  index: ['index.html'],
  extensions: ['html']
}))

app.use((req, res, next) => {
  req.servername = req.protocol + '://' + req.headers.host
  next()
})

app.use('/', routes)

const { GA_TRACKING_ID } = process.env
let errs = {
  401: {
    title: 'You’re not eligible to use this service',
    message: 'Based on the answers you’ve given, you currently can’t use this service.',
    more: '<p>Visit GOV.UK for more information on <a href="https://www.gov.uk/looking-after-children-divorce">making child arrangements</a> with the other parent.</p><p>Thank you for your time.</p>'
  },
  404: {
    title: 'This page can’t be found',
    message: 'Please check you’ve entered the correct web address.'
  },
  500: {
    title: 'Sorry, we’re currently experiencing technical difficulties',
    message: 'Please try again later.'
  }
}
function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  if (err) {
    logger(err)
    let errCode = Number(err.message.toString())
    if (isNaN(errCode) || errCode > 500) {
      errCode = 500
    }

    const errorPage = Object.assign({
      status: errCode
    }, errs[errCode])

    res.status(errCode)
    res.render('error', {
      type: 'error',
      page: errorPage,
      GA_TRACKING_ID,
      req
    })
  }
}

app.use(errorHandler)

app.listen(PORT)

logger('CAIT is running on localhost:' + PORT)
