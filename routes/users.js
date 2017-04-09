const express = require('express');
let router = express.Router()

const models = require('../models');
const User = models.users

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req, res, next) {
  let email = req.body.email
  let password = req.body.password
  User.create({
    email: email,
    password: password
  }).then(function(p) {
    res.json(p)
  }).catch(next)
})

router.get('/', function(req, res, next) {
  User.findAll().then(function(users) {
    res.json(users)
  }).catch(next)
})

module.exports = router;
