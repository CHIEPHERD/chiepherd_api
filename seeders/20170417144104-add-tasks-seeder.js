'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tasks', [{
      title: "Diagramme de Classe",
      description: "Creation du diagramme de classe avec l'outil draw.io",
      type: 'Task',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      title: "Mockup java",
      description: "Creation des mockups du clent lourd java avec l'outil draw.io",
      type: 'Task',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      title: "Alpha",
      description: "Rendu de la version Alpha",
      type: 'Task',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
