import * as SequelizeStatic from "sequelize";
import {sequelize} from "./../models/sequelizeConnector";

export interface OtherAttributes
{
    idOther: number,
    lastUpdatedate: Date
}

export interface OtherInstance extends SequelizeStatic.Instance<OtherAttributes>
{
    idOther: number,
    lastUpdatedate: Date
}

export let OtherModel = sequelize.define<OtherInstance, OtherAttributes>
('other',
    {
        idOther:
            {
                type: SequelizeStatic.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
        lastUpdatedate:
            {
                type: SequelizeStatic.DATE,
                allowNull: true
            }
    },
    {
        freezeTableName: true
    }
);