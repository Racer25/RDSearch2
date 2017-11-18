import {DiseaseModel} from "../models/disease";
import {PublicationModel} from "../models/publication";
import {Disease_YearModel} from "../models/disease_year";
import {Disease_PublicationModel} from "../models/disease_publication";
import {Disease_SymptomModel} from "../models/disease_symptom";
import {YearModel} from "../models/year";
import {TextualInformationModel} from "../models/textualInformation";
import {SymptomModel} from "../models/symptom";

export default function()
    {
        Disease_YearModel.belongsTo(DiseaseModel,
            {
                foreignKey: 'orphanetID'
            });
        Disease_YearModel.belongsTo(YearModel,
            {
                as:"Year2",
                foreignKey: 'year'
            });
        TextualInformationModel.belongsTo(DiseaseModel,
            {
                foreignKey: 'orphanetID'
            });
        Disease_PublicationModel.belongsTo(DiseaseModel,
            {
                foreignKey: 'orphanetID'
            });
        Disease_PublicationModel.belongsTo(PublicationModel,
            {
                foreignKey: 'idPublication'
            });
        Disease_SymptomModel.belongsTo(DiseaseModel,
            {
                foreignKey: 'orphanetID'
            });
        Disease_SymptomModel.belongsTo(SymptomModel,
            {
                foreignKey: 'name'
            });
    };