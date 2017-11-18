import * as fs from "fs";
import * as gracefulFs from "graceful-fs";
gracefulFs.gracefulify(fs);

import RootDirectory from "./RootDirectory";
import {SymptomAttributes} from "../../models/symptom";


export namespace SymptomProvider {

    let symptoms:Array<SymptomAttributes> = [];
    export function getSymptoms()
    {
        return new Promise((resolve)=>
            {
                if (symptoms.length === 0)
                {
                    getSymptomsFromFile(
                        function (symptomsFromFile)
                        {
                            symptoms = symptomsFromFile;
                            resolve(symptoms);
                        }
                    );
                }
                else
                {
                    resolve(symptoms);
                }
            }
        );
    }
}


let getSymptomsFromFile = function (callback:(dictionary:Array<SymptomAttributes>)=>void)
{
    let dictionary:Array<SymptomAttributes> = [];

    let lineReader = require('readline').createInterface(
        {
            input: fs.createReadStream(RootDirectory() + 'resources/hp.obo')
        }
    );

    lineReader.on('line', function (line:string) {
        if (line !== "" && line !== "\n")
        {
            let symptom = "";
            if (line.substring(0, 6) === "name: " && line !== "name: All" && line !== "name: All\n")
            {
                symptom = line.substring(6).toLowerCase();
            }
            else if (line.length > 10 && line.substring(0, 10) === "synonym: \"")
            {
                let index = 10;
                let char = line.charAt(index);
                do
                {
                    symptom += char;
                    index++;
                    char = line.charAt(index);
                } while (char !== "\"");//Char different from "
            }

            //Finally we add in dictionary
            if (symptom !== "" && isNaN(symptom as any))
            {
                dictionary.push({name:symptom.replace(/[^A-Za-z0-9\s]/g, '').toLowerCase()});
            }
        }

    });

    lineReader.on("close",
        function () {
            callback(dictionary);
        }
    );

};