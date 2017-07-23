const models = require('../../models');
const uuidV4 = require('uuid/v4');
let Task = models.tasks;
let Project = models.projects;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.task.create';
    
    ch.assertExchange(ex, 'topic');
    ch.assertQueue(queue, { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, queue)

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
          if (project == null) {
            ch.sendToQueue(msg.properties.replyTo,
              new Buffer("Unknown project."),
              { correlationId: msg.properties.correlationId });
            ch.ack(msg);
          } else {
            console.log(JSON.stringify(project));
            Task.find({
              where: {
                uuid: json.ancestorUuid,
                projectId: project.id
              }
            }).then(function (ancestor) {
              if (ancestor == null && json.ancestorUuid != null) {
                ch.sendToQueue(msg.properties.replyTo,
                  new Buffer("This task doesn't belong to this project."),
                  { correlationId: msg.properties.correlationId });
                ch.ack(msg);
              } else {
                Task.create({
                  uuid: uuidV4(),
                  title: json.title,
                  description: json.description,
                  type: json.type,
                  projectId: project && project.id,
                  ancestorId: ancestor && ancestor.id
                }).then(function(task) {
                  task.ancestor = ancestor && ancestor.simplify();
                  task.projectUuid = project.uuid;
                  console.log('send');
                  console.log(JSON.stringify(task.responsify()));
                  ch.sendToQueue(msg.properties.replyTo,
                    new Buffer.from(JSON.stringify(task.responsify())),
                    { correlationId: msg.properties.correlationId });
                  connection.createChannel(function(error, channel) {
                    channel.assertExchange(ex, 'topic');
                    channel.publish(ex, queue + '.reply', new Buffer.from(JSON.stringify(task.responsify())));
                  });
                  ch.ack(msg);
                }).catch(function(error) {
                  console.log(error);
                  ch.sendToQueue(msg.properties.replyTo,
                    new Buffer(error.toString()),
                    { correlationId: msg.properties.correlationId });
                  ch.ack(msg);
                });
              }
            }).catch(function (error) {
              console.log(error);
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer(error.toString()),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            });
          }
        });
      }, { noAck: false });
    });
  });
  done();
}
