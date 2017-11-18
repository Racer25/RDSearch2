"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = {
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "rdsearch2",
    entities: [
        __dirname + "/output/models/*.js"
    ],
    synchronize: true,
};
//# sourceMappingURL=connexionOptions.js.map