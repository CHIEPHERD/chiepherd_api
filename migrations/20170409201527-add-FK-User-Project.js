'use strict';
let models = require("../models")
let users = models.users;
let project = models.project;

module.exports = {
  up: function (queryInterface, Sequelize) {

    queryInterface.createTable('userproject', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        },
        projectId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'projects',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        }
      }).then(() => {
      // Create Unique CompoundIndex
      let sql = `CREATE UNIQUE INDEX "UserProjectCompoundIndex"
              ON "userproject"
              USING btree
              ("userId", "projectId");
            `;
      return queryInterface.sequelize.query(sql, {raw: true});
      })
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.dropTable("userproject");
  }
};
