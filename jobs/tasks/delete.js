const models = require('../../models');
let Task = models.tasks;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.task.delete';

    ch.assertExchange(ex, 'topic');
    ch.assertQueue(queue, { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, queue)

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        // update task
        Task.destroy({
          individualHooks: true,
          where: {
            uuid: json.uuid
          }
        }).then(function(task) {
          console.log(task);
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer.from(JSON.stringify(task)),
            { correlationId: msg.properties.correlationId });
          connection.createChannel(function(error, channel) {
            channel.assertExchange(ex, 'topic');
            channel.publish(ex, queue + '.reply', new Buffer(msg.content.toString()));
          });
          ch.ack(msg);
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
