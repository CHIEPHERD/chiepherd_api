const models = require('../../models');
let Task = models.tasks;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.task.update';

    ch.assertExchange(ex, 'topic');
    ch.assertQueue(queue, { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, queue)

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        // update task
        Task.find({
          where: {
            uuid: json.uuid
          }
        }).then(function(task) {
          if(task != undefined) {
            Task.find({
              where: {
                uuid: json.ancestorUuid
              }
            }).then(function (ancestor) {
              console.log(json.ancestorUuid);
              if (ancestor != undefined || json.ancestorUuid == undefined || json.ancestorUuid == null) {
                task.update({
                  title: json.title || task.title,
                  description: json.description || task.description,
                  type: json.type || task.type,
                  ancestorId: (ancestor && ancestor.id) || task.ancestorId
                }).then(function(task) {
                  task.ancestor = ancestor;
                  ch.sendToQueue(msg.properties.replyTo,
                    new Buffer.from(JSON.stringify(task.responsify())),
                    { correlationId: msg.properties.correlationId });
                  connection.createChannel(function(error, channel) {
                    channel.assertExchange(ex, 'topic');
                    channel.publish(ex, queue + '.reply', new Buffer.from(JSON.stringify(task.responsify())));
                  });
                  ch.ack(msg);
                }).catch(function(error) {
                  console.log(error);
                  ch.sendToQueue(msg.properties.replyTo,
                    new Buffer(error.toString()),
                    { correlationId: msg.properties.correlationId });
                  ch.ack(msg);
                });
              } else {
                ch.sendToQueue(msg.properties.replyTo,
                  new Buffer("Unknown ancestor task."),
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
              new Buffer("Unknown task."),
              { correlationId: msg.properties.correlationId });
            ch.ack(msg);
          }
        }).catch(function(error) {
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
