const fs = require("fs");

class Worker {
    checkOptions(options){
        if (!options.project) throw new InputError('Project not provided');
        if (!options.resultsFolder) throw new InputError('Results Folder not provided');
        if (!options.host) throw new InputError('Host not provided');
        if (!options.testPlan) throw new InputError('Test plan not provided');

        if (options.security){
            if (!options.security.client_id) throw new InputError('Security enabled but client_id not provided');
            if (!options.security.client_secret) throw new InputError('Security enabled but client_secret not provided');
        }
    }

    generateXmlRequestBody(resultsDir, fileName) {
        let rawContent = fs.readFileSync(`${resultsDir}/${fileName}`).toString();
        return rawContent;
    };

    generateXrayRequestFromAllureJson(testSuites, options) {
        let info = {
            summary : options.title,
            description : "This execution is automatically created when importing execution results from an external source",
            startDate : this.formatEpoch(Math.min(...testSuites.map(x => parseInt(x.start)))),
            finishDate : this.formatEpoch(Math.max(...testSuites.map(x => parseInt(x.stop)))),
            testPlanKey : options.testPlan,
        }

        let testCases = [];
        testSuites.forEach(rts => {
            rts.testCases.forEach(rtc => {
                if(rtc.testId !== '') {
                    let defects = [];
                    if (rtc.issueId !== '') {
                        defects.push(rtc.issueId)
                    }

                    let steps = [];
                    let evidence = [];
                    for (const step of rtc.steps) {
                        if (step.attachment.contentType !== undefined) {
                            evidence.push(step.attachment)
                        }

                        let newStep =  {
                            status: step.status,
                            comment: step.name._text,
                        }
                        steps.push(newStep);
                    }

                    let testCase = {
                        testKey : rtc.testId,
                        start : this.formatEpoch(parseInt(rtc.start)),
                        finish : this.formatEpoch(parseInt(rtc.stop)),
                        status : rtc.status,
                        defects,
                        evidence,
                    };
                    testCases.push(testCase);
                }
            });
        });

        let response = {
            info: info,
            tests: testCases
        }
        if(options.testExecutionKey !== '') response['testExecutionKey'] = options.testExecutionKey;

        return response;
    };

    formatEpoch(epoch) {
        return new Date(epoch).toISOString().split('.')[0] + '+00:00'
    }
}

class InputError extends Error {
    constructor(message) {
        super(message);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InputError);
        }
        this.name = 'InputError';
    }
}

module.exports = {Worker};