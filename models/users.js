'use strict'
//sequelize model:create --name Users --attributes first_name:string,last_name:string

module.exports = function(sequelize, DataTypes) {
  var Users = sequelize.define('users', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Users;
};
