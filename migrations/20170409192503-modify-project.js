'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    //ils enlève les 2 colonnes qui étaient la au début, mais pas ceux fait en cachette par sequelize
    queryInterface.removeColumn("projects","createdAt",Sequelize.DATE);
    queryInterface.removeColumn("projects","updatedAt",Sequelize.DATE);
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.addColumn("projects","createdAt",Sequelize.DATE);
    queryInterface.addColumn("projects","updatedAt",Sequelize.DATE);
  }
};
