"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SequelizeStatic = require("sequelize");
exports.sequelize = new SequelizeStatic('rdsearchdb2', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: false // true by default
    }
});
//# sourceMappingURL=sequelizeConnector.js.map