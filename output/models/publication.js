"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SequelizeStatic = require("sequelize");
const sequelizeConnector_1 = require("./../models/sequelizeConnector");
exports.PublicationModel = sequelizeConnector_1.sequelize.define('mostcitedpublication', {
    idPublication: {
        type: SequelizeStatic.STRING,
        primaryKey: true,
        allowNull: false
    },
    doi: {
        type: SequelizeStatic.STRING,
        allowNull: true
    },
    title: {
        type: SequelizeStatic.STRING,
        allowNull: true
    },
    abstract: {
        type: SequelizeStatic.STRING,
        allowNull: true
    },
    authors: {
        type: SequelizeStatic.STRING,
        allowNull: true
    },
    datePublication: {
        type: SequelizeStatic.DATE,
        allowNull: true
    }
}, {
    freezeTableName: true
});
//# sourceMappingURL=publication.js.map