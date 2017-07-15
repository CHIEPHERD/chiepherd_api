const models = require('../../models');
let User = models.users;
let Task = models.tasks;
let TaskAssignment = models.task_assignments;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.task_assignment.delete';

    ch.assertExchange(ex, 'topic');
    ch.assertQueue(queue, { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, queue)

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());
        Task.find({
          where: {
            uuid: json.taskUuid
          }
        }).then(function (task) {
          if (task != undefined) {
            User.find({
              where: {
                email: json.email
              }
            }).then(function (user) {
              if (user != undefined || json.email == undefined) {
                args = { taskId: task.id }
                if (json.email != undefined) {
                  args.userId = user.id;
                }
                TaskAssignment.destroy({
                  where: args
                }).then(function (assignment) {
                  ch.sendToQueue(msg.properties.replyTo,
                    new Buffer.from(JSON.stringify({ status: 'removed' })),
                    { correlationId: msg.properties.correlationId });
                  connection.createChannel(function(error, channel) {
                    channel.assertExchange(ex, 'topic');
                    channel.publish(ex, queue + '.reply', new Buffer(msg.content.toString()));
                  });
                  ch.ack(msg);
                }).catch(function (error) {
                  console.log(error);
                  ch.sendToQueue(msg.properties.replyTo,
                    new Buffer(error.toString()),
                    { correlationId: msg.properties.correlationId });
                  ch.ack(msg);
                });
              } else {
                ch.sendToQueue(msg.properties.replyTo,
                  new Buffer("Unknown task"),
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
          } else {
            ch.sendToQueue(msg.properties.replyTo,
              new Buffer("Unknown user"),
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
