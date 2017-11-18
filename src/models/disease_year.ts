import * as SequelizeStatic from "sequelize";
import {sequelize} from "../models/sequelizeConnector";
import {DiseaseModel, DiseaseAttributes} from "./../models/disease";
import {YearModel, YearAttributes} from "./../models/year";

export interface Disease_YearAttributes
{
    year: number,
    orphanetID: string,
    numberOfPublications: number
}

export interface Disease_YearInstance extends SequelizeStatic.Instance<Disease_YearAttributes>
{
    year: number,
    orphanetID: string,
    numberOfPublications: number
}

export let Disease_YearModel = sequelize.define<Disease_YearInstance, Disease_YearAttributes>
('is_studied_during',

    {
        year: {
            type: SequelizeStatic.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        orphanetID: {
            type: SequelizeStatic.STRING(),
            allowNull: false,
            primaryKey: true

        },
        numberOfPublications: {
            type: SequelizeStatic.INTEGER,
            allowNull: true
        }
    },
    {
        freezeTableName: true
    }
);