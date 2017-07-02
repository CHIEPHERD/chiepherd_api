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
        let result = {};
        if (this.task != undefined) {
          result.task = this.task;
        }
        if (this.user != undefined) {
          result.user = this.user;
        }
        return result;
      }
    }
  });
  return task_assignment;
};
