const models = require('../../models');
let Project = models.projects;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.project.list', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.project.list")

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        // List all projects
        Project.findAll().then(function(projects) {
          for (var i = 0; i < projects.length; i++) {
            projects[i] = projects[i].responsify();
          }
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer.from(JSON.stringify(projects)),
            { correlationId: msg.properties.correlationId });
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
