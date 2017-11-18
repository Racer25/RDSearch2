"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SequelizeStatic = require("sequelize");
const sequelizeConnector_1 = require("../models/sequelizeConnector");
exports.Disease_YearModel = sequelizeConnector_1.sequelize.define('is_studied_during', {
    year: {
        type: SequelizeStatic.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    orphanetID: {
        type: SequelizeStatic.STRING(),
        allowNull: false,
        primaryKey: true
    },
    numberOfPublications: {
        type: SequelizeStatic.INTEGER,
        allowNull: true
    }
}, {
    freezeTableName: true
});
//# sourceMappingURL=disease_year.js.map