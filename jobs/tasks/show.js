const models = require('../../models');
let Task = models.tasks;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.task.show';

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
          },
          include: [{ model: Task, as: 'ancestor' }]
        }).then(function(task) {
          if (task != null) {
            ch.sendToQueue(msg.properties.replyTo,
              new Buffer.from(JSON.stringify(task.responsify())),
              { correlationId: msg.properties.correlationId });
            ch.ack(msg);
          } else {
            ch.sendToQueue(msg.properties.replyTo,
              new Buffer(JSON.stringify({ error: 'Unknown task'})),
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
