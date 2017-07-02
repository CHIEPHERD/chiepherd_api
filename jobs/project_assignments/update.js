const models = require('../../models');
let Project = models.projects;
let User = models.users;
let ProjectAssignment = models.project_assignments;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = 'chiepherd.main';
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.project_assignment.update', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.project_assignment.update")

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        Project.find({
          where: {
            uuid: json.projectUuid
          }
        }).then(function (project) {
          if (project != null) {
            User.find({
              where: {
                email: json.email
              }
            }).then(function (user) {
              if (user != null) {
                ProjectAssignment.find({
                  where: {
                    uuid: json.projectAssignmentUuid,
                    userId: user.id
                  }
                }).then(function (assignment) {
                  if (assignment != null) {
                    ProjectAssignment.find({
                      where: {
                        projectId: project.id,
                        userId: user.id,
                        uuid: {
                          $not: assignment.uuid
                        }
                      }
                    }).then(function (assign) {
                      if (assign == null) {
                        assignment.update({
                          rank: json.rank || assignment.rank,
                          projectId: project.id
                        }).then(function (projectAssignment) {
                          projectAssignment.email = user.email;
                          projectAssignment.projectUuid = project.uuid;
                          ch.sendToQueue(msg.properties.replyTo,
                            new Buffer.from(JSON.stringify(projectAssignment.responsify())),
                            { correlationId: msg.properties.correlationId });
                          connection.createChannel(function(error, channel) {
                            var ex = 'chiepherd.project_assignment.created';
                            channel.assertExchange(ex, 'fanout', { durable: false });
                            channel.publish(ex, '', new Buffer.from(JSON.stringify(projectAssignment.responsify())));
                          });
                        }).catch(function (error) {
                          console.log(error);
                          ch.sendToQueue(msg.properties.replyTo,
                            new Buffer(error.toString()),
                            { correlationId: msg.properties.correlationId });
                          ch.ack(msg);
                        });
                      } else {
                        ch.sendToQueue(msg.properties.replyTo,
                          new Buffer("This user is already a member of this project."),
                          { correlationId: msg.properties.correlationId });
                        ch.ack(msg);
                      }
                    }).catch(function (error) {
                      console.log(error);
                      ch.sendToQueue(msg.properties.replyTo,
                        new Buffer(error.toString()),
                        { correlationId: msg.properties.correlationId });
                      ch.ack(msg);
                    });
                  } else {
                    ch.sendToQueue(msg.properties.replyTo,
                      new Buffer("This user already belongs to this project."),
                      { correlationId: msg.properties.correlationId });
                    ch.ack(msg);
                  }
                }).catch(function (error) {
                  console.log(error);
                  ch.sendToQueue(msg.properties.replyTo,
                    new Buffer(error.toString()),
                    { correlationId: msg.properties.correlationId });
                  ch.ack(msg);
                });
              } else {
                ch.sendToQueue(msg.properties.replyTo,
                  new Buffer("Unknown user."),
                  { correlationId: msg.properties.correlationId });
                ch.ack(msg);
              }
            }).catch(function (error) {
              console.log(error);
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer(error.toString()),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            });
          } else {
            ch.sendToQueue(msg.properties.replyTo,
              new Buffer("Unknown project."),
              { correlationId: msg.properties.correlationId });
            ch.ack(msg);
          }
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
