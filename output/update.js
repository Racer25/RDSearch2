"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron = require("cron");
const fs = require("fs");
const gracefulFs = require("graceful-fs");
gracefulFs.gracefulify(fs);
const http = require("http");
const other_1 = require("./models/other");
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
job.start();
exports.updateDB = function () {
    exports.download("http://www.orphadata.org/data/export/en_product1.json", __dirname + "/../resources/en_product1.json")
        .then(() => { return exports.isThereAnUpdateForDiseasesList(); })
        .catch(() => {
        console.error("Error!!");
    })
        .then(() => { console.error("Update detected test!!"); })
        .catch(() => {
        console.error("No update test!!");
    });
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
        }).on('error', function (err) {
            // Handle errors
            fs.unlink(dest, reject); // Delete the file async. (But we don't check the result)
        });
    });
};
exports.isThereAnUpdateForDiseasesList = function () {
    return new Promise((resolve, reject) => {
        let json = require(__dirname + "/../resources/en_product1.json");
        let lastUpdateDateFromJSON = json.JDBOR[0].date.substring(0, 10);
        return other_1.OtherModel.findOne()
            .then(otherTable => {
            console.log("DB: " + otherTable.lastUpdatedate + ", JSON: " + lastUpdateDateFromJSON);
            let lastUpdateDateFromDB = new Date(Date.parse(otherTable.lastUpdatedate.toDateString()));
            let lastUpdateDateFromJSON_DATE = new Date(Date.parse(lastUpdateDateFromJSON));
            if (lastUpdateDateFromDB === undefined || lastUpdateDateFromDB === null
                || lastUpdateDateFromJSON_DATE > lastUpdateDateFromDB) {
                console.log("Update found");
                return other_1.OtherModel.update({
                    idOther: 1,
                    lastUpdatedate: lastUpdateDateFromJSON
                }, { where: { idOther: 1 } })
                    .then(() => { resolve(); })
                    .catch(() => { reject(); });
            }
            else {
                console.log("No update found");
                reject();
            }
        });
    });
};
//# sourceMappingURL=update.js.map