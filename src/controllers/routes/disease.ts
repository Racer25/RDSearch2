import { Request, Response } from "express";
import * as Sequelize from "sequelize";
import {Disease_YearModel, Disease_YearInstance} from "../../models/disease_year";
import {DiseaseModel, DiseaseInstance} from "../../models/disease";
import {Disease_SymptomModel, Disease_SymptomInstance} from "../../models/disease_symptom";
import {TextualInformationModel, TextualInformationInstance} from "../../models/textualInformation";
import {Disease_PublicationInstance, Disease_PublicationModel} from "../../models/disease_publication";

/**
 * GET /disease/:orphanetID
 * Disease page.
 */
export let getDisease = (req: Request, res: Response) => {
    let orphanetID=req.params.orphanetID;
    res.render("pages/disease.ejs", {orphanetID: orphanetID});
};

/**
 * GET /disease/:orphanetID/all
 * Get all infos related to a Disease.
 */
export let getDiseaseAll = (req: Request, res: Response) => {
    let orphanetID=req.params.orphanetID;

    let diseaseComplete:any ={};

    DiseaseModel.findOne({where:{orphanetID:orphanetID}})
        .then((results: DiseaseInstance ) =>
            {
                diseaseComplete.orphanetID=results.orphanetID;
                diseaseComplete.name=results.name;
                return TextualInformationModel.findAll({where:{orphanetID:orphanetID}});
            }
        )
        .catch((err: Error) =>
            {
                console.error(err);
                res.header("Content-Type", "application/json; charset=utf-8");
                res.json(diseaseComplete);
            }
        )
        .then(
            (textualInformation:Array<TextualInformationInstance>) =>
            {
                diseaseComplete.textualInformation=textualInformation;
                return Disease_PublicationModel.findAll(
                    {
                        where: {orphanetID: orphanetID},

                        include: [
                            {
                                model: DiseaseModel,
                                where: { orphanetID: Sequelize.col('rareDisease.orphanetID') },
                            }
                        ],
                        order: Sequelize.literal('timesCited DESC'),
                        limit: 3
                    });
            }
        )
        .catch((err: Error) =>
            {
                console.error(err);
                res.header("Content-Type", "application/json; charset=utf-8");
                res.json(diseaseComplete);
            }
        )
        .then((mostCitedPublications: Array<Disease_PublicationInstance>) =>
            {
                diseaseComplete.mostCitedPublications = mostCitedPublications;
                return Disease_YearModel.findAll({where:{orphanetID:orphanetID}});
            }
        )
        .catch((err: Error) =>
            {
                console.error(err);
                res.header("Content-Type", "application/json; charset=utf-8");
                res.json(diseaseComplete);
            }
        )
        .then((graphData: Array<Disease_YearInstance>) =>
            {
                diseaseComplete.graphData = graphData;
                return Disease_SymptomModel.findAll({where:{orphanetID:orphanetID}});
            }
        )
        .catch((err: Error) =>
            {
                console.error(err);
                res.header("Content-Type", "application/json; charset=utf-8");
                res.json(diseaseComplete);
            }
        )
        .then((disease_symptom: Array<Disease_SymptomInstance>)=>
            {
                diseaseComplete.symptoms = disease_symptom;
                res.header("Content-Type", "application/json; charset=utf-8");
                res.json(diseaseComplete);
            }
        );
};

/**
 * GET /disease/:orphanetID/info
 * Disease infos.
 */
export let getDiseaseInfo = (req: Request, res: Response) => {
    let orphanetID=req.params.orphanetID;
    DiseaseModel.findOne({where:{orphanetID:orphanetID}})
        .then((results: DiseaseInstance ) =>
            {
                res.header("Content-Type", "application/json; charset=utf-8");
                res.json(results);
            }
        )
        .catch((err: Error) =>
            {
                console.error(err);
            }
        );
};


/**
 * GET /disease/:orphanetID/textualsInformation
 * Disease textual information.
 */
export let getDiseaseTextualInformation = (req: Request, res: Response) => {
    let orphanetID=req.params.orphanetID;

    TextualInformationModel.findAll({where:{orphanetID:orphanetID}})
        .then((results: any ) =>
            {
                res.header("Content-Type", "application/json; charset=utf-8");
                res.json(results);
            }
        )
        .catch((err: Error) =>
            {
                console.error(err);
            }
        );
};

/**
 * GET /disease/:orphanetID/mostCitedPublications
 * Most cited publications related to a disease.
 */
export let getMostCitedPublications = (req: Request, res: Response) => {
    let orphanetID=req.params.orphanetID;

    Disease_PublicationModel.findAll(
        {
            where: {orphanetID: orphanetID},

            include: [
                {
                    model: DiseaseModel,
                    where: { orphanetID: Sequelize.col('rareDisease.orphanetID') },
                }
            ],
            order: Sequelize.literal('timesCited DESC'),
            limit: 3
        })
        .then(
            (results: Array<Disease_PublicationInstance>) =>
            {
                res.header("Content-Type", "application/json; charset=utf-8");
                res.json(results);
            }
        )
        .catch(
            (err: Error) =>
            {
                console.error(err);
            }
        );
};


/**
 * GET /disease/:orphanetID/graphData
 * @param {Request} req
 * @param {Response} res
 */
export let getGraphData = (req: Request, res: Response) =>
{
    let orphanetID=req.params.orphanetID;
    Disease_YearModel.findAll({where:{orphanetID:orphanetID}})
        .then(results =>
        {
            res.header("Content-Type", "application/json; charset=utf-8");
            res.json(results);
        })
        .catch((err: Error) =>
        {
            console.error(err);
        });
};

/**
 * GET /disease/:orphanetID/symptoms
 * @param {Request} req
 * @param {Response} res
 */
export let getSymptoms = (req: Request, res: Response) => {
    let orphanetID=req.params.orphanetID;
    Disease_SymptomModel.findAll({where:{orphanetID:orphanetID}})
        .then(results =>
        {
            res.header("Content-Type", "application/json; charset=utf-8");
            res.json(results);
        })
        .catch((err: Error) =>
        {
            console.error(err);
        });
};