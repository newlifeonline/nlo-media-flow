const request = require('request');
const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context) {
    const input = context.bindings.input;    
    const googleUrl = `https://docs.google.com/uc?id=${input}&export=download`;

    return await new Promise((resolve, reject) => {
        request.get(googleUrl, { encoding: null },  (error, response, body) => {
            if (error) {
                client.trackException({exception: error, tagOverrides:{"ai.operation.id": context.invocationId}});
                reject(error);
            } else {
                context.bindings.outputBlob = body;
                resolve();
            }
        });
    });
};