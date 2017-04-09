'use strict';
module.exports = function(sequelize, DataTypes) {
  var project = sequelize.define('project', {
    name: DataTypes.STRING,
    label: DataTypes.TEXT,
    description: DataTypes.TEXT,
    created_at: DataTypes.DATE,
    created_by: DataTypes.DATE,
    visibility: DataTypes.BOOLEAN
  }, {
    classMethods: {
      timestamps: false,
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return project;
};
