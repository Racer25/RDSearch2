"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const disease_1 = require("../../models/disease");
const Sequelize = require("sequelize");
const associations_1 = require("../../models/associations");
const disease_year_1 = require("../../models/disease_year");
const year_1 = require("../../models/year");
associations_1.default();
/**
 * GET /
 * Home page.
 * @param {Request} req
 * @param {Response} res
 */
exports.index = (req, res) => {
    res.render("pages/search.ejs");
};
/**
 * GET /suggestion/:searchString
 * Get suggestions of diseases using the searchString.
 * @param {Request} req
 * @param {Response} res
 */
exports.getSuggestions = (req, res) => {
    let terms = req.params.searchString;
    terms = terms.split(",");
    if (terms.length !== 0) {
        //Construction of or clauses
        let clauses = [];
        for (let i = 0; i < terms.length; i++) {
            clauses.push({ name: { [Sequelize.Op.like]: "%" + terms[i] + "%" } });
        }
        disease_1.DiseaseModel.findAll({ where: { [Sequelize.Op.or]: clauses } })
            .then((results) => {
            res.header("Content-Type", "application/json; charset=utf-8");
            res.json(results);
        })
            .catch((err) => {
            console.error(err);
        });
    }
    else {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json([]);
    }
};
/**
 * GET /exactMatch/:searchString
 * Get disease corresponding to searchString.
 * @param {Request} req
 * @param {Response} res
 */
exports.getExactMatch = (req, res) => {
    let search = req.params.searchString;
    disease_1.DiseaseModel.findAll({ where: { name: search } })
        .then((results) => {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(results);
    })
        .catch((err) => {
        console.error(err);
    });
};
/**
 * GET /topDiseases/:year
 * Get the top of the most "famous" disease of a year
 * @param {Request} req
 * @param {Response} res
 */
exports.getTopDiseases = (req, res) => {
    let year = req.params.year;
    disease_year_1.Disease_YearModel.findAll({
        where: { year: year },
        include: [
            {
                model: disease_1.DiseaseModel,
                where: { orphanetID: Sequelize.col('rareDisease.orphanetID') },
            }
        ],
        order: Sequelize.literal('numberOfPublications DESC'),
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
 * GET /years
 * Get all years in DB
 * @param {Request} req
 * @param {Response} res
 */
exports.getYears = (req, res) => {
    year_1.YearModel.findAll()
        .then((results) => {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(results);
    })
        .catch((err) => {
        console.error(err);
    });
};
//# sourceMappingURL=home.js.map