const models = require('../../models');
let User = models.users;
let TaskAssignment = models.task_assignments;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.user.activate';

    ch.assertExchange(ex, 'topic');
    ch.assertQueue(queue, { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, queue);

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", queue, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        // Update user
        User.find({
          where: {
            email: json.email
          }
        }).then(function(user) {
          if(user != undefined) {
            user.update({
              isActive: json.isActive
            }).then(function(user) {
              connection.createChannel(function(error, channel) {
                channel.assertExchange(ex, 'topic');
                channel.publish(ex, queue + '.reply', new Buffer.from(JSON.stringify(user.responsify())));
              });
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer.from(JSON.stringify(user.responsify())),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
              if (json.isActive == false) {
                TaskAssignment.findAll({
                  where: {
                    userId: user.id
                  }
                }).then(function (tasks) {
                  for (var task of tasks) {
                    connection.createChannel(function(error, channel) {
                      channel.assertExchange(ex, 'topic');
                      channel.publish(ex, 'chiepherd.task_assignment.delete', new Buffer.from(JSON.stringify({
                        uuid: task.uuid
                      })));
                    });
                  }
                }).catch(function () {
                  ch.sendToQueue(msg.properties.replyTo,
                    new Buffer(error.toString()),
                    { correlationId: msg.properties.correlationId });
                  ch.ack(msg);
                });
              }
              console.log('OK');
            }).catch(function(error) {
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer(error.toString()),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            });
          } else {
            ch.sendToQueue(msg.properties.replyTo,
              new Buffer("Unknown user."),
              { correlationId: msg.properties.correlationId });
            ch.ack(msg);
          }
        }).catch(function(error) {
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
