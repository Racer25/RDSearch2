let yearsRequest = function()
{
    return new Promise(
        (resolve, reject) =>
        {
            // Ecrire requête Ajax
            let maRequeteAJAX = new XMLHttpRequest();
            maRequeteAJAX.open("GET", "/years/", true);
            maRequeteAJAX.responseType = "json";

            maRequeteAJAX.onreadystatechange = function ()
            {
                if (this.readyState === 4)
                { // requete terminée
                    if(this.status === 200)
                    {
                        //Requête ok
                        let years=this.response;

                        //DOM method
                        resolve(years);
                    }
                    else
                    {
                        console.error("Error in years request, status: "+this.status);
                        reject([]);
                    }
                }
            };

            //On envoie au serveur node.js
            maRequeteAJAX.send();
        }
    );
};

let topDiseasesRequest = function(year)
{
    return new Promise(function(resolve, reject)
        {
            // Ecrire requête Ajax
            let maRequeteAJAX = new XMLHttpRequest();
            maRequeteAJAX.open("GET", "/topDiseases/"+year, true);
            maRequeteAJAX.responseType = "json";

            maRequeteAJAX.onreadystatechange = function ()
            {
                if (this.readyState === 4)
                { // requete terminée
                    if(this.status === 200)
                    {
                        //Requête ok
                        let diseases=this.response;

                        //DOM method
                        resolve(diseases);
                    }
                    else
                    {
                        console.error("Error in topDiseases request, status: "+this.status);
                        reject([]);
                    }
                }
            };

            //On envoie au serveur node.js
            maRequeteAJAX.send();
        }
    );
};

let suggestionsRequest = function(terms, search)
{
    return new Promise((resolve, reject) =>
    {
        // Ecrire requête Ajax
        let maRequeteAJAX = new XMLHttpRequest();
        maRequeteAJAX.open("GET", "/suggestions/"+terms, true);
        maRequeteAJAX.responseType = "json";

        maRequeteAJAX.onreadystatechange = function ()
        {
            if (this.readyState === 4)
            { // requete terminée
                if(this.status === 200)
                {
                    //Requête ok
                    let suggestedDiseases=this.response;

                    //Ordering suggestions with levenshtein distance
                    suggestedDiseases=suggestedDiseases.sort(function(a, b){return getEditDistance(a.name, search)-getEditDistance(b.name, search)});

                    //Top 5 of suggestions
                    suggestedDiseases=suggestedDiseases.filter(function(currentValue, index){return index < 5});

                    //DOM method
                    resolve(suggestedDiseases);
                }
                else
                {
                    console.error("Error in search request, status: "+this.status);
                    reject();
                }
            }
        };

        //On envoie au serveur node.js
        maRequeteAJAX.send();
    });
};

let exactMatchRequest = function(search)
{
    return new Promise((resolve, reject) =>
        {
            // Ecrire requête Ajax
            let maRequeteAJAX = new XMLHttpRequest();
            maRequeteAJAX.open("GET", "/exactMatch/"+search, true);
            maRequeteAJAX.responseType = "json";

            maRequeteAJAX.onreadystatechange = function ()
            {
                if (this.readyState === 4)
                { // requete terminée
                    if(this.status === 200)
                    {
                        //Requête ok
                        //Exact Match?
                        if(this.response.length !== 0)
                        {
                            resolve(this.response[0].orphanetID);
                        }
                        else
                        {
                            reject();
                        }
                    }
                    else
                    {
                        console.error("Error in exactMatchRequest, status: "+this.status);
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
    let selectDate=document.getElementById("selectDate");

    //Years update
    yearsRequest()
        .then(years =>
            {
                //Update HTML years
                updateYears(years);

                //Preparing topDiseases
                if(selectDate !== null)
                {
                    if(selectDate.options.length !== 0)
                    {
                        //Initialisation
                        let year=selectDate.options[0].value;
                        return topDiseasesRequest(year);
                    }
                }
                else{return topDiseasesRequest(null); }
            }
        )
        //Update HTML topDiseases
        .then(diseases => {updateTopDiseases(diseases);});


    //Reacting on changes
    document.getElementById("selectDate").onchange = function()
    {
        let year=selectDate.options[selectDate.selectedIndex].value;
        topDiseasesRequest(year).then(diseases => {updateTopDiseases(diseases)});
    };

    //Search bar
    if(document.getElementById("search") !== null)
    {
        document.getElementById("search").oninput=function()
        {
            let search=document.getElementById("search").value;
            if(search !== "")
            {
                if(search.length >3)
                {
                    let terms=[];

                    //Separate into words
                    let tab=search.split(" ");
                    for(let i=0; i < tab.length; i++)
                    {
                        let tab2=tab[i].split("-");
                        terms= terms.concat(tab2);
                    }
                    //Delete comas
                    for(let i=0; i < terms.length; i++)
                    {
                        terms[i]=terms[i].replace(",", "");
                    }

                    //Filter duplicate
                    terms = terms.filter(function(elem, index, self) { return index === self.indexOf(elem)});

                    //Do the ajax(s) request(s)
                    exactMatchRequest(search)
                        .then(orphanetID =>
                            {
                                console.log("Exact match");
                                exactMatch=true;
                                showUpdateButton(orphanetID);
                                updateSuggestions([]);
                            }
                        )
                        .catch(() =>
                            {
                                console.log("No exact match");
                                exactMatch=false;
                                hideUpdateButton();
                                return suggestionsRequest(terms, search);
                            }
                        )
                        .then(suggestedDiseases =>{updateSuggestions(suggestedDiseases)});
                }
                else
                {
                    updateSuggestions([]);
                }
            }
            else
            {
                updateSuggestions([]);
            }
        }
    }

    //Use of arrows
    if(document !== null)
    {
        document.onkeydown = function(e) {
            switch (e.keyCode) {
                case 38:
                    upInSuggestions();
                    break;
                case 40:
                    downInSuggestions();
                    break;
                case 13:
                    enterScript();
                    break;
            }
        };
    }
};