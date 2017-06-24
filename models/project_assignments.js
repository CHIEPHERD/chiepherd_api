'use strict';
module.exports = function(sequelize, DataTypes) {
  var project_assignment = sequelize.define('project_assignments', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    rank: {
      type: DataTypes.ENUM('Scrum', 'Lead', 'Dev', 'Product owner')
    },
    uuid: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {
    paranoid: true,
    classMethods: {
      associate: function(models) {
        project_assignment.belongsTo(models.users);
        project_assignment.belongsTo(models.projects);
      }
    },
    instanceMethods: {
      responsify: function () {
        result = {};
        result.uuid = this.uuid;
        result.rank = this.rank;
        result.email = (this.email == undefined ? null : this.email);
        result.projectUuid = (this.projectUuid == undefined ? null : this.projectUuid);
        if (this.project != undefined) {
          result.project = this.project.responsify();
        }
        return reault;
      }
    }
  });
  return project_assignment;
};
