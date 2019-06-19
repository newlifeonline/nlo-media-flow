const request = require('request');
const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context) {
    const entity = context.bindings.input;  
    const vimeoToken = process.env["VIMEO_EDIT_TOKEN"];

    const url = `https://api.vimeo.com/videos/${entity.vimeoId}`;

    const jsonData = {
        name: entity.title,
        description: entity.description
    };

    context.log(jsonData);

    let options = {
        headers: {
            'Authorization': `bearer ${vimeoToken}`,
            'Content-Type': 'application/json'
        },
        json: jsonData
    }
    return await new Promise((resolve, reject) => {
        request.patch(url, options, (error, response, body) => {
            context.log('Patched');
            if (error) {
                context.log(error);
                client.trackException({exception: error, tagOverrides:{"ai.operation.id": context.invocationId}});
                reject(error);
            } else {
                resolve();
            }
        });
    });
};