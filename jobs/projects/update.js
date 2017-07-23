const models = require('../../models');
let Project = models.projects;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.project.update';

    ch.assertExchange(ex, 'topic');
    ch.assertQueue(queue, { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, queue)

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        // update project
        Project.find({
          where: {
            uuid: json.uuid
          }
        }).then(function(project) {
          if(project) {
            project.update({
              name: json.name || project.name,
              label: json.label || project.label,
              description: json.description || project.description,
              visibility: json.visibility || project.visibility
            }).then(function(project) {
              connection.createChannel(function(error, channel) {
                channel.assertExchange(ex, 'topic');
                channel.publish(ex, queue + '.reply', new Buffer.from(JSON.stringify(project)));
              });
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer.from(JSON.stringify(project)),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            }).catch(function(error) {
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer(error.toString()),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            });
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
