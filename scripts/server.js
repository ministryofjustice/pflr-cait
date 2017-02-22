const express = require('express')
const path = require('path')

// Express middleware
const bodyParser = require('body-parser')
const morgan = require('morgan')
const favicon = require('serve-favicon')
const compression = require('compression')

// Route loader
const routes = require('../lib/routes')

const rootDir = path.join(__dirname, '..')
const getDistPath = (srcDir = '') => path.join(rootDir, 'dist', srcDir)

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set('view engine', 'ejs')
app.set('views', path.join(rootDir, 'src', 'views'))
// app.set('views', path.join(rootDir, 'views'))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization')
  res.setHeader('X-Robots-Tag', 'noindex,nofollow')
  next()
})

app.use(morgan('dev'))

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
app.use('/healthcheck.json', (req, res) => {
  res.json({
    status: 'ok'
  })
})

// Set Favicon
app.use(favicon(getDistPath('static/images/site-icons/favicon.ico')))

// Set a static files folder (css, images etc...)
app.use('/', express.static(getDistPath()))

app.use('/', routes)

const { GA_TRACKING_ID } = process.env
let errs = {
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
    console.log(err)
    let errCode = Number(err.message.toString())
    if (isNaN(errCode)) {
      errCode = 500
    } else if (errCode > 500) {
      errCode = 500
    }

    const errorPage = Object.assign({
      status: errCode
    }, errs[errCode])

    res.status(errCode)
    res.render('error', {
      type: 'error',
      page: errorPage,
      GA_TRACKING_ID
    })
  }
}

app.use(errorHandler)

app.listen(port)

console.log('CAIT is running on localhost:' + port)
