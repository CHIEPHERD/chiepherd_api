let Kue = function() {};
var jobs = require("./jobs");
var amqp = require('amqplib/callback_api');
var kue = require('kue');

Kue.prototype.run = function () {
  createQueueFor('project.create', jobs.project.create);
  createQueueFor('project.update', jobs.project.update);
  createQueueFor('project.show', jobs.project.show);
  createQueueFor('project.list', jobs.project.list);

  createQueueFor('task.create', jobs.task.create);
  createQueueFor('task.update', jobs.task.update);
  createQueueFor('task.show', jobs.task.show);
  createQueueFor('task.delete', jobs.task.delete);
  createQueueFor('task.list', jobs.task.list);

  createQueueFor('user.update', jobs.user.update);
  createQueueFor('user.show', jobs.user.show);
  createQueueFor('user.list', jobs.user.list);
  createQueueFor('user.activate', jobs.user.activate);
  createQueueFor('user.reset_password', jobs.user.reset_password);

  createQueueFor('project.users', jobs.project.users);
  createQueueFor('user.projects', jobs.user.projects);
  createQueueFor('project_assignment.create', jobs.project_assignment.create);
  createQueueFor('project_assignment.update', jobs.project_assignment.update);
  createQueueFor('project_assignment.delete', jobs.project_assignment.delete);

  createQueueFor('task_assignment.create', jobs.task_assignment.create);
  createQueueFor('task_assignment.delete', jobs.task_assignment.delete);
  createQueueFor('task.users', jobs.task.users);
  createQueueFor('user.tasks', jobs.user.tasks);
}

function createQueueFor(resource, job) {
  let queue = kue.createQueue();
  amqp.connect(process.env.amqp_ip, function(err, conn) {
    if(err) { console.log(err); return; }
    queue.process(resource, function(_job, done) {
      job(conn, done);
    });
    queue.create(resource).save();
  })
}

module.exports = Kue;
