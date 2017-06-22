'use strict';
const uuidV4 = require('uuid/v4');

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('projects', [
      {
        name: 'Chiepherd',
        description: 'Outil de management de projet',
        uuid: uuidV4(),
        label: 'AGILE',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Foodora',
        description: 'Livraison de plateau repas',
        uuid: uuidV4(),
        label: 'Takeaway',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('projects', null, {});
  }
};
