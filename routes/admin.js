var express = require('express');
var passport = require('passport')
var amqp = require('amqplib')

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
  let connec;
  amqp.connect(process.env.amqp_ip).then(function(conn) {
    connec = conn;
    return conn.createChannel()
  }).then((ch) => {
    var ex = 'chiepherd.main';
    //var args = process.argv.slice(2);
    var key = req.body.routing_key;
    var rKey = key + '.web';
    var msg = req.body.payload;

    ch.assertExchange(ex, 'topic', {durable: true});
    ch.assertQueue(rKey, {durable: false})
    ch.publish(ex, key, Buffer.from(JSON.stringify(msg)), {correlationId: 'jqdksljl', replyTo: rKey} );
    console.log(" [x] Sent %s:'%s'", key, msg);
    ch.consume(rKey, (rMsg) => {
      console.log("response message");
      ch.ack(rMsg);
      res.status(200).send(rMsg.content.toString());
      res.end();
      connec.close();
    },{ noAck: false }).catch(function ( err ) { res.sendStatus(402); res.end();});
  }).catch(function ( err ) { res.status(404).send('connection error'); res.end();});
    //setTimeout(function() { conn.close(); }, 500);
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
