"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SequelizeStatic = require("sequelize");
const sequelizeConnector_1 = require("../models/sequelizeConnector");
exports.YearModel = sequelizeConnector_1.sequelize.define('year', {
    year: {
        type: SequelizeStatic.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    numberOfPublications: {
        type: SequelizeStatic.INTEGER,
        allowNull: true
    }
}, {
    freezeTableName: true
});
//# sourceMappingURL=year.js.map