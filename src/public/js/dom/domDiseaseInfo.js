let showGraph = function(data)
{
    let ctx = document.getElementById("graphPublicationsPerYear").getContext('2d');
    let myChart = new Chart(
        ctx, 
        {
            type: 'line',
            data: 
            {
                datasets:
                [
                    {
                        label: '# of publications by year',
                        borderColor:"#2E64FE",
                        backgroundColor:"#8181F7",
                        xAxisID:"year",
                        yAxisID:"numberOfPublications",
                        showline:true,
                        data: data,
                        lineTension: 0.5
                    }
                ]
            }
            ,
            options: {
                scales: {
                    yAxes: 
                    [
                        {
                            id:"numberOfPublications",
                            type:"linear",
                            ticks: 
                            {
                                beginAtZero:true,
                                maxTicksLimit:20
                            }
                        }
                    ],
                    xAxes: 
                    [
                        {
                            id:"year",
                            type:"linear",
                            ticks: 
                            {
                                stepSize:1,
                                beginAtZero:false
                            }
                        }
                    ]
                },
                title:
                {
                    display:true,
                    position:"top",
                    text:"Publications per year"
                },
                elements: {
                    line: {
                        tension: 0, // disables bezier curves
                    }
                },
                animation:
                {
                    easing:"easeOutExpo"
                }
            }
        }
    );
};

let dispRareDiseaseName = function(name)
{
    //<h1><b><%= disease.name %></b></h1>
    let h1 = document.createElement("h1");
    let b = document.createElement("b");
    b.textContent = name;

    h1.appendChild(b);
    document.getElementById("diseaseNameDiv").appendChild(h1);
};

let dispTextualInformation = function(textualInformation)
{
    //<h1><b><%= disease.name %></b></h1>
    let textualInformationDiv = document.getElementById("textualInformationDiv");
    if(textualInformation.length === 0)
    {
        //<h4><b>No description...</b></h4>
        let h4 = document.createElement("h4");
        let b = document.createElement("b");
        b.textContent = "No description...";

        h4.appendChild(b);
        textualInformationDiv.appendChild(h4);
    }
    else
    {
        for(let i = 0; i<textualInformation.length; i++)
        {
            /*<h2><b><%=textualInformations[i].title%>:</b></h2>
                        <p><%= textualInformations[i].content%></p>
                        <div class="w3-container">
                            <p class="w3-col s11 m11 l11"></p>
                            <p class="w3-col s1 m1 l1" >
                                Source:
                                <a href="<%=textualInformations[i].sourceLink%>" target="_blank">
                                    <%= textualInformations[i].sourceName%>
                                </a>
                            </p>
                        </div>*/
            //Title
            let h2 = document.createElement("h2");
            let b = document.createElement("b");
            b.textContent = textualInformation[i].title;
            h2.appendChild(b);
            textualInformationDiv.appendChild(h2);

            //Content
            let pContent = document.createElement("p");
            pContent.textContent = textualInformation[i].content;
            textualInformationDiv.appendChild(pContent);

            //Source
            let divSource = document.createElement("div");
            divSource.className = "w3-container";
            let p1 = document.createElement("p");
            p1.className = "w3-col s11 m11 l11";
            divSource.appendChild(p1);

            let p2 = document.createElement("p");
            p2.className = "w3-col s1 m1 l1";
            p2.textContent = "Source: ";

            let a = document.createElement("a");
            a.href = textualInformation[i].sourceLink;
            a.target = "_blank";
            a.textContent = textualInformation[i].sourceName;
            p2.appendChild(a);

            divSource.appendChild(p2);

            textualInformationDiv.appendChild(divSource);
        }
    }
};

let dispMostCitedPublications = function(publications)
{
    if(publications.length === 0)
    {
        let h4 = document.createElement("h4");
        let b = document.createElement("b");
        b.textContent = "No publications found on Pubmed for this disease...";
        h4.appendChild(b);
        document.getElementById("mostCitedPublicationsDiv").appendChild(h4);
    }
    else
    {
        for(let i = 0; i < publications.length; i++)
        {
            let p = document.createElement("p");
            let a = document.createElement("a");
            let b = document.createElement("b");
            a.href = "https://scholar.google.ca/scholar?q="+publications[i].doi;
            a.target = "_blank";

            b.className = "titleToTruncate";
            b.textContent = publications[i].title;

            a.appendChild(b);
            p.appendChild(a);
            document.getElementById("mostCitedPublicationsDiv").appendChild(p);
        }
    }
};

let truncate = function(selector, maxLength)
{
    let elements = document.querySelectorAll(selector);
    for(let i =0; i < elements.length; i++)
    {
        if (elements[i].innerText.length > maxLength)
        {
            elements[i].innerText = elements[i].innerText.substr(0, maxLength) + '...';
        }
    }
};