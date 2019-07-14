const request = require('request');
const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context) {
    const input = context.bindings.input;

    const vimeoId = input.vimeoId;
    
    const vimeoToken = process.env["VIMEO_TOKEN"];
    let options = {
        url: `https://api.vimeo.com/videos/${vimeoId}`,
        headers: {
            'Accept': 'application/vnd.vimeo.*+json;version=3.4',
            'Authorization': `bearer ${vimeoToken}`,
            'Content-Type': 'application/json'
        }
    }
    return await new Promise((resolve, reject) => {
        request.get(options, (error, response, body) => {
            if (error) {
                client.trackException({exception: error, tagOverrides:{"ai.operation.id": context.invocationId}});
                reject(error);
            } else {
                const data = JSON.parse(body);
                resolve(data);
            }
        });
    });
};