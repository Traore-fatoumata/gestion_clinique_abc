const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Patient = sequelize.define('Patient', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    pid: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
    },
    nom: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    dateNaissance: {
      type: DataTypes.DATEONLY,
      field: 'date_naissance',
    },
    sexe: {
      type: DataTypes.CHAR(1),
      validate: {
        isIn: [['M', 'F']],
      },
    },
    telephone: {
      type: DataTypes.STRING(30),
    },
    quartier: {
      type: DataTypes.STRING(100),
    },
    secteur: {
      type: DataTypes.STRING(100),
    },
    profession: {
      type: DataTypes.STRING(100),
    },
    responsable: {
      type: DataTypes.STRING(120),
    },
    sourceDonnees: {
      type: DataTypes.ENUM('PAPIER', 'IMPORT_EXCEL', 'NOUVEAU_PATIENT'),
      defaultValue: 'NOUVEAU_PATIENT',
      field: 'source_donnees',
      validate: {
        isIn: [['PAPIER', 'IMPORT_EXCEL', 'NOUVEAU_PATIENT']],
      },
    },
    dateMigration: {
      type: DataTypes.DATE,
      field: 'date_migration',
    },
    migrePar: {
      type: DataTypes.INTEGER,
      field: 'migre_par',
      references: {
        model: 'utilisateurs',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  }, {
    tableName: 'patients',
    timestamps: true,
    underscored: true,
  });

  return Patient;
};
