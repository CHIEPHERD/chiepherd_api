'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('projects', [
      {
        name: 'Chiepherd',
        description: 'Outil de management de projet',
        label: 'AGILE',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Foodora',
        description: 'Livraison de plateau repas',
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
