const models = require('../../models');
let User = models.users;
let Project = models.projects;
let ProjectAssignment = models.project_assignments;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.project.users';

    ch.assertExchange(ex, 'topic');
    ch.assertQueue(queue, { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, queue)

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        Project.find({
          where: {
            uuid: json.uuid
          }
        }).then(function (project) {
          if (project != null) {
            ProjectAssignment.findAll({
              where: {
                projectId: project.id
              },
              include: [{ model: User, as: 'user', where: { isActive: true } }]
            }).then(function (projectAssignments) {
              for (var i = 0; i < projectAssignments.length; i++) {
                projectAssignments[i] = projectAssignments[i].responsify();
              }
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer.from(JSON.stringify(projectAssignments)),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            }).catch(function (error) {
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer(error.toString()),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            });
          } else {
            ch.sendToQueue(msg.properties.replyTo,
              new Buffer("Unknown project."),
              { correlationId: msg.properties.correlationId });
            ch.ack(msg);          }
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
