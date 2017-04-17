'use strict';
module.exports = function(sequelize, DataTypes) {
  var project = sequelize.define('project', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    name: DataTypes.STRING,
    label: DataTypes.TEXT,
    description: DataTypes.TEXT,
    created_at: DataTypes.DATE,
    created_by: DataTypes.DATE,
    visibility: DataTypes.BOOLEAN
  }, {
    classMethods: {

      associate: function(models) {
          project.belongsToMany(models.users,
            {through : "project_users_nn"}
          );
      }
    }
  });
  return project;
};
