var express = require('express');

// Express middleware
var bodyParser = require('body-parser');
var morgan = require('morgan');
var favicon = require('serve-favicon');
var compression = require('compression')

// Route loader
var routes = require('./src/routes/loader');

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/dist/views');

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  next();
});

app.use(morgan('dev'));

// Gzip content
app.use(compression());

// Set Favicon
app.use(favicon(__dirname + '/dist/static/images/site-icons/favicon.ico'));

// Set a static files folder (css, images etc...)
app.use('/static', express.static('dist/static'));

app.use('/', routes);

let errs = {
  404: {
    title: 'Sorry, this page doesn’t exist',
    message : 'Please return to the <a href="/">Help with Child Arangements</a> page and try again.'
  },
  500: {
    title: 'This service is temporarily unavailable',
    message : '<p>This service is not available right now, but we’re working hard to get things up and running again.</p>\n<p>Please return to the <a href="/">Help with Child Arangements</a> page and try again.</p>'
  }
}
function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  if (err) {
    let errCode = Number(err.message.toString())
    if (isNaN(errCode)) {
      errCode = 500
    } else if (errCode > 500) {
      errCode = 500
    }

    let errorPage = Object.assign({
      status: errCode
    }, errs[errCode])

    res.status(errCode)
    res.render('error', {
      type: 'error',
      page: errorPage
    });
  }
}

app.use(errorHandler)

app.listen(port);

console.log('Go Compare is running on localhost:'+port);
