const models = require('../../models');
let Project = models.projects;
let User = models.users;
let ProjectAssignment = models.project_assignments;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.project_assignment.delete';
    
    ch.assertExchange(ex, 'topic');
    ch.assertQueue(queue, { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, queue)

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        ProjectAssignment.find({
          where: {
            uuid: json.uuid
          }
        }).then(function (assignment) {
          assignment.destroy().then(function (removed) {
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
