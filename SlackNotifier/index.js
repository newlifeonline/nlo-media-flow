const request = require('request');
const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context) {
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