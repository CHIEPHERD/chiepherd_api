let Kue = function() {};
var jobs = require("./jobs")
var amqp = require('amqplib/callback_api');

Kue.prototype.run = function () {
  this.kue = require("kue")

  let hello = this.kue.createQueue()
  amqp.connect('amqp://root:root@192.168.56.1', function(err, conn) {
    if(err) { console.log(err); return; }
    hello.process('project.create', function(job, done) {
      jobs.project.create(conn, done);
    });
    hello.create("project.create").save();
  })
};


module.exports = Kue;
