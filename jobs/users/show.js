const models = require('../../models');
let User = models.users;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.user.show';

    ch.assertExchange(ex, 'topic');
    ch.assertQueue(queue, { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, queue)

      ch.consume(q.queue, function(msg) {
        // LOG
        console.log(" [%s]: %s", msg.fields.routingKey, msg.content.toString());
        let json = JSON.parse(msg.content.toString());

        // update user
        User.find({
          where: {
            email: json.email
          }
        }).then(function(user) {
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer.from(JSON.stringify(user.responsify())),
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
