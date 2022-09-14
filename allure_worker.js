const fs = require("fs");
const convert = require("xml-js");

class AllureWorker {
    async generateSuitesFromAllureXml(resultsDir) {
        this.resultsDir = resultsDir;
        let testSuites = [];
        const fileNames = fs.readdirSync(this.resultsDir);

        for (const fileName of fileNames) {
            if (fileName.includes('.xml')) {
                let stringXml = fs.readFileSync(`${this.resultsDir}/${fileName}`).toString()
                    .replaceAll('ns2:test-suite', 'testSuite')
                    .replaceAll('_attributes', 'atr')
                    .replaceAll('test-cases', 'testCases')
                    .replaceAll('stack-trace', 'stackTrace')
                    .replaceAll('test-case', 'testCase');

                var options = {compact: true, ignoreComment: true, spaces: 4};
                var result = convert.xml2js(stringXml, options);

                let xmlTestCases = result.testSuite.testCases.testCase;
                let jsonTestCases = await this.extractTestCases(xmlTestCases);

                let testSuite =     {
                    start: result.testSuite._attributes.start,
                    stop: result.testSuite._attributes.stop,
                    name: result.testSuite.name._text,
                    title: result.testSuite.title._text,
                    testCases: jsonTestCases,
                };
                testSuites.push(testSuite);
            }
        }
        return testSuites;
    }

    async extractTestCases(xmlTestCases) {
        let jsonTestCases = [];
        if(Array.isArray(xmlTestCases)) {
            for (const xmlTestCase of xmlTestCases) {
                let jsonTestCase = await this.extractTestCase(xmlTestCase)
                jsonTestCases.push(jsonTestCase);
            }
        } else if(xmlTestCases._attributes !== undefined) {
            let jsonTestCase = await this.extractTestCase(xmlTestCases)
            jsonTestCases.push(jsonTestCase);
        }
        return jsonTestCases;
    }

    async extractTestCase(xmlTestCase) {
        let jsonSteps = await this.extractSteps(xmlTestCase.steps.step);

        let failure = (xmlTestCase.failure !== undefined ) ? {
            message: xmlTestCase.failure.message._text,
            stackTrace: xmlTestCase.failure.stackTrace._text,
        } : {};

        let testId;
        if(xmlTestCase.labels.label.find(l => l._attributes.name === 'testId') !== undefined) {
            let testIdArray = xmlTestCase.labels.label.find(l => l._attributes.name === 'testId')._attributes.value.split('/');
            testId = testIdArray[testIdArray.length - 1];
        } else {
            testId = '';
        }

        let issueId;
        if(xmlTestCase.labels.label.find(l => l._attributes.name === 'issue') !== undefined) {
            let issueArray = xmlTestCase.labels.label.find(l => l._attributes.name === 'issue')._attributes.value.split('/');
            issueId = issueArray[issueArray.length-1];
        } else {
            issueId = '';
        }

        let jsonTestCase = {
            start: xmlTestCase._attributes.start,
            stop: xmlTestCase._attributes.stop,
            status: xmlTestCase._attributes.status,
            testId: testId,
            issueId: issueId,
            browser: xmlTestCase.parameters.parameter._attributes.value,
            name: xmlTestCase.name._text,
            title: xmlTestCase.title._text,
            failure: failure,
            steps: jsonSteps,
        };
        return jsonTestCase;
    }

    async extractSteps(xmlTestSteps) {
        let jsonTestSteps = [];
        if(Array.isArray(xmlTestSteps)) {
            for (const xmlTestStep of xmlTestSteps) {
                jsonTestSteps.push(...(await this.extractStep(xmlTestStep)));
            }
        } else if(xmlTestSteps._attributes !== undefined) {
            jsonTestSteps.push(...(await this.extractStep(xmlTestSteps)));
        }

        return jsonTestSteps;
    }

    async extractStep(step) {
        let jsonSteps = []; ;

        let attachment;
        if (step.attachments.attachment !== undefined ) {
            attachment = {
                data: fs.readFileSync( `${this.resultsDir}/${step.attachments.attachment._attributes.source}`).toString('base64'),
                filename: step.attachments.attachment._attributes.source,
                contentType: step.attachments.attachment._attributes.type
            }
        } else {
            attachment = {};
        }

        let jsonTestStep = {
            start: step._attributes.start,
            stop: step._attributes.stop,
            status: step._attributes.status,
            name: step.name,
            title: step.title,
            attachment: attachment,
        };

        jsonSteps.push(jsonTestStep);
        jsonSteps.push(...(await this.extractSteps(step.steps)))

        return jsonSteps;
    }
}

module.exports = {AllureWorker};