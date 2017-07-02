const models = require('../../models');
const uuidV4 = require('uuid/v4');
let Project = models.projects;
let User = models.users;
let ProjectAssignment = models.project_assignments;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = 'chiepherd.main';
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.project_assignment.create', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.project_assignment.create")

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        User.find({
          where: {
            email: json.email
          }
        }).then(function (user) {
          if (user != null) {
            Project.find({
              where: {
                uuid: json.projectUuid
              }
            }).then(function (project) {
              if (project != null) {
                ProjectAssignment.find({
                  where: {
                    userId: user.id,
                    projectId: project.id
                  }
                }).then(function (assignment) {
                  if (assignment == null) {
                    ProjectAssignment.create({
                      uuid: uuidV4(),
                      projectId: project.id,
                      userId: user.id,
                      rank: json.rank
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
                })
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
            })
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
      }, { noAck: false });
    });
  });
  done();
}
