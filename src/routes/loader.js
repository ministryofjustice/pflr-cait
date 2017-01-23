var express = require('express');
var router = express.Router();
var index = require('../json/index.json');
var pages = require('../json/pages.json');
var basicAuth = require('basic-auth');

// Authenticator
var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'compare' && user.pass === 'meerkat') {
    return next();
  } else {
    return unauthorized(res);
  };
};

var errorPage = function(req, res) {
  res.render('error', {
    type: 'error',
    page: {
      code: '404',
      title: 'Error 404: No page found at \'' + req.url +'\'',
      message : 'You seem to have to hit his page in error.'
    }
  });
}

router.get('/', auth, (req, res) => {
  res.render('index', {
    type: 'index',
    page: index,
    pages: pages
  })
});

router.get('/*', auth, (req, res) => {
  var slug = req.url.replace('/','');
  var renderPage = function(page) {
    pages.some(function (p) {
      if (p.slug === page) {
        res.render (
          'detail', {
            type: 'detail',
            page: p
          }
        )
      }
    });
  }
  var pageExists = pages.some(function (p) {
    if (p.slug === slug) {
      return true;
    }
  });

  if (pageExists) {
    renderPage(slug)
  } else {
    errorPage(req, res);
  }
});

// if the user hits a non-existing route, then show a 404 error on the utility template.
router.get('*', (req, res) => {
  errorPage(req, res);
});

module.exports = router;
