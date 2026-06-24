'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Modifier la table 'patients' pour ajouter les colonnes de migration
    await queryInterface.addColumn('patients', 'source_donnees', {
      type: Sequelize.STRING(30),
      defaultValue: 'NOUVEAU_PATIENT',
      allowNull: true,
    });
    
    await queryInterface.addColumn('patients', 'date_migration', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('patients', 'migre_par', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'utilisateurs',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // 2. Créer la table 'migration_logs'
    await queryInterface.createTable('migration_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      type_migration: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      nombre_importe: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      nombre_erreurs: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      utilisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'utilisateurs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      date_operation: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });

    // 3. Ajouter des index
    await queryInterface.addIndex('patients', ['source_donnees']);
    await queryInterface.addIndex('migration_logs', ['utilisateur_id']);
  },

  down: async (queryInterface, Sequelize) => {
    // Supprimer la table migration_logs
    await queryInterface.dropTable('migration_logs');

    // Supprimer les colonnes de la table patients
    await queryInterface.removeColumn('patients', 'source_donnees');
    await queryInterface.removeColumn('patients', 'date_migration');
    await queryInterface.removeColumn('patients', 'migre_par');
  }
};
