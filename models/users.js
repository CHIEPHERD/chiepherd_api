'use strict'
//sequelize model:create --name Users --attributes first_name:string,last_name:string

module.exports = function(sequelize, DataTypes) {
  var Users = sequelize.define('users', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstname: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    lastname: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    nickname: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActiv: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: ''
    }
  }, {
    classMethods: {
      associate: function(models) {
        Users.belongsToMany(models.projects, {
          through : 'project_assignments'
        });
        Users.belongsToMany(models.tasks, {
          through : 'users_tasks'
        });
      }
    }
  });
  return Users;
};
