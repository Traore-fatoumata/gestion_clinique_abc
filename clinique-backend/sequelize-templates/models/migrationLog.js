const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MigrationLog = sequelize.define('MigrationLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    typeMigration: {
      type: DataTypes.ENUM('PAPIER', 'IMPORT_EXCEL'),
      allowNull: false,
      field: 'type_migration',
      validate: {
        isIn: [['PAPIER', 'IMPORT_EXCEL']],
      },
    },
    nombreImporte: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'nombre_importe',
    },
    nombreErreurs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'nombre_erreurs',
    },
    utilisateurId: {
      type: DataTypes.INTEGER,
      field: 'utilisateur_id',
      references: {
        model: 'utilisateurs',
        key: 'id',
      },
    },
    dateOperation: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'date_operation',
    },
    details: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'migration_logs',
    timestamps: false,
    underscored: true,
  });

  return MigrationLog;
};
