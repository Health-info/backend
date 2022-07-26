const Sequelize = require('sequelize');

module.exports = class Video extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      src: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'Video',
      tableName: 'videos',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Video.belongsTo(db.Exercise);
  }
};
