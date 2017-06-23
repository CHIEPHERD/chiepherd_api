const models = require('../../models');
const uuidV4 = require('uuid/v4');
let Task = models.tasks;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = 'chiepherd.main';
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.task.create', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.task.create")

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        // Create task
        Project.find({
          where: {
            uuid: json.projectUuid
          }
        }).then(function (project) {
          Task.find({
            where: {
              uuid: json.ancestorUuid
            }
          }).then(function (ancestor) {
            projectId = (project != null ? project.id : null)
            ancestorId = (ancestor != null ? ancestor.id : null)
            Task.create({
              uuid: uuidV4(),
              title: json.title,
              description: json.description,
              type: json.label,
              projectId: projectId,
              ancestorId: ancestorId
            }).then(function(task) {
              task.ancestor = ancestor;
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer.from(JSON.stringify(task.responsify())),
                { correlationId: msg.properties.correlationId });
              connection.createChannel(function(error, channel) {
                var ex = 'chiepherd.task.created';
                channel.assertExchange(ex, 'fanout', { durable: false });
                channel.publish(ex, '', new Buffer.from(JSON.stringify(task)));
              });
              ch.ack(msg);
            }).catch(function(error) {
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer(error.toString()),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            });
          });
        });
      }, { noAck: false });
    });
  });
  done();
}
