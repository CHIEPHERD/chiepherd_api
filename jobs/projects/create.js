const models = require('../../models');
const uuidV4 = require('uuid/v4');
let Project = models.projects;
let User = models.users;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.project.create';

    ch.assertExchange(ex, 'topic');
    ch.assertQueue(queue, { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, queue)

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
            // Create project
            Project.create({
              uuid: uuidV4(),
              name: json.name,
              label: json.label,
              description: json.description
            }).then(function(project) {
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer.from(JSON.stringify(project.responsify())),
                { correlationId: msg.properties.correlationId });
              connection.createChannel(function(error, channel) {
                channel.assertExchange(ex, 'topic');
                channel.publish(ex, queue + '.reply', new Buffer.from(JSON.stringify(project)));
              });
              connection.createChannel(function(error, channel) {
                channel.assertExchange(ex, 'topic');
                channel.publish(ex, 'chiepherd.project_assignment.create', new Buffer.from(JSON.stringify({
                  rank: 'Lead',
                  projectUuid: project.uuid,
                  email: user.email
                })));
              });
              ch.ack(msg);
            }).catch(function(error) {
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
      }, { noAck: false });
    });
  });
  done();
}
