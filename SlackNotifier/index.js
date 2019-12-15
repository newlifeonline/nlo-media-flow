const request = require('request');
const appInsights = require("applicationinsights");

module.exports = async function (context) {
    appInsights.setup().start();
    const client = appInsights.defaultClient;

    const input = context.bindings.input;
    const slackUrl = process.env['SLACK_WEBHOOK'];

    let options = {
        url: slackUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        json: input
    }
    return await new Promise((resolve, reject) => {
        request.post(options, (error, response) => {
            if (error) {
                client.trackException({exception: error, tagOverrides:{"ai.operation.id": context.invocationId}});
                context.log(error);
                reject(error);
            } else {
                resolve();
            }
        });
    });

}