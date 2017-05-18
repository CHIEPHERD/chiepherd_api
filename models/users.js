'use strict'
var amqp = require('amqplib/callback_api');

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
    isActive: {
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
    },
    hooks: {
      afterCreate: function(user) {
        amqp.connect('amqp://root:root@192.168.56.1', function(err, conn) {
          conn.createChannel(function(err, ch) {
            var ex = 'chiepherd.user.created';
            var key = Math.random().toString() + Math.random().toString();

            ch.assertExchange(ex, 'fanout', { durable: false });
            ch.publish(ex, key, new Buffer.from(JSON.stringify(user)));
            console.log(' [%s]: %s', ex, JSON.stringify(user));
          });
        });
      }
    }
  });
  return Users;
};
