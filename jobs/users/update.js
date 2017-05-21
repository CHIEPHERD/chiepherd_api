const models = require('../../models');
let User = models.users;

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = 'chiepherd.main';
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
              lastname: json.lastname,
              firstname: json.firstname,
              nickname: json.nickname,
              description: json.description
            }).then(function(user) {
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer.from(JSON.stringify(user.responsify())),
                { correlationId: msg.properties.correlationId });
              connection.createChannel(function(error, channel) {
                var ex = 'chiepherd.user.updated';
                channel.assertExchange(ex, 'fanout', { durable: false });
                channel.publish(ex, '', new Buffer.from(JSON.stringify(user.responsify())));
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
