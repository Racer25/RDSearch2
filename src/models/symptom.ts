import * as SequelizeStatic from "sequelize";
import {sequelize} from "./../models/sequelizeConnector";

export interface SymptomAttributes
{
    name: string
}

export interface SymptomInstance extends SequelizeStatic.Instance<SymptomAttributes>
{
    name: string
}

export let SymptomModel = sequelize.define<SymptomInstance, SymptomAttributes>
('symptom',
    {
        name:
            {
                type: SequelizeStatic.STRING,
                allowNull: false,
                primaryKey: true
            }
    },
    {
        freezeTableName: true
    }
);