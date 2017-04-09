'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('projects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      label: {
        type: Sequelize.TEXT
      },
      description: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE
      },
      created_by: {
        type: Sequelize.DATE
      },
      visibility: {
        type: Sequelize.BOOLEAN
      }
    },{
      timestamps: false
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('projects');
  }
};
