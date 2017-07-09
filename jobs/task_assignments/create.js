const models = require('../../models');
let Project = models.projects;
let ProjectAssignment = models.project_assignments;
let User = models.users;
let Task = models.tasks;
let TaskAssignment = models.task_assignments;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.task_assignment.create', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.task_assignment.create")

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        User.find({
          where: {
            email: json.email
          }
        }).then(function (user) {
          if (user != null) {
            Task.find({
              where: {
                uuid: json.taskUuid
              }
            }).then(function (task) {
              if (task != null) {
                ProjectAssignment.find({
                  where: {
                    projectId: task.projectId,
                    userId: user.id
                  }
                }).then(function (projectAssignment) {
                  if (projectAssignment != null) {
                    TaskAssignment.find({
                      where: {
                        userId: user.id,
                        taskId: task.id
                      }
                    }).then(function (assignment) {
                      if (assignment == null) {
                        TaskAssignment.create({
                          userId: user.id,
                          taskId: task.id
                        }).then(function (taskAssignment) {
                          taskAssignment.user = user.responsify();
                          taskAssignment.task = task.responsify();
                          ch.sendToQueue(msg.properties.replyTo,
                            new Buffer.from(JSON.stringify(taskAssignment.responsify())),
                            { correlationId: msg.properties.correlationId });
                          connection.createChannel(function(error, channel) {
                            channel.assertExchange(ex, 'topic');
                            channel.publish(ex, queue + '.reply', new Buffer.from(JSON.stringify(taskAssignment.responsify())));
                          });
                        }).catch(function (error) {
                          console.log(error);
                          ch.sendToQueue(msg.properties.replyTo,
                            new Buffer(error.toString()),
                            { correlationId: msg.properties.correlationId });
                          ch.ack(msg);
                        });
                      } else {
                        ch.sendToQueue(msg.properties.replyTo,
                          new Buffer("This user is already assigned to this task."),
                          { correlationId: msg.properties.correlationId });
                        ch.ack(msg);
                      }
                    }).catch(function (error) {
                      ch.sendToQueue(msg.properties.replyTo,
                        new Buffer(error.toString()),
                        { correlationId: msg.properties.correlationId });
                      ch.ack(msg);
                    });
                  } else {
                    ch.sendToQueue(msg.properties.replyTo,
                      new Buffer("This user is doesn't belong to this project."),
                      { correlationId: msg.properties.correlationId });
                    ch.ack(msg);
                  }
                }).catch(function (error) {
                  ch.sendToQueue(msg.properties.replyTo,
                    new Buffer(error.toString()),
                    { correlationId: msg.properties.correlationId });
                  ch.ack(msg);
                });
              } else {
                ch.sendToQueue(msg.properties.replyTo,
                  new Buffer("Unknow task."),
                  { correlationId: msg.properties.correlationId });
                ch.ack(msg);
              }
            }).catch(function (error) {
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer(error.toString()),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            });
          } else {
            ch.sendToQueue(msg.properties.replyTo,
              new Buffer("Unknow user."),
              { correlationId: msg.properties.correlationId });
            ch.ack(msg);
          }
        }).catch(function (error) {
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer(error.toString()),
            { correlationId: msg.properties.correlationId });
          ch.ack(msg);
        });
      }, { noAck: false });
    });
  });
  done();
}
