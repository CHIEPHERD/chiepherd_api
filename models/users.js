'use strict'
var amqp = require('amqplib/callback_api');
var passwordHash = require('password-hash');

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
    instanceMethods: {
      responsify: function() {
        let result = {}
        result.lastname = this.lastname
        result.firstname = this.firstname
        result.nickname = this.nickname
        result.description = this.description
        result.isAdmin = this.isAdmin
        result.isActive = this.isActive
        result.email = this.email
        return result
      }
    },
    hooks: {
      beforeCreate: function(user) {
        user.password = passwordHash.generate(user.password);
      },
      afterCreate: function(user) {
        amqp.connect(process.env.amqp_ip, function(err, conn) {
          conn.createChannel(function(err, ch) {
            var ex = 'chiepherd.main';
            var key = 'chiepherd.user.create.reply';

            ch.assertExchange(ex, 'topic');
            ch.publish(ex, key, new Buffer(JSON.stringify(user.responsify())));
            console.log(' [%s]: %s', ex, JSON.stringify(user.responsify()));
          });
        });
      }
    }
  });
  return Users;
};
