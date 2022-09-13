const {Client} = require("./client");
const {Worker} = require("./worker");

async function reportToXray(options) {
    try {
        let worker = new Worker();
        worker.checkOptions(options);
        let requestBody = worker.generateRequest(options.resultsFoldern, options.fileName);

        const client = new Client(options.host);
        if(options.security){
            await client.login(options.security.client_id, options.security.client_secret);
        }

        await client.sendResults(options.project, options.testPlan, requestBody);

        if(options.cleanupFilesAfterUpload) {
            worker.cleanFolder(options.resultsFolder);
        }
    } catch (e) {
        console.error('Reports were not uploaded to Xray due error: ', e.message);
    }
}

module.exports = { reportToXray };