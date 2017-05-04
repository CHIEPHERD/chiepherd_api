const models = require('../../models');
let Project = models.projects;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = 'chiepherd.main';
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.project.create', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.project.create")
      ch.consume(q.queue, function(msg) {
        // console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        // Create project
        // RPC
      }, { noAck: false });
    });
  });
  done()
}
