const {Client} = require("./client");
const {Worker} = require("./worker");
const {AllureWorker} = require("./allure_worker");

async function reportToXrayWithAllureReport(options) {
        let allureWorker = new AllureWorker();
        let suites = await allureWorker.generateSuitesFromAllureXml(options.resultsFolder);

        let worker = new Worker();
        await worker.checkOptions(options);
        let requestBody = worker.generateXrayRequestFromAllureJson(suites, options);

        const client = new Client(options.host);
        if(options.security){
            await client.login(options.security.client_id, options.security.client_secret);
        }

        return await client.sendResultsAsXrayJson(JSON.stringify(requestBody));
}

async function reportToXrayWithJunitReport(options) {
        let worker = new Worker();
        await worker.checkOptions(options);
        let requestBody = worker.generateXmlRequestBody(options.resultsFolder, options.fileName);

        const client = new Client(options.host);
        if(options.security){
            await client.login(options.security.client_id, options.security.client_secret);
        }

        await client.sendResultsAsJunitReport(options.project, options.testPlan, requestBody);
}

module.exports = { reportToXrayWithJunitReport , reportToXrayWithAllureReport};