import * as SequelizeStatic from "sequelize";
import {sequelize} from "../models/sequelizeConnector";

export interface YearAttributes
{
    year: number,
    numberOfPublications: number
}

export interface YearInstance extends SequelizeStatic.Instance<YearAttributes>
{
    year: number,
    numberOfPublications: number
}

export let YearModel = sequelize.define<YearInstance, YearAttributes>
('year',
    {
        year:
            {
                type: SequelizeStatic.INTEGER,
                primaryKey: true,
                allowNull: false
            },
        numberOfPublications:
            {
                type: SequelizeStatic.INTEGER,
                allowNull: true
            }
    },
    {
        freezeTableName: true
    }
);