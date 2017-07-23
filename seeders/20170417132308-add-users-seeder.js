'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [{
      email: 'alex@email.fr',
      password: 'password',
      firstname: 'Alexandre',
      lastname: 'Lairan',
      nickname: 'Necros',
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'amelie@email.fr',
      password: 'password',
      firstname: 'Amelie',
      lastname: 'Certin',
      nickname: 'Kuma',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'yohan@email.fr',
      password: 'password',
      firstname: 'Yohan',
      lastname: 'Fairfort',
      nickname: 'Yo',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
