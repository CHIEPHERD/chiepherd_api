const models = require('../../models');
let Task = models.tasks;
let Project = models.projects;
let ProjectAssignment = models.project_assignments;
let User = models.users;

function jsonizeTask(task) {
  return {
    id: task.id,
    uuid: task.uuid,
    description: task.description,
    title: task.title,
    type: task.type,
    children: []
  }
}

function findTaskFromList(task, list) {
  for (element of list) {
    let value = findTask(task, element)
    if(value) return value
  }

  return undefined
}

function findTask(task, element) {
  for (children of element.children) {
    let value = findTask(task, children)
    if(value) { return value }
  }

  if(task.ancestorId == element.id) { return element }
}

function tasksToTree(tasks) {
  let remain = []
  let result = []

  for (var task of tasks) {
    if(task.ancestorId == null) { result.push(jsonizeTask(task)) }
    else {
      let treeElement = findTaskFromList(task, result)

      if(treeElement) {
        treeElement.children.push(jsonizeTask(task))
        for (rem of remain) {
          let e = findTaskFromList(rem, result)
          if(e) {
            e.children.push(jsonizeTask(rem))
            remain.splice(remain.indexOf(rem), 1)
          }
        }
      } else {
        remain.push(task)
      }
    }
  }

  while(remain) {
    let size = remain.length
    for (rem of remain) {
      let e = findTaskFromList(rem, result)
      if(e) {
        e.children.push(jsonizeTask(rem))
        remain.splice(remain.indexOf(rem), 1)
      }
    }
    if(size == remain.length) { break }
  }

  return result
}

module.exports = function(connection, done) {
  connection.createChannel(function(err, ch) {
    console.log(err);
    var ex = process.env.ex;
    var queue = 'chiepherd.project.tasks';

    ch.assertExchange(ex, 'topic');
    ch.assertQueue(queue, { exclusive: false }, function(err, q) {
      ch.bindQueue(q.queue, ex, queue)

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
              let elements = []
              for (task of tasks) {
                elements.push(task)
              }
              ch.sendToQueue(msg.properties.replyTo,
                new Buffer.from(JSON.stringify(tasksToTree(elements))),
                { correlationId: msg.properties.correlationId });
              ch.ack(msg);
            }).catch(function(error) {
              console.log(error);
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
