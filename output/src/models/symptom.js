"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SequelizeStatic = require("sequelize");
const sequelizeConnector_1 = require("./../models/sequelizeConnector");
exports.SymptomModel = sequelizeConnector_1.sequelize.define('symptom', {
    name: {
        type: SequelizeStatic.STRING,
        allowNull: false,
        primaryKey: true
    }
}, {
    freezeTableName: true
});
//# sourceMappingURL=symptom.js.map