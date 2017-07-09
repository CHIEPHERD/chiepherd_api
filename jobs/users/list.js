const models = require('../../models');
let User = models.users;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.user.list', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.user.list")

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        // List all users
        User.findAll().then(function(users) {
          for (var i = 0; i < users.length; i++) {
            users[i] = users[i].responsify();
          }
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer.from(JSON.stringify(users)),
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
