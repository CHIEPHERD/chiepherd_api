'use strict';
module.exports = function(sequelize, DataTypes) {
  var project = sequelize.define('projects', {

    id: {
      allowNull: false,
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    uuid: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    label: DataTypes.TEXT,
    description: DataTypes.TEXT,
    visibility: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    paranoid: true,
    instanceMethods: {
      responsify: function () {
        let result = {};
        result.uuid = this.uuid;
        result.name = this.name;
        result.label = this.label;
        result.description = this.description;
        result.visibility = this.visibility;
        return result;
      }
    },
    classMethods: {
      associate: function(models) {
        project.belongsToMany(models.users, {
          through : 'project_assignments'
        });
        project.hasMany(models.tasks);
      }
    }
  });
  return project;
};
