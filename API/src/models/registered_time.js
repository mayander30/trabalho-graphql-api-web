const { Model, DataTypes } = require('sequelize');
const Sequelize = require('../database');
const User = require('./User');

class Registered_Time extends Model {
  static associate() {
    User.hasMany(Registered_Time);
    Registered_Time.belongsTo(User);
  }
}

Registered_Time.init({
  time_registered: DataTypes.STRING
}, {
  sequelize: Sequelize, modelName: 'registered_time'
});

Registered_Time.associate();

module.exports = Registered_Time;