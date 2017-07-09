const models = require('../../models');
let Task = models.tasks;
let Project = models.projects;
let ProjectAssignment = models.project_assignments;
let User = models.users;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.project.tasks', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.project.tasks")

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        // List all tasks
        Project.find({
          where: {
            uuid: json.uuid
          }
        }).then(function (project) {
          if (project == null) {
            ch.sendToQueue(msg.properties.replyTo,
              new Buffer("Unknown project."),
              { correlationId: msg.properties.correlationId });
            ch.ack(msg);
          } else {
            Task.findAll({
              where: {
                projectId: project.id
              },
              include: [{ model: Task, as: 'ancestor' }]
            }).then(function(tasks) {
              // console.log(tasks);
              var map = {}, task, roots = [];
              for (var i = 0; i < tasks.length; i++) {
                task = tasks[i].simplify();
                map[task.id] = i;
                if (task.ancestorId !== null) {
                  roots[map[task.ancestorId]].children.push(tasks[i].responsify());
                } else {
                  roots.push(tasks[i].responsify());
                }
              }
              console.log(JSON.stringify(roots));
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer.from(JSON.stringify(roots)),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            }).catch(function(error) {
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer(error.toString()),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            });
          }
        })
      }, { noAck: false });
    });
  });
  done();
}
