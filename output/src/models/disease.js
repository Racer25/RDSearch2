"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SequelizeStatic = require("sequelize");
const sequelizeConnector_1 = require("./../models/sequelizeConnector");
exports.DiseaseModel = sequelizeConnector_1.sequelize.define('raredisease', {
    orphanetID: {
        type: SequelizeStatic.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: SequelizeStatic.STRING,
        allowNull: true
    }
}, {
    freezeTableName: true
});
//# sourceMappingURL=disease.js.map