'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('project_assignments', [
      {
        userId: 2,
        projectId: 1,
        rank: 'Dev',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 3,
        projectId: 1,
        rank: 'Product owner',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 2,
        projectId: 2,
        rank: 'Dev',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 3,
        projectId: 2,
        rank: 'Lead',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('project_assignments', null, {});
  }
};
