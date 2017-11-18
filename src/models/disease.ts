import * as SequelizeStatic from "sequelize";
import {sequelize} from "./../models/sequelizeConnector";

export interface DiseaseAttributes
{
    orphanetID: string,
    name: string
}

export interface DiseaseInstance extends SequelizeStatic.Instance<DiseaseAttributes>
{
    orphanetID: string,
    name: string
}

export let DiseaseModel = sequelize.define<DiseaseInstance, DiseaseAttributes>
    ('raredisease',
        {
            orphanetID:
                {
                    type: SequelizeStatic.STRING,
                    primaryKey: true,
                    allowNull: false
                },
            name:
                {
                    type: SequelizeStatic.STRING,
                    allowNull: true
                }
        },
        {
            freezeTableName: true
        }
    );