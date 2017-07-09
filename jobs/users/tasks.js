const models = require('../../models');
let User = models.users;
let Project = models.projects;
let Task = models.tasks;
let TaskAssignment = models.task_assignments;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.user.tasks';

    ch.assertExchange(ex, 'topic');
    ch.assertQueue(queue, { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, queue)

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        User.find({
          where: {
            email: json.email,
            isAdmin: false
          }
        }).then(function (user) {
          if (user != null) {
            Project.find({
              where: {
                uuid: json.projectUuid
              }
            }).then(function (project) {
              if (project != null) {
                Task.findAll({
                  where: {
                    projectId: project.id
                  }
                }).then(function (tasks) {
                  list = []
                  for (var task of tasks) {
                    list.push(task.id)
                  }
                  TaskAssignment.findAll({
                    where: {
                      taskId: {
                        $in: list
                      },
                      userId: user.id
                    },
                    include: [{ model: Task, as: 'task' }]
                  }).then(function (assignments) {
                    for (var i = 0; i < assignments.length; i++) {
                      assignments[i] = assignments[i].responsify()
                    }
                    ch.sendToQueue(msg.properties.replyTo,
                      new Buffer.from(JSON.stringify(assignments)),
                      { correlationId: msg.properties.correlationId });
                    ch.ack(msg);
                  })
                }).catch(function (error) {
                  console.log(error);
                  ch.sendToQueue(msg.properties.replyTo,
                    new Buffer(error.toString()),
                    { correlationId: msg.properties.correlationId });
                  ch.ack(msg);
                });
              } else {
                ch.sendToQueue(msg.properties.replyTo,
                  new Buffer("Unknown project."),
                  { correlationId: msg.properties.correlationId });
                ch.ack(msg);
              }
            })
          } else {
            ch.sendToQueue(msg.properties.replyTo,
              new Buffer("Unknown user."),
              { correlationId: msg.properties.correlationId });
            ch.ack(msg);
          }
        }).catch(function (error) {
          console.log(error);
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
