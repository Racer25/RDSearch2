import * as xml2js from "xml2js";
let PromiseThrottle = require("promise-throttle");
import * as request from "request";
import {Disease_YearAttributes} from "../../models/disease_year";
import {PublicationAttributes} from "../../models/publication";

export let promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 3,           // up to 3 request per second
    promiseImplementation: Promise  // the Promise library you are using
});

export let getIdsFromSearch = function(searchString:string, orphanetID:string)
{
    return new Promise((resolve, reject)=>
        {
            let url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";

            request(
                {
                    method: 'POST',
                    url: url,
                    json: true,
                    form:
                        {
                            db:"pubmed",
                            term: searchString+" AND"+" hasabstract[text]"+" AND"+" Humans[Mesh]",
                            sort: "relevance",
                            retmode: "json",
                            retmax:100000,
                            timeout:60000
                        }
                },
                function(err, response, data)
                {
                    if(err)
                    {
                        reject(err);
                    }
                    if(data != undefined && data.esearchresult != undefined)
                    {
                        let idlist=data.esearchresult.idlist;
                        if(data.esearchresult.warninglist !== undefined)
                        {
                            if(data.esearchresult.warninglist.quotedphrasesnotfound.length !== 0)
                            {
                                idlist = [];
                            }
                        }
                        console.log("Response from getIdsFromSearch, searchString="+searchString+", orphanetID="+orphanetID+" results: "+idlist.length+" ids");
                        resolve(idlist);
                    }
                }
            );
        }
    );
};

export let getRareDisease_YearFromIds = function(idList:Array<number>, orphanetID:string)
{
    /*
    idList = idList.filter(function(currentValue, index)
    {
        return index < 10;
        //return currentValue.orphanetID >= "70568";
    });*/

    return new Promise((resolve, reject)=>
        {
            let url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";

            request(
                {
                    method: 'POST',
                    url: url,
                    json: true,
                    form:
                        {
                            db:"pubmed",
                            id: idList.toString(),
                            version: "2.0"
                        },
                    timeout:60000
                },
                function(err, response, data)
                {
                    if(err) {reject(err); }

                    let parser = new xml2js.Parser();
                    parser.parseString
                    (
                        data,
                        function (err:Error, data:any)
                        {
                            if(err) {reject(err);}
                            console.log("Response from getRareDisease_YearFromIds, orphanetID="+orphanetID);
                            if(data !== undefined && data.eSummaryResult !== undefined)
                            {
                                let documentSummaries = data.eSummaryResult.DocumentSummarySet[0].DocumentSummary;
                                let rareDisease_YearList=[];

                                for(let i = 0; i < documentSummaries.length; i++)
                                {
                                    let yearString = documentSummaries[i].PubDate[0].substring(0,4);
                                    if(!isNaN(yearString))
                                    {
                                        let rareDisease_YearIndex = rareDisease_YearList.findIndex(
                                            function(currentValue){return currentValue.year == yearString});

                                        //Is this date already in the array?
                                        if(rareDisease_YearIndex != -1)
                                        {
                                            rareDisease_YearList[rareDisease_YearIndex].numberOfPublications++;
                                        }
                                        else
                                        {
                                            //Create rareDisease_Year object
                                            let rareDisease_Year:Disease_YearAttributes =
                                                {
                                                    year: yearString,
                                                    orphanetID: orphanetID,
                                                    numberOfPublications: 1
                                                };

                                            //Ajout à la collection
                                            rareDisease_YearList.push(rareDisease_Year);
                                        }
                                    }
                                }
                                resolve(rareDisease_YearList);
                            }
                            else
                            {
                                reject(Error("data === undefined && data.result === undefined !!!!, orphanetID="+orphanetID+", idListLength="+idList.length))
                            }
                        }
                    );
                }
            );
        }
    );
};

export let getNumberPublicationsThatCiteGivingPublications = function(idList:Array<number>)
{
    return new Promise((resolve, reject)=>
        {
            let url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi";
            /*
            let url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?id="+idList[0];

            for(let i =1; i < idList.length; i++)
            {
                url += "&id="+idList[i];
            }*/

            request(
                {
                    method: 'POST',
                    url: url,
                    json: true,
                    form:{dbfrom:"pubmed", linkname:"pubmed_pubmed_citedin", retmode:"json", id: idList},
                    qsStringifyOptions: {arrayFormat: "repeat"},
                    timeout: 60000
                },
                function(err, response, data)
                {
                    if(err)
                    {
                        reject(err);
                    }
                    console.log("Response from getNumberPublicationsThatCiteGivingPublications, idList.length="+idList.length);
                    if(data != undefined && data.linksets != undefined)
                    {
                        let lengthList=[];
                        for(let i = 0; i < data.linksets.length; i++)
                        {
                            if(data.linksets[i].linksetdbs != undefined)
                            {
                                lengthList.push(data.linksets[i].linksetdbs[0].links.length);
                            }
                            else
                            {
                                lengthList.push(0);
                            }
                        }
                        resolve(lengthList);
                    }
                    else
                    {
                        reject(Error(data));
                    }
                }
            );
        }
    );
};

export let getPublications = function(idList:Array<number>, orphanetID:string)
{
    return new Promise((resolve, reject)=>
        {
            let url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";
            let publications:Array<PublicationAttributes>=[];

            let idListString = idList[0].toString();
            for(let i =1; i < idList.length; i++)
            {
                idListString += ","+idList[i];
            }

            request(
                {
                    headers: {'content-type' : 'application/x-www-form-urlencoded'},
                    method: 'POST',
                    url: url,
                    form: {db:"pubmed", retmode:"xml", id:idListString},
                    timeout: 60000
                },
                function(err, response, data)
                {
                    if(err)
                    {
                        console.error(err);
                        reject(err);
                    }
                    console.log("Response from getPublications: "+idList.length+" publications");

                    //Conversion vers JS Object dans objectFromXml
                    let objectFromXml:any = "";
                    let parser = new xml2js.Parser();
                    parser.parseString
                    (
                        data,
                        function (err:Error, result:any)
                        {
                            if(err)
                            {
                                console.log(err);
                                reject(err);
                            }
                            objectFromXml = result;
                            if(objectFromXml == undefined || objectFromXml.PubmedArticleSet == undefined)
                            {
                                console.log("Invalid response from NCBI API during getPublications() execution");
                                reject(Error("Invalid response from NCBI API during getPublications() execution"));
                            }

                            for(let i = 0; i < objectFromXml.PubmedArticleSet.PubmedArticle.length; i++)
                            {
                                //Id search
                                let id=objectFromXml.PubmedArticleSet.PubmedArticle[i].MedlineCitation[0].PMID[0]._;

                                //Article Title search
                                let title=objectFromXml.PubmedArticleSet.PubmedArticle[i].MedlineCitation[0].Article[0].ArticleTitle[0];

                                //Abstract Search
                                let abstractText:string = "";
                                let objectAbstract=[];
                                try
                                {
                                    objectAbstract=objectFromXml.PubmedArticleSet.PubmedArticle[i].MedlineCitation[0].Article[0].Abstract[0].AbstractText;
                                }
                                catch (error){}
                                finally
                                {
                                    if(objectAbstract.length==1)
                                    {
                                        if(objectAbstract[0].$ != undefined && objectAbstract[0].$ != null)
                                        {
                                            abstractText += objectAbstract[0].$.Label+" \n";
                                            abstractText += objectAbstract[0]._+" \n";
                                        }
                                        else
                                        {
                                            abstractText = objectAbstract[0];
                                        }
                                    }
                                    else
                                    {
                                        for(let j=0; j< objectAbstract.length; j++)
                                        {
                                            if(objectAbstract[j].$ != undefined)
                                            {
                                                abstractText += objectAbstract[j].$.Label+" \n";
                                                abstractText += objectAbstract[j]._+" \n";
                                            }
                                            else
                                            {
                                                abstractText += objectAbstract[j]+" \n";
                                            }
                                        }
                                    }

                                    //Authors Search
                                    let authors=[];
                                    let objectAuthors=[];
                                    try
                                    {
                                        objectAuthors=objectFromXml.PubmedArticleSet.PubmedArticle[i].MedlineCitation[0].Article[0].AuthorList[0].Author;
                                    }
                                    catch (error){

                                    }
                                    finally
                                    {
                                        for(let j=0; j< objectAuthors.length; j++)
                                        {
                                            let author="";
                                            if(objectAuthors[j].LastName != undefined && objectAuthors[j].ForeName != undefined)
                                            {
                                                author=objectAuthors[j].LastName[0]+" "+objectAuthors[j].ForeName[0];
                                            }
                                            else if(objectAuthors[j].CollectiveName != undefined)
                                            {
                                                author=objectAuthors[j].CollectiveName[0];
                                            }
                                            authors.push(author);
                                        }

                                        //DOI Search
                                        let doi="";
                                        let objectDOI=objectFromXml.PubmedArticleSet.PubmedArticle[i].PubmedData[0].ArticleIdList[0].ArticleId;
                                        for(let j=0; j< objectDOI.length; j++)
                                        {
                                            let idObj=objectDOI[j];
                                            if(idObj.$.IdType === "doi")
                                            {
                                                doi=idObj._;
                                            }
                                        }

                                        //Date Search
                                        let date:Date;
                                        let objectDate = objectFromXml.PubmedArticleSet.PubmedArticle[i].MedlineCitation[0].DateRevised[0];
                                        date = new Date(objectDate.Year+"-"+objectDate.Month+"-"+objectDate.Day+"T00:00:00");

                                        //Création de l'objet publication
                                        let publication:PublicationAttributes =
                                            {
                                                idPublication: id,
                                                title: title,
                                                abstract: abstractText,
                                                authors: authors.toString(),
                                                doi: doi,
                                                datePublication: date
                                            };

                                        publications.push(publication);
                                    }
                                }
                            }
                            resolve(publications);
                        }
                    );
                }
            );
        }
    );
};