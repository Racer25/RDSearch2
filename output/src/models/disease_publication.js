"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SequelizeStatic = require("sequelize");
const sequelizeConnector_1 = require("../models/sequelizeConnector");
exports.Disease_PublicationModel = sequelizeConnector_1.sequelize.define('speak_about', {
    idPublication: {
        type: SequelizeStatic.STRING,
        allowNull: false,
        primaryKey: true
    },
    orphanetID: {
        type: SequelizeStatic.STRING,
        allowNull: false,
        primaryKey: true
    },
    timesCited: {
        type: SequelizeStatic.INTEGER,
        allowNull: true
    }
}, {
    freezeTableName: true
});
//# sourceMappingURL=disease_publication.js.map