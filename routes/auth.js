var express = require('express');
var passport = require('passport')
const models = require('../models');
const User = models.users;
var router = express.Router();

router.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect('/');
});

router.get('/logout', function(req, res){
  req.logout();
});

router.get('/', function(req, res) {
  res.json({
    result: 'ok'
  });
});

router.post('/register', function(req, res) {
  if (req.body.password == req.body.password_confirmation) {
    User.create({
      email: req.body.email,
      password: req.body.password
    }).then(function() {
      passport.authenticate('local') (req, res, function () {
        res.redirect('/');
      });
    }).catch(function(error) {
      res.status(422).send(error);
    });
  } else {
    res.status(422).send('Password and password confirmation are different');
  }
});

module.exports = router;
