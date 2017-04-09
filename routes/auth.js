var express = require('express');
var passport = require('passport')
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
  })
})

module.exports = router;
