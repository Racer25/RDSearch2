"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SequelizeStatic = require("sequelize");
const sequelizeConnector_1 = require("./../models/sequelizeConnector");
exports.TextualInformationModel = sequelizeConnector_1.sequelize.define('textualinformation', {
    idTextualInformation: {
        type: SequelizeStatic.STRING,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    title: {
        type: SequelizeStatic.STRING,
        allowNull: true
    },
    content: {
        type: SequelizeStatic.STRING,
        allowNull: true
    },
    sourceName: {
        type: SequelizeStatic.STRING,
        allowNull: true
    },
    sourceLink: {
        type: SequelizeStatic.STRING,
        allowNull: true
    }
}, {
    freezeTableName: true
});
//# sourceMappingURL=textualInformation.js.map