"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RootDirectory_1 = require("./RootDirectory");
exports.giveSymptomsWithOccurrenceWithLingPipe = function (publications, orphanetID) {
    return new Promise((resolve, reject) => {
        console.info("Text mining in publications of disease: " + orphanetID + " ...");
        let lingPipeProcess = require('child_process').spawn('java', ['-jar', RootDirectory_1.default() + "jars/lingPipe.jar", 'anArgument']);
        let symptomsWithSize = [];
        //console.log("Length: "+publications.length);
        //Work in progress (called several times, for each symptoms detected)
        lingPipeProcess.stdout.on('data', function (data) {
            //console.log("Nombre de symptomes identifiés: "+ symptomsWithSize.length);
            let symptom = data.toString();
            //Check if symptom already here and if true, give index i
            let i = 0;
            let symptomAlreadyUsed = false;
            while (!symptomAlreadyUsed && i < symptomsWithSize.length) {
                if (symptomsWithSize[i].name === symptom) {
                    symptomAlreadyUsed = true;
                }
                else {
                    i++;
                }
            }
            //Increment counter or Add to array
            if (symptomAlreadyUsed) {
                symptomsWithSize[i].weight++;
            }
            else {
                symptomsWithSize.push({ name: symptom, weight: 1, orphanetID: orphanetID });
            }
        });
        lingPipeProcess.stderr.on("data", function (data) {
            reject(Error(data.toString()));
        });
        //When it's finished
        lingPipeProcess.on('exit', function () {
            console.info("Text mining in publications of disease: " + orphanetID + " finished");
            resolve(symptomsWithSize);
        });
        //We send publications JSON via STDIN
        lingPipeProcess.stdin.write(JSON.stringify(publications) + "\n");
    });
};
//# sourceMappingURL=TextMining.js.map