const request = require('request');
const appInsights = require("applicationinsights");

module.exports = async function (context) {
    appInsights.setup().start();
    const client = appInsights.defaultClient;
    
    const input = context.bindings.input.fileId;    
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