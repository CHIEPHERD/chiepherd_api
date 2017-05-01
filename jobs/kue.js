let Kue = function() {};
var jobs = require("./jobs")
var amqp = require('amqplib/callback_api');

Kue.prototype.run = function () {
  this.kue = require("kue")

  let hello = this.kue.createQueue()
  amqp.connect('amqp://root:root@192.168.56.1', function(err, conn) {
    if(err) { console.log(err); return; }
    hello.process('hello_world', function(job, done){
      jobs.hello_world(conn, done);
    });
    hello.create("hello_world").save()
  })
};


module.exports = Kue;
