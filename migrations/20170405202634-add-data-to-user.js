'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.renameColumn('users', 'createdAt', 'created_at')
    queryInterface.renameColumn('users', 'updatedAt', 'updated_at')
    queryInterface.renameColumn('users', 'first_name', 'firstname')
    queryInterface.renameColumn('users', 'last_name', 'lastname')
    queryInterface.addColumn('users', 'nickname', Sequelize.STRING)
    queryInterface.addColumn('users', 'description', Sequelize.TEXT)
    queryInterface.addColumn('users', 'email',
      { type: Sequelize.STRING, indicesType: 'UNIQUE' })
    queryInterface.addColumn('users', 'is_admin',
      { type: Sequelize.BOOLEAN, defaultValue: false })
    queryInterface.addColumn('users', 'is_activ',
      { type: Sequelize.BOOLEAN, defaultValue: true })
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.renameColumn('users', 'created_at', 'createdAt')
    queryInterface.renameColumn('users', 'updated_at', 'updatedAt')
    queryInterface.renameColumn('users', 'firstname', 'first_name')
    queryInterface.renameColumn('users', 'lastname', 'last_name')
    queryInterface.removeColumn('users', 'is_admin')
    queryInterface.removeColumn('users', 'nickname')
    queryInterface.removeColumn('users', 'email')
    queryInterface.removeColumn('users', 'is_activ')
    queryInterface.removeColumn('users', 'description')
  }
};
