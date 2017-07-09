const models = require('../../models');
let Project = models.projects;
let ProjectAssignment = models.project_assignments;
let User = models.users;
let Task = models.tasks;
let TaskAssignment = models.task_assignments;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.task_assignment.delete', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.task_assignment.delete")

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());
        TaskAssignment.destroy({
          where: {
            uuid: json.uuid
          }
        }).then(function (assignment) {
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer.from(JSON.stringify(assignment)),
            { correlationId: msg.properties.correlationId });
          connection.createChannel(function(error, channel) {
            channel.assertExchange(ex, 'topic');
            channel.publish(ex, queue + '.reply', new Buffer(msg.content.toString()));
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
