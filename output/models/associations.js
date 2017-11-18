"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const disease_1 = require("../models/disease");
const publication_1 = require("../models/publication");
const disease_year_1 = require("../models/disease_year");
const disease_publication_1 = require("../models/disease_publication");
const disease_symptom_1 = require("../models/disease_symptom");
const year_1 = require("../models/year");
const textualInformation_1 = require("../models/textualInformation");
const symptom_1 = require("../models/symptom");
function default_1() {
    disease_year_1.Disease_YearModel.belongsTo(disease_1.DiseaseModel, {
        foreignKey: 'orphanetID'
    });
    disease_year_1.Disease_YearModel.belongsTo(year_1.YearModel, {
        as: "Year2",
        foreignKey: 'year'
    });
    textualInformation_1.TextualInformationModel.belongsTo(disease_1.DiseaseModel, {
        foreignKey: 'orphanetID'
    });
    disease_publication_1.Disease_PublicationModel.belongsTo(disease_1.DiseaseModel, {
        foreignKey: 'orphanetID'
    });
    disease_publication_1.Disease_PublicationModel.belongsTo(publication_1.PublicationModel, {
        foreignKey: 'idPublication'
    });
    disease_symptom_1.Disease_SymptomModel.belongsTo(disease_1.DiseaseModel, {
        foreignKey: 'orphanetID'
    });
    disease_symptom_1.Disease_SymptomModel.belongsTo(symptom_1.SymptomModel, {
        foreignKey: 'name'
    });
}
exports.default = default_1;
;
//# sourceMappingURL=associations.js.map