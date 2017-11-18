import * as SequelizeStatic from "sequelize";
import {sequelize} from "./../models/sequelizeConnector";

export interface TextualInformationAttributes
{
    idTextualInformation: string,
    title: string,
    content: string,
    sourceName: string,
    sourceLink: string,
    orphanetID: string
}

export interface TextualInformationInstance extends SequelizeStatic.Instance<TextualInformationAttributes>
{
    idTextualInformation: string,
    title: string,
    content: string,
    sourceName: string,
    sourceLink: string,
    orphanetID: string
}

export let TextualInformationModel = sequelize.define<TextualInformationInstance, TextualInformationAttributes>
('textualinformation',
    {
        idTextualInformation:
            {
                type: SequelizeStatic.STRING,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
        title:
            {
                type: SequelizeStatic.STRING,
                allowNull: true
            },
        content:
            {
                type: SequelizeStatic.STRING,
                allowNull: true
            },
        sourceName:
            {
                type: SequelizeStatic.STRING,
                allowNull: true
            },
        sourceLink:
            {
                type: SequelizeStatic.STRING,
                allowNull: true
            }
    },
    {
        freezeTableName: true
    }
);