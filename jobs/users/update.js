const models = require('../../models');
let User = models.users;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.user.update', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.user.update")

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
          if(user) {
            user.update({
              lastname: json.lastname || user.lastname,
              firstname: json.firstname || user.firstname,
              nickname: json.nickname || user.nickname,
              description: json.description || user.description
            }).then(function(user) {
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer.from(JSON.stringify(user.responsify())),
                { correlationId: msg.properties.correlationId });
              connection.createChannel(function(error, channel) {
                channel.assertExchange(ex, 'topic');
                channel.publish(ex, queue + '.reply', new Buffer.from(JSON.stringify(user.responsify())));
              });
              ch.ack(msg);
            }).catch(function(error) {
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer(error.toString()),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            });
          }
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
