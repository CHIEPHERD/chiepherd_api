const models = require('../../models');
const uuidV4 = require('uuid/v4');
let Project = models.projects;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = 'chiepherd.main';
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.project.create', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.project.create")

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        // Create project
        Project.create({
          uuid: uuidV4(),
          name: json.name,
          label: json.label,
          description: json.description
        }).then(function(project) {
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer.from(JSON.stringify(project)),
            { correlationId: msg.properties.correlationId });
          connection.createChannel(function(error, channel) {
            var ex = 'chiepherd.project.created';
            channel.assertExchange(ex, 'fanout', { durable: false });
            channel.publish(ex, '', new Buffer.from(JSON.stringify(project)));
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
