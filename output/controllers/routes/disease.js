"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
const disease_year_1 = require("../../models/disease_year");
const disease_1 = require("../../models/disease");
const disease_symptom_1 = require("../../models/disease_symptom");
const textualInformation_1 = require("../../models/textualInformation");
const disease_publication_1 = require("../../models/disease_publication");
/**
 * GET /disease/:orphanetID
 * Disease page.
 */
exports.getDisease = (req, res) => {
    let orphanetID = req.params.orphanetID;
    res.render("pages/disease.ejs", { orphanetID: orphanetID });
};
/**
 * GET /disease/:orphanetID/all
 * Get all infos related to a Disease.
 */
exports.getDiseaseAll = (req, res) => {
    let orphanetID = req.params.orphanetID;
    let diseaseComplete = {};
    disease_1.DiseaseModel.findOne({ where: { orphanetID: orphanetID } })
        .then((results) => {
        diseaseComplete.orphanetID = results.orphanetID;
        diseaseComplete.name = results.name;
        return textualInformation_1.TextualInformationModel.findAll({ where: { orphanetID: orphanetID } });
    })
        .catch((err) => {
        console.error(err);
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(diseaseComplete);
    })
        .then((textualInformation) => {
        diseaseComplete.textualInformation = textualInformation;
        return disease_publication_1.Disease_PublicationModel.findAll({
            where: { orphanetID: orphanetID },
            include: [
                {
                    model: disease_1.DiseaseModel,
                    where: { orphanetID: Sequelize.col('rareDisease.orphanetID') },
                }
            ],
            order: Sequelize.literal('timesCited DESC'),
            limit: 3
        });
    })
        .catch((err) => {
        console.error(err);
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(diseaseComplete);
    })
        .then((mostCitedPublications) => {
        diseaseComplete.mostCitedPublications = mostCitedPublications;
        return disease_year_1.Disease_YearModel.findAll({ where: { orphanetID: orphanetID } });
    })
        .catch((err) => {
        console.error(err);
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(diseaseComplete);
    })
        .then((graphData) => {
        diseaseComplete.graphData = graphData;
        return disease_symptom_1.Disease_SymptomModel.findAll({ where: { orphanetID: orphanetID } });
    })
        .catch((err) => {
        console.error(err);
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(diseaseComplete);
    })
        .then((disease_symptom) => {
        diseaseComplete.symptoms = disease_symptom;
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(diseaseComplete);
    });
};
/**
 * GET /disease/:orphanetID/info
 * Disease infos.
 */
exports.getDiseaseInfo = (req, res) => {
    let orphanetID = req.params.orphanetID;
    disease_1.DiseaseModel.findOne({ where: { orphanetID: orphanetID } })
        .then((results) => {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(results);
    })
        .catch((err) => {
        console.error(err);
    });
};
/**
 * GET /disease/:orphanetID/textualsInformation
 * Disease textual information.
 */
exports.getDiseaseTextualInformation = (req, res) => {
    let orphanetID = req.params.orphanetID;
    textualInformation_1.TextualInformationModel.findAll({ where: { orphanetID: orphanetID } })
        .then((results) => {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(results);
    })
        .catch((err) => {
        console.error(err);
    });
};
/**
 * GET /disease/:orphanetID/mostCitedPublications
 * Most cited publications related to a disease.
 */
exports.getMostCitedPublications = (req, res) => {
    let orphanetID = req.params.orphanetID;
    disease_publication_1.Disease_PublicationModel.findAll({
        where: { orphanetID: orphanetID },
        include: [
            {
                model: disease_1.DiseaseModel,
                where: { orphanetID: Sequelize.col('rareDisease.orphanetID') },
            }
        ],
        order: Sequelize.literal('timesCited DESC'),
        limit: 3
    })
        .then((results) => {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(results);
    })
        .catch((err) => {
        console.error(err);
    });
};
/**
 * GET /disease/:orphanetID/graphData
 * @param {Request} req
 * @param {Response} res
 */
exports.getGraphData = (req, res) => {
    let orphanetID = req.params.orphanetID;
    disease_year_1.Disease_YearModel.findAll({ where: { orphanetID: orphanetID } })
        .then(results => {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(results);
    })
        .catch((err) => {
        console.error(err);
    });
};
/**
 * GET /disease/:orphanetID/symptoms
 * @param {Request} req
 * @param {Response} res
 */
exports.getSymptoms = (req, res) => {
    let orphanetID = req.params.orphanetID;
    disease_symptom_1.Disease_SymptomModel.findAll({ where: { orphanetID: orphanetID } })
        .then(results => {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(results);
    })
        .catch((err) => {
        console.error(err);
    });
};
//# sourceMappingURL=disease.js.map