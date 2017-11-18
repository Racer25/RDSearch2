import * as SequelizeStatic from "sequelize";
import {sequelize} from "../models/sequelizeConnector";
import {DiseaseModel, DiseaseAttributes} from "./../models/disease";
import {YearModel, YearAttributes} from "./../models/year";

export interface Disease_PublicationAttributes
{
    idPublication: string,
    orphanetID: string,
    timesCited: number
}

export interface Disease_PublicationInstance extends SequelizeStatic.Instance<Disease_PublicationAttributes>
{
    idPublication: string,
    orphanetID: string,
    timesCited: number
}

export let Disease_PublicationModel = sequelize.define<Disease_PublicationInstance, Disease_PublicationAttributes>
('speak_about',
    {
        idPublication: {
            type: SequelizeStatic.STRING,
            allowNull: false,
            primaryKey: true
        },
        orphanetID: {
            type: SequelizeStatic.STRING,
            allowNull: false,
            primaryKey: true

        },
        timesCited:
            {
                type: SequelizeStatic.INTEGER,
                allowNull: true
            }
    },
    {
        freezeTableName: true
    }
);