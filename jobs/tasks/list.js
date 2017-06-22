const models = require('../../models');
let Task = models.tasks;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = 'chiepherd.main';
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.task.list', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.task.list")

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        // List all tasks
        Task.findAll({
          where: {
            projectId: json.projectId
          }
        }).then(function(tasks) {
          var map = {}, task, roots = [];
          for (var i = 0; i < tasks.length; i++) {
            task = tasks[i].responsify();
            task.children = [];
            map[task.id] = i;
            if (task.ancestorId !== null) {
              roots[map[task.ancestorId]].children.push(task);
            } else {
              roots.push(task);
            }
          }

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
      }, { noAck: false });
    });
  });
  done();
}
