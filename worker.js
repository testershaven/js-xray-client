const fs = require("fs");

class Worker {
    cleanFolder(resultsDir) {
        const fileNames = fs.readdirSync(resultsDir);
        fileNames.forEach((fileName) => {
            fs.unlinkSync(`${resultsDir}/${fileName}`);
        });
    }

    generateRequest(resultsDir, fileName) {
        let rawContent = fs.readFileSync(`${resultsDir}/${fileName}`).toString();
        return rawContent;
    };

    checkOptions(options){
        if (!options.project) throw new InputError('Project not provided');
        if (!options.resultsFolder) throw new InputError('Results Folder not provided');
        if (!options.host) throw new InputError('Host not provided');

        if (options.security){
            if (!options.security.client_id) throw new InputError('Security enabled but client_id not provided');
            if (!options.security.client_secret) throw new InputError('Security enabled but client_secret not provided');
        }
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