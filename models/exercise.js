const Sequelize = require('sequelize');

module.exports = class Exercise extends Sequelize.Model {
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
      modelName: 'Bigpart',
      tableName: 'bigparts',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Exercise.hasMany(db.Comment);
    db.Exercise.hasMany(db.Image);
    db.Exercise.hasMany(db.Video);
    db.Exercise.belongsTo(db.Smallpart);
  }
};
