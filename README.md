
# Xray Service Client
This is a 2 classes package that allows you to easily connect to an xray server, and upload junit reports, using as reference this [xray-doc](https://docs.getxray.app/display/XRAYCLOUD/Testing+web+applications+using+Mocha+and+WebdriverIO)

## Installation
    - npm install xray-service-client

## Usage
Package contains only one public method reportToXray(options) where the options are
 - `project`: Name of the jira server project where you are pushing the results
 - `testPlan`: Name of the jira testplan where you are pushing the results
 - `resultsFolder`: Path to the folder where the testsresults are stored after execution
 - `fileName`: Name of the xml file name to be uploaded to xray
 - `cleanupFilesAfterUpload`: Setting this true will delete all the test results in the folder after uploading them
 - `host`: url to jira server api
 - `security`: parameter to pass client_id and client_secret

```
const {reportToXray} = require("xray-service-client");

let resultsDir = resolve(__dirname, './results/junit');
let options = {
    project: 'jira-project',
    testPlan: 'QA-14',
    resultsFolder: resultsDir,
    fileName: 'results.xml',
    cleanupFilesAfterUpload: false,
    host: 'https://xray.cloud.getxray.app/api/v1',
    security: {
        client_id: 'username',
        client_secret: 'password'
    }
}
await reportToXray(options);
```