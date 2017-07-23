const models = require('../../models');
let User = models.users;
let Project = models.projects;
let Task = models.tasks;
let TaskAssignment = models.task_assignments;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.task.users';

    ch.assertExchange(ex, 'topic');
    ch.assertQueue(queue, { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, queue)

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        Task.find({
          where: {
            uuid: json.uuid
          }
        }).then(function (task) {
          if (task != null) {
            TaskAssignment.findAll({
              where: {
                taskId: task.id
              },
              include: [{ model: User, as: 'user' }]
            }).then(function (assignments) {
              for (var i = 0; i < assignments.length; i++) {
                assignments[i] = assignments[i].responsify();
              }
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer.from(JSON.stringify(assignments)),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            })
          } else {
            ch.sendToQueue(msg.properties.replyTo,
              new Buffer("Unknown task."),
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
