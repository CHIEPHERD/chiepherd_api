'use strict'
//sequelize model:create --name Users --attributes first_name:string,last_name:string

module.exports = function(sequelize, DataTypes) {
  var Users = sequelize.define('users', {
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Users;
};
