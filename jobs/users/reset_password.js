const models = require('../../models');
let User = models.users;
var passwordHash = require('password-hash');

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    ch.assertExchange(ex, 'topic');
    ch.assertQueue('chiepherd.user.reset_password', { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, "chiepherd.user.reset_password")

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
          if(json.password == json.passwordConfirmation) {
            user.update({
              password: passwordHash.generate(json.password)
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
          } else {
            ch.sendToQueue(msg.properties.replyTo,
              new Buffer("Password and confirmation doesn't match."),
              { correlationId: msg.properties.correlationId });
            ch.ack(msg);
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
