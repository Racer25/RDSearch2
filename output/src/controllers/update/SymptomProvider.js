"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const gracefulFs = require("graceful-fs");
gracefulFs.gracefulify(fs);
const RootDirectory_1 = require("./RootDirectory");
var SymptomProvider;
(function (SymptomProvider) {
    let symptoms = [];
    function getSymptoms() {
        return new Promise((resolve) => {
            if (symptoms.length === 0) {
                getSymptomsFromFile(function (symptomsFromFile) {
                    symptoms = symptomsFromFile;
                    resolve(symptoms);
                });
            }
            else {
                resolve(symptoms);
            }
        });
    }
    SymptomProvider.getSymptoms = getSymptoms;
})(SymptomProvider = exports.SymptomProvider || (exports.SymptomProvider = {}));
let getSymptomsFromFile = function (callback) {
    let dictionary = [];
    let lineReader = require('readline').createInterface({
        input: fs.createReadStream(RootDirectory_1.default() + 'resources/hp.obo')
    });
    lineReader.on('line', function (line) {
        if (line !== "" && line !== "\n") {
            let symptom = "";
            if (line.substring(0, 6) === "name: " && line !== "name: All" && line !== "name: All\n") {
                symptom = line.substring(6).toLowerCase();
            }
            else if (line.length > 10 && line.substring(0, 10) === "synonym: \"") {
                let index = 10;
                let char = line.charAt(index);
                do {
                    symptom += char;
                    index++;
                    char = line.charAt(index);
                } while (char !== "\""); //Char different from "
            }
            //Finally we add in dictionary
            if (symptom !== "" && isNaN(symptom)) {
                dictionary.push({ name: symptom.replace(/[^A-Za-z0-9\s]/g, '').toLowerCase() });
            }
        }
    });
    lineReader.on("close", function () {
        callback(dictionary);
    });
};
//# sourceMappingURL=SymptomProvider.js.map