let allDiseaseInformationRequest = function(orphanetID)
{
    return new Promise((resolve, reject) =>
        {
            // Ecrire requête Ajax
            let maRequeteAJAX = new XMLHttpRequest();
            maRequeteAJAX.open("GET", "/disease/"+orphanetID+"/all", true);
            maRequeteAJAX.responseType = "json";

            maRequeteAJAX.onreadystatechange = function ()
            {
                if (this.readyState === 4)
                { // requete terminée
                    if(this.status === 200)
                    {
                        //Requête ok
                        let diseaseComplete=this.response;
                        resolve(diseaseComplete);
                    }
                    else
                    {
                        console.error("Error in graphDataRequest, status: "+this.status);
                        reject();
                    }
                }
            };

            //On envoie au serveur node.js
            maRequeteAJAX.send();
        }
    );
};

let infoRequest = function(orphanetID)
{
    return new Promise((resolve, reject) =>
        {
            // Ecrire requête Ajax
            let maRequeteAJAX = new XMLHttpRequest();
            maRequeteAJAX.open("GET", "/disease/"+orphanetID+"/info", true);
            maRequeteAJAX.responseType = "json";

            maRequeteAJAX.onreadystatechange = function ()
            {
                if (this.readyState === 4)
                { // requete terminée
                    if(this.status === 200)
                    {
                        //Requête ok
                        let rareDisease=this.response;

                        resolve(rareDisease);
                    }
                    else
                    {
                        console.error("Error in graphDataRequest, status: "+this.status);
                        reject();
                    }
                }
            };

            //On envoie au serveur node.js
            maRequeteAJAX.send();
        }
    );
};

let threeMostCitedPublicationsRequest = function(orphanetID)
{
    return new Promise((resolve, reject) =>
        {
            // Ecrire requête Ajax
            let maRequeteAJAX = new XMLHttpRequest();
            maRequeteAJAX.open("GET", "/disease/"+orphanetID+"/mostCitedPublications", true);
            maRequeteAJAX.responseType = "json";

            maRequeteAJAX.onreadystatechange = function ()
            {
                if (this.readyState === 4)
                { // requete terminée
                    if(this.status === 200)
                    {
                        //Requête ok
                        let rareDisease=this.response;

                        resolve(rareDisease);
                    }
                    else
                    {
                        console.error("Error in graphDataRequest, status: "+this.status);
                        reject();
                    }
                }
            };

            //On envoie au serveur node.js
            maRequeteAJAX.send();
        }
    );
};

let graphDataRequest = function(orphanetID)
{
    return new Promise((resolve, reject) =>
        {
            // Ecrire requête Ajax
            let maRequeteAJAX = new XMLHttpRequest();
            maRequeteAJAX.open("GET", "/disease/"+orphanetID+"/graphData", true);
            maRequeteAJAX.responseType = "json";

            maRequeteAJAX.onreadystatechange = function ()
            {
                if (this.readyState === 4)
                { // requete terminée
                    if(this.status === 200)
                    {
                        //Requête ok
                        let rareDisease_Years=this.response;

                        resolve(rareDisease_Years);
                    }
                    else
                    {
                        console.error("Error in graphDataRequest, status: "+this.status);
                        reject();
                    }
                }
            };

            //On envoie au serveur node.js
            maRequeteAJAX.send();
        }
    );
};

let symptomsCloudWordRequest = function(orphanetID)
{
    return new Promise((resolve, reject) =>
        {
            // Ecrire requête Ajax
            let maRequeteAJAX = new XMLHttpRequest();
            maRequeteAJAX.open("GET", "/disease/"+orphanetID+"/symptoms", true);
            maRequeteAJAX.responseType = "json";

            maRequeteAJAX.onreadystatechange = function ()
            {
                if (this.readyState === 4)
                { // requete terminée
                    if(this.status === 200)
                    {
                        //Requête ok
                        let symptomsWithWeight=this.response;
                        resolve(symptomsWithWeight);
                    }
                    else
                    {
                        console.error("Error in symptomsCloudWordRequest, status: "+this.status);
                        reject();
                    }
                }
            };

            //On envoie au serveur node.js
            maRequeteAJAX.send();
        }
    );
};

window.onload = function() 
{
    //Retreving and disping disease info
    let orphanetID=document.getElementById("orphanetID").getAttribute("value");

    allDiseaseInformationRequest(orphanetID)
        .then(diseaseComplete =>
            {
                //dispRareDiseaseName
                dispRareDiseaseName(diseaseComplete.name);

                //Disp textual information
                dispTextualInformation(diseaseComplete.textualInformation);

                //Disp MostCitedPublication
                dispMostCitedPublications(diseaseComplete.mostCitedPublications);
                //Truncate publications title
                truncate(".titleToTruncate", 100);

                //Disp graph
                if(document.getElementById("graphPublicationsPerYear") !== null)
                {
                    //Transforming data to Chart.js format
                    let rareDisease_Years = diseaseComplete.graphData;
                    let graphData=[];
                    for(let i = 0; i < rareDisease_Years.length; i++)
                    {
                        let point=
                            {
                                x:Number(rareDisease_Years[i].year),
                                y:Number(rareDisease_Years[i].numberOfPublications)
                            };
                        graphData.push(point);
                    }
                    showGraph(graphData);
                }

                //Disp cloud word of symptoms
                if(document.getElementById("symptomsCloudPanel") !== null)
                {
                    //Passing from weight to size attribute
                    let symptomsWithWeight = [];
                    for(let i = 0; i < diseaseComplete.symptoms.length; i++)
                    {
                        symptomsWithWeight.push({text:diseaseComplete.symptoms[i].name, size:diseaseComplete.symptoms[i].weight});
                    }

                    updateCloudWord(symptomsWithWeight);
                }
            }
        );
};