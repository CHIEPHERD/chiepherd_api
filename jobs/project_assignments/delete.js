const models = require('../../models');
let Project = models.projects;
let User = models.users;
let ProjectAssignment = models.project_assignment;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = 'chiepherd.main';
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.project_assignment.delete', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.project_assignment.delete")

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        ProjectAssignment.destroy({
          where: {
            uuid: json.uuid
          }
        }).then(function (assignment) {
          console.log(assignment);
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer.from(JSON.stringify(assignment)),
            { correlationId: msg.properties.correlationId });
          connection.createChannel(function(error, channel) {
            var ex = 'chiepherd.project_assignment.deleted';
            channel.assertExchange(ex, 'fanout', { durable: false });
            channel.publish(ex, '', new Buffer(msg.content.toString()));
          });
          ch.ack(msg);
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
