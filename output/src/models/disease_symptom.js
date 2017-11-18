"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SequelizeStatic = require("sequelize");
const sequelizeConnector_1 = require("../models/sequelizeConnector");
exports.Disease_SymptomModel = sequelizeConnector_1.sequelize.define('provok', {
    name: {
        type: SequelizeStatic.STRING,
        allowNull: false,
        primaryKey: true
    },
    orphanetID: {
        type: SequelizeStatic.STRING,
        allowNull: false,
        primaryKey: true
    },
    weight: {
        type: SequelizeStatic.INTEGER,
        allowNull: true
    }
}, {
    freezeTableName: true
});
//# sourceMappingURL=disease_symptom.js.map