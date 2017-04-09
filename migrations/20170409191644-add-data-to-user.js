'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.renameColumn('users', 'first_name', 'firstname')
    queryInterface.renameColumn('users', 'last_name', 'lastname')
    queryInterface.addColumn('users', 'nickname', Sequelize.STRING)
    queryInterface.addColumn('users', 'description', Sequelize.TEXT)
    queryInterface.addColumn('users', 'password', Sequelize.STRING)
    queryInterface.addColumn('users', 'email',
      { type: Sequelize.STRING, indicesType: 'UNIQUE' })
    queryInterface.addColumn('users', 'isAdmin',
      { type: Sequelize.BOOLEAN, defaultValue: false })
    queryInterface.addColumn('users', 'isActiv',
      { type: Sequelize.BOOLEAN, defaultValue: true })
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.renameColumn('users', 'firstname', 'first_name')
    queryInterface.renameColumn('users', 'lastname', 'last_name')
    queryInterface.removeColumn('users', 'isAdmin')
    queryInterface.removeColumn('users', 'password')
    queryInterface.removeColumn('users', 'nickname')
    queryInterface.removeColumn('users', 'email')
    queryInterface.removeColumn('users', 'isActiv')
    queryInterface.removeColumn('users', 'description')
  }
};
