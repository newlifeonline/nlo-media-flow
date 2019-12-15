const request = require('request');
const appInsights = require("applicationinsights");

module.exports = async function (context) {
    appInsights.setup().start();
    const client = appInsights.defaultClient;
    
    const input = context.bindings.input;

    const videoId = input.videoId;
    const tag = input.tag;
    
    const vimeoToken = process.env["VIMEO_TOKEN"];

    const url = `https://api.vimeo.com/videos/${videoId}/tags/${tag}`;

    let options = {
        headers: {
            'Authorization': `bearer ${vimeoToken}`,
            'Content-Type': 'application/json'
        }
    }
    return await new Promise((resolve, reject) => {
        request.put(url, options, (error, response, body) => {
            if (error) {
                client.trackException({exception: error, tagOverrides:{"ai.operation.id": context.invocationId}});
                reject(error);
            } else {
                resolve();
            }
        });
    });
};