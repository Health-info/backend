const Sequelize = require('sequelize');

module.exports = class Smallpart extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      name: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'Smallpart',
      tableName: 'smallparts',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Smallpart.belongsTo(db.Bigpart);
    db.Smallpart.hasMany(db.Exercise);
  }
};
