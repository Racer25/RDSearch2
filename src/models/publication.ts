import * as SequelizeStatic from "sequelize";
import {sequelize} from "./../models/sequelizeConnector";

export interface PublicationAttributes
{
    idPublication: string,
    doi: string,
    title: string,
    abstract: string,
    authors: string,
    datePublication: Date
}

export interface PublicationInstance extends SequelizeStatic.Instance<PublicationAttributes>
{
    idPublication: string,
    doi: string,
    title: string,
    abstract: string,
    authors: string,
    datePublication: Date
}

export let PublicationModel = sequelize.define<PublicationInstance, PublicationAttributes>
('mostcitedpublication',
    {
        idPublication:
            {
                type: SequelizeStatic.STRING,
                primaryKey: true,
                allowNull: false
            },
        doi:
            {
                type: SequelizeStatic.STRING,
                allowNull: true
            },
        title:
            {
                type: SequelizeStatic.STRING,
                allowNull: true
            },
        abstract:
            {
                type: SequelizeStatic.STRING,
                allowNull: true
            },
        authors:
            {
                type: SequelizeStatic.STRING,
                allowNull: true
            },
        datePublication:
            {
                type: SequelizeStatic.DATE,
                allowNull: true
            }
    },
    {
        freezeTableName: true
    }
);