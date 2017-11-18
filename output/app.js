"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies.
 */
const express = require("express");
const bodyParser = require("body-parser");
const errorHandler = require("errorhandler");
/**
 * Controllers (route handlers).
 */
const homeController = require("./controllers/routes/home");
const diseaseController = require("./controllers/routes/disease");
const errorController = require("./controllers/routes/errors");
/**
 * Server configuration (session, static, ...)
 */
const app = express();
app.set("port", 8080);
app.use('/static', express.static(__dirname + '/../src/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', "./src/views");
/**
 * App routes.
 */
app.get("/", homeController.index);
app.get("/years", homeController.getYears);
app.get("/suggestions/:searchString", homeController.getSuggestions);
app.get("/exactMatch/:searchString", homeController.getExactMatch);
app.get("/topDiseases/:year", homeController.getTopDiseases);
app.get("/disease/:orphanetID", diseaseController.getDisease);
app.get("/disease/:orphanetID/all", diseaseController.getDiseaseAll);
app.get("/disease/:orphanetID/info", diseaseController.getDiseaseInfo);
app.get("/disease/:orphanetID/textualInformation", diseaseController.getDiseaseTextualInformation);
app.get("/disease/:orphanetID/mostCitedPublications", diseaseController.getMostCitedPublications);
app.get("/disease/:orphanetID/graphData", diseaseController.getGraphData);
app.get("/disease/:orphanetID/symptoms", diseaseController.getSymptoms);
/**
 * ERRORS
 */
app.use(errorController.error404);
/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());
/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
    console.log(("  App is running at http://localhost:%d"), app.get("port"));
    console.log("  Press CTRL-C to stop\n");
});
module.exports = app;
//# sourceMappingURL=app.js.map