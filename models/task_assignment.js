'use strict';
module.exports = function(sequelize, DataTypes) {
  var task_assignment = sequelize.define('task_assignments', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    }
  }, {
    paranoid: true,
    classMethods: {
      associate: function(models) {
        task_assignment.belongsTo(models.users);
        task_assignment.belongsTo(models.tasks);
      }
    },
    instanceMethods: {
      responsify: function () {
        result = {};
        if (this.project != undefined) {
          result.task = this.task.responsify();
        }
        if (this.user != undefined) {
          result.user = this.user.responsify();
        }
        return result;
      }
    }
  });
  return task_assignment;
};
