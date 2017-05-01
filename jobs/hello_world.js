module.exports = function(connection, done) {
  console.log("Hallo, estas mi")

  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = 'chiepherd.main';

    console.log("Assert Exchange");
    ch.assertExchange(ex, 'topic');

    console.log("assert Queue");
    ch.assertQueue('hello_world.queue', {exclusive: false}, function(err, q) {
      console.log("yolo")
      console.log(q);
      console.log(' [*] Waiting for logs. To exit press CTRL+C');

      ch.bindQueue(q.queue, ex, "chiepherd.*")

      ch.consume(q.queue, function(msg) {
        console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
      }, {noAck: false});
    });
    console.log("end queue");
  });

  console.log("Good bye");
  done()
}
