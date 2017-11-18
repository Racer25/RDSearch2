"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SequelizeStatic = require("sequelize");
var sequelizeConnector_1 = require("./../models/sequelizeConnector");
exports.OtherModel = sequelizeConnector_1.sequelize.define('other', {
    idOther: {
        type: SequelizeStatic.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    lastUpdatedate: {
        type: SequelizeStatic.DATE,
        allowNull: true
    }
}, {
    freezeTableName: true
});
