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
        result.rank = this.rank;
        result.email = (this.email == undefined ? null : this.email);
        result.projectUuid = (this.projectUuid == undefined ? null : this.projectUuid);
        return reault;
      }
    }
  });
  return project_assignment;
};
