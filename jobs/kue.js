let Kue = function() {};
var jobs = require("./jobs");
var amqp = require('amqplib/callback_api');
var kue = require('kue')

Kue.prototype.run = function () {
  createQueueFor('project.create', jobs.project.create)
  createQueueFor('project.update', jobs.project.update)
  createQueueFor('project.show', jobs.project.show)
  createQueueFor('project.list', jobs.project.list)

  createQueueFor('user.update', jobs.user.update)
  createQueueFor('user.show', jobs.user.show)
  createQueueFor('user.list', jobs.user.list)
  createQueueFor('user.activate', jobs.user.activate)
  createQueueFor('user.reset_password', jobs.user.reset_password)
}

function createQueueFor(resource, job) {
  let queue = kue.createQueue();
  amqp.connect('amqp://root:root@192.168.56.1', function(err, conn) {
    if(err) { console.log(err); return; }
    queue.process(resource, function(_job, done) {
      job(conn, done);
    });
    queue.create(resource).save();
  })
}

module.exports = Kue;
