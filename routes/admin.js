var express = require('express');
var passport = require('passport')
const models = require('../models');
const User = models.users;
var router = express.Router();

router.post('/login', passport.authenticate('local'), function(req, res) {
  User.findById(req.session.passport.user).then((response) => {
    res.json({
      session: req.session,
      sessionID: req.sessionID,
      admin: {
        email: response.email,
        firstname: response.firstname,
        lastname: response.lastname,
        nickname: response.nickname,
        description: response.description,
        isAdmin: response.isAdmin,
        isActive: response.isActive
      }
    });
  }).catch((err) => {
    res.json(err);
  })

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
      password: req.body.password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      isAdmin: true,
      isActive: false
    }).then(function(user) {
      res.status(200).send(user.responsify());
    }).catch(function(error) {
      res.status(422).send(error);
    });
  } else {
    res.status(422).send('Password and password confirmation are different');
  }
});

module.exports = router;
