'use strict';
module.exports = function(sequelize, DataTypes) {
  var project = sequelize.define('project', {
    id: DataTypes.NUMBER,
    name: DataTypes.STRING,
    label: DataTypes.TINYTEXT,
    description: DataTypes.TEXT,
    created_at: DataTypes.DATE,
    created_by: DataTypes.DATE,
    visibility: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return project;
};