import * as SequelizeStatic from "sequelize";
import {sequelize} from "../models/sequelizeConnector";
import {DiseaseModel, DiseaseAttributes} from "./../models/disease";
import {YearModel, YearAttributes} from "./../models/year";

export interface Disease_SymptomAttributes
{
    name: string,
    orphanetID: string,
    weight: number
}

export interface Disease_SymptomInstance extends SequelizeStatic.Instance<Disease_SymptomAttributes>
{
    name: string,
    orphanetID: string,
    weight: number
}

export let Disease_SymptomModel = sequelize.define<Disease_SymptomInstance, Disease_SymptomAttributes>
('provok',
    {
        name: {
            type: SequelizeStatic.STRING,
            allowNull: false,
            primaryKey: true
        },
        orphanetID: {
            type: SequelizeStatic.STRING,
            allowNull: false,
            primaryKey: true

        },
        weight:
            {
                type: SequelizeStatic.INTEGER,
                allowNull: true
            }
    },
    {
        freezeTableName: true
    }
);