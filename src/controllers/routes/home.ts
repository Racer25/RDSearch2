import { Request, Response } from "express";
import {DiseaseModel, DiseaseInstance} from "../../models/disease";
import * as Sequelize from "sequelize";
import Associations from "../../models/associations"
import {Disease_YearModel, Disease_YearInstance} from "../../models/disease_year";
import {YearModel, YearInstance} from "../../models/year";
Associations();

/**
 * GET /
 * Home page.
 * @param {Request} req
 * @param {Response} res
 */
export let index = (req: Request, res: Response) => {
    res.render("pages/search.ejs");
};

/**
 * GET /suggestion/:searchString
 * Get suggestions of diseases using the searchString.
 * @param {Request} req
 * @param {Response} res
 */
export let getSuggestions = (req: Request, res: Response) =>
{
    let terms=req.params.searchString;
    terms=terms.split(",");

    if(terms.length !== 0)
    {
        //Construction of or clauses
        let clauses = [];
        for(let i = 0; i < terms.length; i++)
        {
            clauses.push({name:{[Sequelize.Op.like]: "%"+terms[i]+"%"}});
        }

        DiseaseModel.findAll(
            {where:{[Sequelize.Op.or]:clauses}}
        )
            .then(
                (results: Array<DiseaseInstance>) =>
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
    }
    else
    {
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
export let getExactMatch = (req: Request, res: Response) =>
    {
        let search=req.params.searchString;

        DiseaseModel.findAll(
            {where: {name: search}})
            .then(
                (results: Array<DiseaseInstance>) =>
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
 * GET /topDiseases/:year
 * Get the top of the most "famous" disease of a year
 * @param {Request} req
 * @param {Response} res
 */
export let getTopDiseases = (req: Request, res: Response) =>
{
    let year=req.params.year;

    Disease_YearModel.findAll(
        {
            where: {year: year},

            include: [
                {
                    model: DiseaseModel,
                    where: { orphanetID: Sequelize.col('rareDisease.orphanetID') },
                }
            ],
            order: Sequelize.literal('numberOfPublications DESC'),
            limit: 3
        })
        .then(
        (results: Array<Disease_YearInstance>) =>
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
 * GET /years
 * Get all years in DB
 * @param {Request} req
 * @param {Response} res
 */
export let getYears = (req: Request, res: Response) =>
{
    YearModel.findAll()
        .then(
            (results: Array<YearInstance>) =>
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