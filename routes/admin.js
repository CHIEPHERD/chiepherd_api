var express = require('express');
var passport = require('passport')
var amqp = require('amqplib/callback_api')

const models = require('../models');
const User = models.users;
var router = express.Router();
//var amqpConn = amqp.connect(process.env.amqp_ip);

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
    res.json({
      errors: {
        message: err
      }
    });
  })

});

router.post('/channel', function(req, res) {
  var ex = process.env.ex;

  amqp.connect(process.env.amqp_ip, function(err, conn) {
    conn.createChannel(function(err, ch) {
      ch.assertQueue(req.body.routing_key, { exclusive: false }, function(err, q) {

        var corr = Math.random().toString() + Math.random().toString() + Math.random().toString();

        ch.consume(q.queue, function(msg) {
          if (msg.properties.correlationId == corr) {
            console.log('queue ' + req.body.routing_key);
            console.log(' [.] Got %s', msg.content.toString());
            setTimeout(function() { conn.close(); res.status(200).send(msg.content.toString()); });
          }
        }, {noAck: true});

        ch.sendToQueue(req.body.routing_key,
        new Buffer(JSON.stringify(req.body.payload)),
        { correlationId: corr, replyTo: q.queue });
      });
    });
  });
})

router.get('/logout', function(req, res){
  req.logout();
  res.status(200);
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
      nickname: req.body.nickname,
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
