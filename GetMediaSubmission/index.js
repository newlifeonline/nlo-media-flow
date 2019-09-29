const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;
const azure = require('azure-storage');

module.exports = async function (context) {
    let connStr = process.env['NLO_STORAGE'];
    const input = context.bindings.input;

    const tableService = azure.createTableService(connStr);

    return await new Promise((resolve, reject) => {
        tableService.retrieveEntity('MediaFormSubmissions', 'nlo', input.id, {payloadFormat:"application/json;odata=nometadata"}, (error, result, response) => {
            if (error) {
                client.trackException({exception: error, tagOverrides:{"ai.operation.id": context.invocationId}});
                reject(error);
            } else {
                resolve(response.body);
            }
        });
    });
};