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

app.listen(port);

console.log('Go Compare is running on localhost:'+port);
