import * as UpdateModule from "../src/update";
import * as request from "request";
import * as xml2js from "xml2js";
import * as TextMining from "./../src/controllers/update/TextMining";

UpdateModule.updateDB();
/*TextMining.giveSymptomsWithOccurrenceWithLingPipe()
    .then(()=>{console.log("Data")})
    .catch((err:Error)=>{console.error(err)});*/