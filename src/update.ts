/**
 * Module dependencies
 */
import * as cron from "cron";
import * as fs from "fs";
import * as gracefulFs from "graceful-fs";
gracefulFs.gracefulify(fs);
import * as http from "http";

/**
 * Personnal modules
 */
import * as NCBI_API from "./controllers/update/NCBI_API";
import * as TextMining from "./controllers/update/TextMining"
import RootDirectory from "./controllers/update/RootDirectory";
import {SymptomProvider} from "./controllers/update/SymptomProvider";

/**
 * Model dependencies
 */
import {OtherModel} from "./models/other";
import {DiseaseModel, DiseaseAttributes} from "./models/disease";
import {TextualInformationModel, TextualInformationAttributes} from "./models/textualInformation";
import {Disease_YearAttributes, Disease_YearModel} from "./models/disease_year";
import {YearAttributes, YearModel} from "./models/year";
import {Disease_PublicationAttributes,Disease_PublicationModel} from "./models/disease_publication";
import {PublicationAttributes, PublicationModel} from "./models/publication";
import {Disease_SymptomAttributes, Disease_SymptomModel} from "./models/disease_symptom";
import {SymptomAttributes, SymptomModel} from "./models/symptom";

//Create the job
let job = new cron.CronJob(
    {
        cronTime: '00 31 13 * * 5-7',
        onTick: function()
        {
            //Runs every weekday (Monday through Friday)
            //at 16:24:00 AM. It does not run on Saturday
            //or Sunday.
            updateDB();
        },
        start: true,
        timeZone: 'America/Montreal'
    }
);

//Launch the Job!
//job.start();

export let updateDB = function()
{

    let diseases:Array<DiseaseAttributes> = [];
    let textualInformations: Array<TextualInformationAttributes> = [];
    let listOfIdLists:Array<Array<number>> = [];
    let listOfDiseasePublications:Array<Array<Disease_PublicationAttributes>> = [];
    let listOfPublicationsPerDisease:Array<Array<PublicationAttributes>> = [];

    download("http://www.orphadata.org/data/export/en_product1.json",RootDirectory()+"resources/en_product1.json")
        .catch(() =>
            {
                console.error("Error downloading!!");
            }
        )
        .then(()=> {return isThereAnUpdateForDiseasesList()} )
        .then(()=>
            {
                getInformationFromJSON(diseases, textualInformations);

                //Optional filter

                diseases = diseases.filter(function(currentValue, index)
                {
                    return index < 10;
                    //return currentValue.orphanetID >= "70568";
                });

                textualInformations = textualInformations.filter(function(currentValue, index)
                {
                    return index < 10;
                    //return currentValue.orphanetID >= "70568";
                });

                //Construct array of promises
                let promisesDiseases:Array<any> = [];
                for(let i = 0; i < diseases.length; i++)
                {
                    promisesDiseases.push(
                        DiseaseModel.upsert(
                            {
                                    orphanetID:diseases[i].orphanetID,
                                    name:diseases[i].name
                                }));
                }

                return Promise.all(promisesDiseases);
            }
        )
        .then(() =>
            {
                console.info("Update of rarediseaseTable finished at "+(new Date()).toISOString());
                console.info("Updating of TextualInformation start...");

                //Construct array of promises
                let promisesTextualInformations:Array<any> = [];
                for(let i = 0; i < textualInformations.length; i++)
                {
                    promisesTextualInformations.push(
                        TextualInformationModel.upsert(
                            {
                                idTextualInformation:textualInformations[i].idTextualInformation,
                                title:textualInformations[i].title,
                                content: textualInformations[i].content,
                                sourceName: textualInformations[i].sourceName,
                                sourceLink: textualInformations[i].sourceLink,
                                orphanetID: textualInformations[i].orphanetID
                            }));
                }

                return Promise.all(promisesTextualInformations);
            }
        )
        .catch((err:Error) =>
            {
                if(err)
                {
                    console.error("Error during Promise.all process!");
                    return Promise.reject(Error("Error during Promise.all process!"));
                }
                else
                {
                    //If no updates detected
                    getInformationFromJSON(diseases, textualInformations);

                    //Optional filter

                    diseases = diseases.filter(function(currentValue, index)
                    {
                        return index < 10;
                        //return currentValue.orphanetID >= "70568";
                    });

                    return Promise.resolve();
                }
            }
        )
        .then(
            ()=>
            {
                let promisesGetIdsWithQuotes:Array<Promise<any>> = [];
                for(let i = 0; i < diseases.length; i++)
                {
                    promisesGetIdsWithQuotes.push(
                        NCBI_API.promiseThrottle.add(
                            NCBI_API.getIdsFromSearch.bind(this, "\""+diseases[i].name+"\"", diseases[i].orphanetID))
                    );
                }
                return Promise.all(promisesGetIdsWithQuotes);

                //RareDiseaseYear update

                //Symptom update

                //3 most cited articles for each disease

            }
        )
        .then((listOfLists:Array<Array<number>>)=>
            {
                listOfIdLists = listOfLists;

                let promisesGetIdsWithoutQuotes:Array<Promise<any>> = [];
                let indexsOfZeroLength:Array<number> = [];
                for(let i = 0; i < listOfIdLists.length; i++)
                {

                    if(listOfIdLists[i].length === 0)
                    {
                        indexsOfZeroLength.push(i);
                        promisesGetIdsWithoutQuotes.push(
                            NCBI_API.promiseThrottle.add(
                                NCBI_API.getIdsFromSearch.bind(this, diseases[i].name, diseases[i].orphanetID))
                        );
                    }
                }

                return Promise.all(promisesGetIdsWithoutQuotes)
                    .then((listOfListsWithoutQuotes:Array<Array<number>>)=>
                        {
                            for(let i = 0; i < listOfListsWithoutQuotes.length; i++)
                            {
                                listOfIdLists[indexsOfZeroLength[i]] = listOfListsWithoutQuotes[i];
                            }

                            //Limiting to 1000 ids
                            for(let i = 0; i < listOfIdLists.length; i++)
                            {
                                listOfIdLists[i] = listOfIdLists[i].filter(function(currentValue, index)
                                {
                                    return index < 1000;
                                });
                            }
                        }
                    )
                    .catch((err:Error)=> {console.error(err); });
            }
        )
        .catch((err:Error)=> {console.error(err);})
        .then(()=>
            {
                let promisesGetRareDiseaseYears:Array<Promise<any>> = [];
                for(let i = 0; i < listOfIdLists.length; i++)
                {
                    promisesGetRareDiseaseYears.push(
                        NCBI_API.promiseThrottle.add(
                            NCBI_API.getRareDisease_YearFromIds.bind(this, listOfIdLists[i], diseases[i].orphanetID))
                    );
                }
                return Promise.all(promisesGetRareDiseaseYears);
            }
        )
        .catch((err:Error)=>{console.error(err);})
        .then((listOfRareDiseaseYearLists:Array<Array<Disease_YearAttributes>>)=>
            {
                let promisesUpdateYears:Array<any> = [];
                for(let i = 0; i < listOfRareDiseaseYearLists.length; i++)
                {
                    for(let j = 0; j < listOfRareDiseaseYearLists[i].length; j++)
                    {
                        let year:YearAttributes = {year: listOfRareDiseaseYearLists[i][j].year, numberOfPublications: 0};
                        promisesUpdateYears.push(YearModel.upsert(year));
                    }
                }

                console.info("Updating/Inserting Years in DB...");
                return Promise.all(promisesUpdateYears).then(()=>Promise.resolve(listOfRareDiseaseYearLists));
            }
        )
        .catch((err:Error)=>{console.error(err);})
        .then((listOfRareDiseaseYearLists:Array<Array<Disease_YearAttributes>>)=>
            {
                console.info("Updating/Inserting Years in DB finished");
                let promisesUpdateRareDiseaseYears:Array<any> = [];
                for(let i = 0; i < listOfRareDiseaseYearLists.length; i++)
                {
                    for(let j = 0; j < listOfRareDiseaseYearLists[i].length; j++)
                    {
                        let rareDiseaseYear:Disease_YearAttributes =
                            {
                                year: listOfRareDiseaseYearLists[i][j].year,
                                numberOfPublications: listOfRareDiseaseYearLists[i][j].numberOfPublications,
                                orphanetID: diseases[i].orphanetID
                            };
                        promisesUpdateRareDiseaseYears.push(Disease_YearModel.upsert(rareDiseaseYear));
                    }
                }

                console.info("Updating/Inserting RareDiseaseYears in DB...");
                return Promise.all(promisesUpdateRareDiseaseYears);
            }
        )
        .catch((err:Error)=>{console.error(err);})
        .then(()=>
            {
                console.info("Updating/Inserting RareDiseaseYears in DB finished");
                let promisesGetNumberPublicationsThatCiteGivingPublications:Array<Promise<any>> = [];
                for(let i = 0; i < listOfIdLists.length; i++)
                {
                    promisesGetNumberPublicationsThatCiteGivingPublications.push(
                        NCBI_API.promiseThrottle.add(
                            NCBI_API.getNumberPublicationsThatCiteGivingPublications.bind(this, listOfIdLists[i]))
                    );
                }
                return Promise.all(promisesGetNumberPublicationsThatCiteGivingPublications);
            }
        )
        .catch((err:Error)=>{console.error(err)})
        .then((listOfTimesCitedList:Array<Array<number>>)=>
            {
                console.info("Constructing rareDiseasePublication objects...");
                let listOfDiseasePublicationsPart:Array<Array<Disease_PublicationAttributes>> = [];
                for(let i = 0; i < listOfTimesCitedList.length; i++)
                {

                    let rareDisease_mostCitedPublications:Array<Disease_PublicationAttributes> = [];
                    for(let j = 0; j < listOfTimesCitedList[i].length; j++)
                    {
                        let diseasePublication:Disease_PublicationAttributes =
                            {
                                idPublication:listOfIdLists[i][j].toString(),
                                orphanetID:diseases[i].orphanetID,
                                timesCited: listOfTimesCitedList[i][j]
                            };
                        rareDisease_mostCitedPublications = dynamicSortingArray(diseasePublication, rareDisease_mostCitedPublications, 3)
                    }
                    listOfDiseasePublicationsPart.push(rareDisease_mostCitedPublications);
                }
                listOfDiseasePublications = listOfDiseasePublicationsPart;
                console.info("Constructing rareDiseasePublications objects finished");

                let promisesGetPublications:Array<Promise<any>> = [];
                for(let i = 0; i < listOfDiseasePublications.length; i++)
                {
                    promisesGetPublications.push(
                        NCBI_API.promiseThrottle.add(
                            NCBI_API.getPublications.bind(this, listOfDiseasePublications[i].map(
                                currentValue=>currentValue.idPublication)))
                    );
                }
                return Promise.all(promisesGetPublications);
            }
        )
        .then((listOfPublicationsList:Array<Array<PublicationAttributes>>)=>
        {
            console.info("Updating/Inserting Most Cited Publication in DB ...");
            let promisesUpdatePublications:Array<any> = [];
            for(let i = 0; i < listOfPublicationsList.length; i++)
            {
                for(let j = 0; j < listOfPublicationsList[i].length; j++)
                {
                    promisesUpdatePublications.push(PublicationModel.upsert(listOfPublicationsList[i][j]));
                }
            }
            return Promise.all(promisesUpdatePublications);
        })
        .then(()=>
            {
                console.info("Updating/Inserting Most Cited Publication in DB finished");
                console.info("Updating/Inserting RareDiseasePublication in DB ...");

                let promisesUpdatePublications:Array<any> = [];
                for(let i = 0; i < listOfDiseasePublications.length; i++)
                {
                    for(let j = 0; j < listOfDiseasePublications[i].length; j++)
                    {
                        promisesUpdatePublications.push(Disease_PublicationModel.upsert(listOfDiseasePublications[i][j]));
                    }
                }
                return Promise.all(promisesUpdatePublications);
            }
        )
        .then(()=>
            {
                //TODO
                console.info("Updating/Inserting RareDiseasePublication in DB finished");
                console.info("Updating/Inserting Symptoms list in DB ...");
                SymptomProvider.getSymptoms().then((symptoms:Array<SymptomAttributes>)=>
                    {
                        let promiseUpdateSymptomList:Array<any> = [];
                        for(let i = 0; i < symptoms.length; i++)
                        {
                            promiseUpdateSymptomList.push(SymptomModel.upsert(symptoms[i]));
                        }

                        return Promise.all(promiseUpdateSymptomList);
                    }
                );

            }
        )
        .then(()=>
            {
                console.info("Updating/Inserting Symptoms list in DB finished");
                console.info("Getting publications of diseases for text mining ...");

                let promisesGetPublications:Array<any> = [];
                for(let i = 0; i < listOfIdLists.length; i++)
                {
                    promisesGetPublications.push(NCBI_API.promiseThrottle.add(NCBI_API.getPublications.bind(this, listOfIdLists[i])));
                }

                return Promise.all(promisesGetPublications);

            }
        )
        .then((listOfListOfPublication:Array<Array<PublicationAttributes>>)=>
            {
                console.info("Getting publications of diseases for text mining finished");
                console.info("Text mining for symptoms detection ...");

                listOfPublicationsPerDisease = listOfListOfPublication;

                let promisesGiveSymptomsWithOccurrence:Array<any> = [];
                for(let i = 0; i < listOfPublicationsPerDisease.length; i++)
                {
                    if(listOfPublicationsPerDisease[i].length !== 0)
                    {
                        promisesGiveSymptomsWithOccurrence.push(TextMining.giveSymptomsWithOccurrenceWithLingPipe(
                            listOfPublicationsPerDisease[i], diseases[i].orphanetID));
                    }
                }

                return Promise.all(promisesGiveSymptomsWithOccurrence);
            }
        )
        .then((listOfSymptomsPerDisease:Array<Array<Disease_SymptomAttributes>>)=>
            {
                //Preprocessing symtoms weights ...

                //Making a copie
                let symptomsWithWeight = listOfSymptomsPerDisease.slice();

                for(let i = 0; i < symptomsWithWeight.length; i++)
                {
                    /*
                    //Exp to strenghten influence of big terms
                    for(var i = 0; i < symptomsWithOccurrenceBis.length; i++)
                    {
                        symptomsWithOccurrenceBis[i].size=Math.exp(symptomsWithOccurrenceBis[i].size);
                        console.log(symptomsWithOccurrenceBis[i]);
                    }*/

                    //Find Min and Max for Normalization
                    let max = Math.max.apply(Math,symptomsWithWeight[i].map(function(o:Disease_SymptomAttributes){return o.weight;}));
                    let min = Math.min.apply(Math,symptomsWithWeight[i].map(function(o:Disease_SymptomAttributes){return o.weight;}));

                    //Normalization

                    //If size==1
                    if(max == min)
                    {
                        symptomsWithWeight[i][0].weight=15+(50-15)*symptomsWithWeight[i][0].weight;
                    }
                    else
                    {
                        for(let j = 0; j < symptomsWithWeight[i].length; j++)
                        {
                            symptomsWithWeight[i][j].weight=15+(50-15)*(symptomsWithWeight[i][j].weight-min)/(max-min);
                        }
                    }
                }

                console.info("Text mining for symptoms detection finished");

                //Working with the new list symptomsWithWeight
                console.info("Updating/Inserting DiseaseSymptoms in DB ...");

                let promisesUpdateDiseaseSymptoms:Array<any> = [];
                for(let i = 0; i < symptomsWithWeight.length; i++)
                {
                    for(let j = 0; j < symptomsWithWeight[i].length; j++)
                    {
                        promisesUpdateDiseaseSymptoms.push(Disease_SymptomModel.upsert(symptomsWithWeight[i][j]));
                    }
                }
                return Promise.all(promisesUpdateDiseaseSymptoms);

            }
        )
        .then(()=> {console.info("Updating/Inserting DiseaseSymptoms in DB finished");})
        .catch((err:Error)=>{console.error(err)});
};

export let download = function(url:string, dest:string)
{
    return new Promise((resolve, reject)=>
    {
        console.info("Download of file "+dest+" start...");
        let file = fs.createWriteStream(dest);
        http.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                console.info("Download finished");
                file.close();  // close() is async, call cb after close completes.
                resolve();
            });
        }).on('error', function() {
            // Handle errors
            fs.unlink(dest, reject); // Delete the file async. (But we don't check the result)
        });
    }
    );
};

export let isThereAnUpdateForDiseasesList =  function()
{
    return new Promise((resolve, reject) =>
    {
        let json = require(RootDirectory()+"resources/en_product1.json");
        let lastUpdateDateFromJSON=json.JDBOR[0].date.substring(0, 10);

        return OtherModel.findOne()
            .then(
                otherTable=>
                {
                    console.log("DB: "+otherTable.lastUpdatedate+", JSON: "+lastUpdateDateFromJSON);

                    let lastUpdateDateFromDB=new Date(otherTable.lastUpdatedate);
                    let lastUpdateDateFromJSON_DATE=new Date(Date.parse(lastUpdateDateFromJSON));

                    if(lastUpdateDateFromDB === undefined || lastUpdateDateFromDB === null
                        || lastUpdateDateFromJSON_DATE > lastUpdateDateFromDB)
                    {
                        console.log("Update found");
                        return OtherModel.update(
                            {
                                idOther: 1,
                                lastUpdatedate: lastUpdateDateFromJSON
                            },
                            { where: { idOther: 1 } }
                            )
                            .then(()=>{resolve();})
                            .catch(()=>{reject(Error("Error updating other table"))});
                    }
                    else
                    {
                        console.log("No update found");
                        reject();
                    }
                }
            );
    }
    );
};

export let getInformationFromJSON = function(diseases:Array<DiseaseAttributes>, textualInformations: Array<TextualInformationAttributes>)
{
    let json = require(RootDirectory()+"resources/en_product1.json");

    let disorderList = json.JDBOR[0].DisorderList[0].Disorder;

    for(let m =0; m<disorderList.length; m++)
    {
        let disorder=disorderList[m];
        let isADisorder =
            disorder.DisorderType[0].Name[0].label === "Disease" ||
            disorder.DisorderType[0].Name[0].label === "Clinical syndrome" ||
            disorder.DisorderType[0].Name[0].label === "Malformation syndrome" ||
            disorder.DisorderType[0].Name[0].label === "Biological anomaly" ||
            disorder.DisorderType[0].Name[0].label === "Morphological anomaly" ||
            disorder.DisorderType[0].Name[0].label === "Particular clinical situation in a disease or syndrome";

        if(isADisorder)
        {
            let orphanetID= disorder.OrphaNumber;
            let name= disorder.Name[0].label;
            let sourceName="Orphanet";
            let sourceLink=disorder.ExpertLink[0].link;

            for(let i = 0; i < disorder.TextualInformationList.length; i++)
            {
                if(disorder.TextualInformationList[i].count != "0")
                {
                    for(let j = 0; j < disorder.TextualInformationList[i].TextualInformation.length; j++)
                    {
                        for(let k = 0; k < disorder.TextualInformationList[i].TextualInformation[j].TextSectionList.length; k++)
                        {
                            if(disorder.TextualInformationList[i].TextualInformation[j].TextSectionList[k].count != "0")
                            {
                                let textSection=disorder.TextualInformationList[i].TextualInformation[j].TextSectionList[k].TextSection;
                                for(let l = 0; l < textSection.length; l++)
                                {
                                    let title=textSection[l].TextSectionType[0].Name[0].label;
                                    let content=textSection[l].Contents;
                                    let id=textSection[l].id;

                                    let textualInformation:TextualInformationAttributes =
                                        {
                                            idTextualInformation: id,
                                            title: title,
                                            content: content,
                                            orphanetID:orphanetID,
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


            let disease:DiseaseAttributes = {orphanetID: orphanetID, name: name};

            diseases.push(disease);
        }
    }
};

let dynamicSortingArray = function(val:Disease_PublicationAttributes, array:Array<Disease_PublicationAttributes>, length:number)
{
    let index=0;
    for(let i = 0; i < array.length; i++)
    {
        if(array[i].timesCited > val.timesCited)
        {
            index++;
        }
    }
    array.splice(index, 0, val);
    if(array.length > length)
    {
        array.pop();
    }
    return array;
};

