"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies
 */
const cron = require("cron");
const fs = require("fs");
const gracefulFs = require("graceful-fs");
gracefulFs.gracefulify(fs);
const http = require("http");
/**
 * Personnal modules
 */
const NCBI_API = require("./controllers/update/NCBI_API");
const TextMining = require("./controllers/update/TextMining");
const RootDirectory_1 = require("./controllers/update/RootDirectory");
const SymptomProvider_1 = require("./controllers/update/SymptomProvider");
/**
 * Model dependencies
 */
const other_1 = require("./models/other");
const disease_1 = require("./models/disease");
const textualInformation_1 = require("./models/textualInformation");
const disease_year_1 = require("./models/disease_year");
const year_1 = require("./models/year");
const disease_publication_1 = require("./models/disease_publication");
const publication_1 = require("./models/publication");
const disease_symptom_1 = require("./models/disease_symptom");
const symptom_1 = require("./models/symptom");
//Create the job
let job = new cron.CronJob({
    cronTime: '00 31 13 * * 5-7',
    onTick: function () {
        //Runs every weekday (Monday through Friday)
        //at 16:24:00 AM. It does not run on Saturday
        //or Sunday.
        exports.updateDB();
    },
    start: true,
    timeZone: 'America/Montreal'
});
//Launch the Job!
//job.start();
exports.updateDB = function () {
    let diseases = [];
    let textualInformations = [];
    let listOfIdLists = [];
    let listOfDiseasePublications = [];
    let listOfPublicationsPerDisease = [];
    exports.download("http://www.orphadata.org/data/export/en_product1.json", RootDirectory_1.default() + "resources/en_product1.json")
        .catch(() => {
        console.error("Error downloading!!");
    })
        .then(() => { return exports.isThereAnUpdateForDiseasesList(); })
        .then(() => {
        exports.getInformationFromJSON(diseases, textualInformations);
        //Optional filter
        diseases = diseases.filter(function (currentValue, index) {
            return index < 10;
            //return currentValue.orphanetID >= "70568";
        });
        textualInformations = textualInformations.filter(function (currentValue, index) {
            return index < 10;
            //return currentValue.orphanetID >= "70568";
        });
        //Construct array of promises
        let promisesDiseases = [];
        for (let i = 0; i < diseases.length; i++) {
            promisesDiseases.push(disease_1.DiseaseModel.upsert({
                orphanetID: diseases[i].orphanetID,
                name: diseases[i].name
            }));
        }
        return Promise.all(promisesDiseases);
    })
        .then(() => {
        console.info("Update of rarediseaseTable finished at " + (new Date()).toISOString());
        console.info("Updating of TextualInformation start...");
        //Construct array of promises
        let promisesTextualInformations = [];
        for (let i = 0; i < textualInformations.length; i++) {
            promisesTextualInformations.push(textualInformation_1.TextualInformationModel.upsert({
                idTextualInformation: textualInformations[i].idTextualInformation,
                title: textualInformations[i].title,
                content: textualInformations[i].content,
                sourceName: textualInformations[i].sourceName,
                sourceLink: textualInformations[i].sourceLink,
                orphanetID: textualInformations[i].orphanetID
            }));
        }
        return Promise.all(promisesTextualInformations);
    })
        .catch((err) => {
        if (err) {
            console.error("Error during Promise.all process!");
            return Promise.reject(Error("Error during Promise.all process!"));
        }
        else {
            //If no updates detected
            exports.getInformationFromJSON(diseases, textualInformations);
            //Optional filter
            diseases = diseases.filter(function (currentValue, index) {
                return index < 10;
                //return currentValue.orphanetID >= "70568";
            });
            return Promise.resolve();
        }
    })
        .then(() => {
        let promisesGetIdsWithQuotes = [];
        for (let i = 0; i < diseases.length; i++) {
            promisesGetIdsWithQuotes.push(NCBI_API.promiseThrottle.add(NCBI_API.getIdsFromSearch.bind(this, "\"" + diseases[i].name + "\"", diseases[i].orphanetID)));
        }
        return Promise.all(promisesGetIdsWithQuotes);
        //RareDiseaseYear update
        //Symptom update
        //3 most cited articles for each disease
    })
        .then((listOfLists) => {
        listOfIdLists = listOfLists;
        let promisesGetIdsWithoutQuotes = [];
        let indexsOfZeroLength = [];
        for (let i = 0; i < listOfIdLists.length; i++) {
            if (listOfIdLists[i].length === 0) {
                indexsOfZeroLength.push(i);
                promisesGetIdsWithoutQuotes.push(NCBI_API.promiseThrottle.add(NCBI_API.getIdsFromSearch.bind(this, diseases[i].name, diseases[i].orphanetID)));
            }
        }
        return Promise.all(promisesGetIdsWithoutQuotes)
            .then((listOfListsWithoutQuotes) => {
            for (let i = 0; i < listOfListsWithoutQuotes.length; i++) {
                listOfIdLists[indexsOfZeroLength[i]] = listOfListsWithoutQuotes[i];
            }
            //Limiting to 1000 ids
            for (let i = 0; i < listOfIdLists.length; i++) {
                listOfIdLists[i] = listOfIdLists[i].filter(function (currentValue, index) {
                    return index < 1000;
                });
            }
        })
            .catch((err) => { console.error(err); });
    })
        .catch((err) => { console.error(err); })
        .then(() => {
        let promisesGetRareDiseaseYears = [];
        for (let i = 0; i < listOfIdLists.length; i++) {
            promisesGetRareDiseaseYears.push(NCBI_API.promiseThrottle.add(NCBI_API.getRareDisease_YearFromIds.bind(this, listOfIdLists[i], diseases[i].orphanetID)));
        }
        return Promise.all(promisesGetRareDiseaseYears);
    })
        .catch((err) => { console.error(err); })
        .then((listOfRareDiseaseYearLists) => {
        let promisesUpdateYears = [];
        for (let i = 0; i < listOfRareDiseaseYearLists.length; i++) {
            for (let j = 0; j < listOfRareDiseaseYearLists[i].length; j++) {
                let year = { year: listOfRareDiseaseYearLists[i][j].year, numberOfPublications: 0 };
                promisesUpdateYears.push(year_1.YearModel.upsert(year));
            }
        }
        console.info("Updating/Inserting Years in DB...");
        return Promise.all(promisesUpdateYears).then(() => Promise.resolve(listOfRareDiseaseYearLists));
    })
        .catch((err) => { console.error(err); })
        .then((listOfRareDiseaseYearLists) => {
        console.info("Updating/Inserting Years in DB finished");
        let promisesUpdateRareDiseaseYears = [];
        for (let i = 0; i < listOfRareDiseaseYearLists.length; i++) {
            for (let j = 0; j < listOfRareDiseaseYearLists[i].length; j++) {
                let rareDiseaseYear = {
                    year: listOfRareDiseaseYearLists[i][j].year,
                    numberOfPublications: listOfRareDiseaseYearLists[i][j].numberOfPublications,
                    orphanetID: diseases[i].orphanetID
                };
                promisesUpdateRareDiseaseYears.push(disease_year_1.Disease_YearModel.upsert(rareDiseaseYear));
            }
        }
        console.info("Updating/Inserting RareDiseaseYears in DB...");
        return Promise.all(promisesUpdateRareDiseaseYears);
    })
        .catch((err) => { console.error(err); })
        .then(() => {
        console.info("Updating/Inserting RareDiseaseYears in DB finished");
        let promisesGetNumberPublicationsThatCiteGivingPublications = [];
        for (let i = 0; i < listOfIdLists.length; i++) {
            promisesGetNumberPublicationsThatCiteGivingPublications.push(NCBI_API.promiseThrottle.add(NCBI_API.getNumberPublicationsThatCiteGivingPublications.bind(this, listOfIdLists[i])));
        }
        return Promise.all(promisesGetNumberPublicationsThatCiteGivingPublications);
    })
        .catch((err) => { console.error(err); })
        .then((listOfTimesCitedList) => {
        console.info("Constructing rareDiseasePublication objects...");
        let listOfDiseasePublicationsPart = [];
        for (let i = 0; i < listOfTimesCitedList.length; i++) {
            let rareDisease_mostCitedPublications = [];
            for (let j = 0; j < listOfTimesCitedList[i].length; j++) {
                let diseasePublication = {
                    idPublication: listOfIdLists[i][j].toString(),
                    orphanetID: diseases[i].orphanetID,
                    timesCited: listOfTimesCitedList[i][j]
                };
                rareDisease_mostCitedPublications = dynamicSortingArray(diseasePublication, rareDisease_mostCitedPublications, 3);
            }
            listOfDiseasePublicationsPart.push(rareDisease_mostCitedPublications);
        }
        listOfDiseasePublications = listOfDiseasePublicationsPart;
        console.info("Constructing rareDiseasePublications objects finished");
        let promisesGetPublications = [];
        for (let i = 0; i < listOfDiseasePublications.length; i++) {
            promisesGetPublications.push(NCBI_API.promiseThrottle.add(NCBI_API.getPublications.bind(this, listOfDiseasePublications[i].map(currentValue => currentValue.idPublication))));
        }
        return Promise.all(promisesGetPublications);
    })
        .then((listOfPublicationsList) => {
        console.info("Updating/Inserting Most Cited Publication in DB ...");
        let promisesUpdatePublications = [];
        for (let i = 0; i < listOfPublicationsList.length; i++) {
            for (let j = 0; j < listOfPublicationsList[i].length; j++) {
                promisesUpdatePublications.push(publication_1.PublicationModel.upsert(listOfPublicationsList[i][j]));
            }
        }
        return Promise.all(promisesUpdatePublications);
    })
        .then(() => {
        console.info("Updating/Inserting Most Cited Publication in DB finished");
        console.info("Updating/Inserting RareDiseasePublication in DB ...");
        let promisesUpdatePublications = [];
        for (let i = 0; i < listOfDiseasePublications.length; i++) {
            for (let j = 0; j < listOfDiseasePublications[i].length; j++) {
                promisesUpdatePublications.push(disease_publication_1.Disease_PublicationModel.upsert(listOfDiseasePublications[i][j]));
            }
        }
        return Promise.all(promisesUpdatePublications);
    })
        .then(() => {
        //TODO
        console.info("Updating/Inserting RareDiseasePublication in DB finished");
        console.info("Updating/Inserting Symptoms list in DB ...");
        SymptomProvider_1.SymptomProvider.getSymptoms().then((symptoms) => {
            let promiseUpdateSymptomList = [];
            for (let i = 0; i < symptoms.length; i++) {
                promiseUpdateSymptomList.push(symptom_1.SymptomModel.upsert(symptoms[i]));
            }
            return Promise.all(promiseUpdateSymptomList);
        });
    })
        .then(() => {
        console.info("Updating/Inserting Symptoms list in DB finished");
        console.info("Getting publications of diseases for text mining ...");
        let promisesGetPublications = [];
        for (let i = 0; i < listOfIdLists.length; i++) {
            promisesGetPublications.push(NCBI_API.promiseThrottle.add(NCBI_API.getPublications.bind(this, listOfIdLists[i])));
        }
        return Promise.all(promisesGetPublications);
    })
        .then((listOfListOfPublication) => {
        console.info("Getting publications of diseases for text mining finished");
        console.info("Text mining for symptoms detection ...");
        listOfPublicationsPerDisease = listOfListOfPublication;
        let promisesGiveSymptomsWithOccurrence = [];
        for (let i = 0; i < listOfPublicationsPerDisease.length; i++) {
            if (listOfPublicationsPerDisease[i].length !== 0) {
                promisesGiveSymptomsWithOccurrence.push(TextMining.giveSymptomsWithOccurrenceWithLingPipe(listOfPublicationsPerDisease[i], diseases[i].orphanetID));
            }
        }
        return Promise.all(promisesGiveSymptomsWithOccurrence);
    })
        .then((listOfSymptomsPerDisease) => {
        //Preprocessing symtoms weights ...
        //Making a copie
        let symptomsWithWeight = listOfSymptomsPerDisease.slice();
        for (let i = 0; i < symptomsWithWeight.length; i++) {
            /*
            //Exp to strenghten influence of big terms
            for(var i = 0; i < symptomsWithOccurrenceBis.length; i++)
            {
                symptomsWithOccurrenceBis[i].size=Math.exp(symptomsWithOccurrenceBis[i].size);
                console.log(symptomsWithOccurrenceBis[i]);
            }*/
            //Find Min and Max for Normalization
            let max = Math.max.apply(Math, symptomsWithWeight[i].map(function (o) { return o.weight; }));
            let min = Math.min.apply(Math, symptomsWithWeight[i].map(function (o) { return o.weight; }));
            //Normalization
            //If size==1
            if (max == min) {
                symptomsWithWeight[i][0].weight = 15 + (50 - 15) * symptomsWithWeight[i][0].weight;
            }
            else {
                for (let j = 0; j < symptomsWithWeight[i].length; j++) {
                    symptomsWithWeight[i][j].weight = 15 + (50 - 15) * (symptomsWithWeight[i][j].weight - min) / (max - min);
                }
            }
        }
        console.info("Text mining for symptoms detection finished");
        //Working with the new list symptomsWithWeight
        console.info("Updating/Inserting DiseaseSymptoms in DB ...");
        let promisesUpdateDiseaseSymptoms = [];
        for (let i = 0; i < symptomsWithWeight.length; i++) {
            for (let j = 0; j < symptomsWithWeight[i].length; j++) {
                promisesUpdateDiseaseSymptoms.push(disease_symptom_1.Disease_SymptomModel.upsert(symptomsWithWeight[i][j]));
            }
        }
        return Promise.all(promisesUpdateDiseaseSymptoms);
    })
        .then(() => { console.info("Updating/Inserting DiseaseSymptoms in DB finished"); })
        .catch((err) => { console.error(err); });
};
exports.download = function (url, dest) {
    return new Promise((resolve, reject) => {
        console.info("Download of file " + dest + " start...");
        let file = fs.createWriteStream(dest);
        http.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                console.info("Download finished");
                file.close(); // close() is async, call cb after close completes.
                resolve();
            });
        }).on('error', function () {
            // Handle errors
            fs.unlink(dest, reject); // Delete the file async. (But we don't check the result)
        });
    });
};
exports.isThereAnUpdateForDiseasesList = function () {
    return new Promise((resolve, reject) => {
        let json = require(RootDirectory_1.default() + "resources/en_product1.json");
        let lastUpdateDateFromJSON = json.JDBOR[0].date.substring(0, 10);
        return other_1.OtherModel.findOne()
            .then(otherTable => {
            console.log("DB: " + otherTable.lastUpdatedate + ", JSON: " + lastUpdateDateFromJSON);
            let lastUpdateDateFromDB = new Date(otherTable.lastUpdatedate);
            let lastUpdateDateFromJSON_DATE = new Date(Date.parse(lastUpdateDateFromJSON));
            if (lastUpdateDateFromDB === undefined || lastUpdateDateFromDB === null
                || lastUpdateDateFromJSON_DATE > lastUpdateDateFromDB) {
                console.log("Update found");
                return other_1.OtherModel.update({
                    idOther: 1,
                    lastUpdatedate: lastUpdateDateFromJSON
                }, { where: { idOther: 1 } })
                    .then(() => { resolve(); })
                    .catch(() => { reject(Error("Error updating other table")); });
            }
            else {
                console.log("No update found");
                reject();
            }
        });
    });
};
exports.getInformationFromJSON = function (diseases, textualInformations) {
    let json = require(RootDirectory_1.default() + "resources/en_product1.json");
    let disorderList = json.JDBOR[0].DisorderList[0].Disorder;
    for (let m = 0; m < disorderList.length; m++) {
        let disorder = disorderList[m];
        let isADisorder = disorder.DisorderType[0].Name[0].label === "Disease" ||
            disorder.DisorderType[0].Name[0].label === "Clinical syndrome" ||
            disorder.DisorderType[0].Name[0].label === "Malformation syndrome" ||
            disorder.DisorderType[0].Name[0].label === "Biological anomaly" ||
            disorder.DisorderType[0].Name[0].label === "Morphological anomaly" ||
            disorder.DisorderType[0].Name[0].label === "Particular clinical situation in a disease or syndrome";
        if (isADisorder) {
            let orphanetID = disorder.OrphaNumber;
            let name = disorder.Name[0].label;
            let sourceName = "Orphanet";
            let sourceLink = disorder.ExpertLink[0].link;
            for (let i = 0; i < disorder.TextualInformationList.length; i++) {
                if (disorder.TextualInformationList[i].count != "0") {
                    for (let j = 0; j < disorder.TextualInformationList[i].TextualInformation.length; j++) {
                        for (let k = 0; k < disorder.TextualInformationList[i].TextualInformation[j].TextSectionList.length; k++) {
                            if (disorder.TextualInformationList[i].TextualInformation[j].TextSectionList[k].count != "0") {
                                let textSection = disorder.TextualInformationList[i].TextualInformation[j].TextSectionList[k].TextSection;
                                for (let l = 0; l < textSection.length; l++) {
                                    let title = textSection[l].TextSectionType[0].Name[0].label;
                                    let content = textSection[l].Contents;
                                    let id = textSection[l].id;
                                    let textualInformation = {
                                        idTextualInformation: id,
                                        title: title,
                                        content: content,
                                        orphanetID: orphanetID,
                                        sourceName: sourceName,
                                        sourceLink: sourceLink
                                    };
                                    textualInformations.push(textualInformation);
                                }
                            }
                        }
                    }
                }
            }
            let disease = { orphanetID: orphanetID, name: name };
            diseases.push(disease);
        }
    }
};
let dynamicSortingArray = function (val, array, length) {
    let index = 0;
    for (let i = 0; i < array.length; i++) {
        if (array[i].timesCited > val.timesCited) {
            index++;
        }
    }
    array.splice(index, 0, val);
    if (array.length > length) {
        array.pop();
    }
    return array;
};
//# sourceMappingURL=update.js.map