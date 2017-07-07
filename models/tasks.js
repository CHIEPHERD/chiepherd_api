'use strict'
//sequelize model:create --name Users --attributes first_name:string,last_name:string

module.exports = function(sequelize, DataTypes) {
  var Tasks = sequelize.define('tasks', {
    id: {
      type: DataTypes.BIGINT,
      unique: true,
      primaryKey: true,
      autoIncrement: true
    },
    uuid: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    type: {
      type: DataTypes.ENUM('Epic', 'User story', 'Task'),
    }
  }, {
    classMethods: {
      associate: function(models) {
        Tasks.belongsTo(models.tasks, {
          as: 'ancestor'
        });
        Tasks.belongsToMany(models.users, {
          through: 'task_assignments'
        });
        Tasks.belongsTo(models.projects);
      }
    },
    instanceMethods: {
      responsify: function() {
        let result = {}
        result.uuid = this.uuid
        result.title = this.title
        result.description = this.description
        result.type = this.type
        result.ancestorUuid = (this.ancestor != null || this.ancestor != undefined ? this.ancestor.uuid : null)
        result.projectUuid = (this.projectUuid != undefined ? this.projectUuid : null)
        result.children = []
        return result
      },
      simplify: function () {
        let result = {}
        result.id = this.id,
        result.ancestorId = this.ancestorId
        result.uuid = this.uuid
        return result
      }
    },
    hooks: {
      afterDestroy: function(task) {
        Tasks.destroy({
          individualHooks: true,
          where: {
            ancestorId: task.id
          }
        }).then(function (children) {
          console.log(children);
        }).catch(function (err) {
          console.log(err);
        })
      }
    }
  });
  return Tasks;
}
