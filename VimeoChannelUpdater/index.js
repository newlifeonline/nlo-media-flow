const request = require('request');
const appInsights = require("applicationinsights");

module.exports = async function (context) {
    appInsights.setup().start();
    const client = appInsights.defaultClient;
    
    const submission = context.bindings.input;  
    const tags = submission.tags;
    const videoId = submission.entity.vimeoId;
    const vimeoToken = process.env["VIMEO_EDIT_TOKEN"];

    const channelsUrl = `https://api.vimeo.com/videos/${videoId}/available_channels`;

    let options = {
        headers: {
            'Authorization': `bearer ${vimeoToken}`,
            'Content-Type': 'application/json'
        }
    }
    const fullResponse =  await new Promise((resolve, reject) => {
        request.get(channelsUrl, options, (error, response, body) => {
            if (error) {
                context.log(error);
                client.trackException({exception: error, tagOverrides:{"ai.operation.id": context.invocationId}});
                reject(error);
            } else {
                const parsed = JSON.parse(body);
                resolve(parsed);
            }
        });
    });

    const channels = fullResponse.data.map(c => { 
        const id =  c.uri.split('/')[2];
        return { name: c.name, channelId: id };
    });
    let matched = [];
    let notMatched = [];
    tags.forEach(t => {
        const upper = t.toUpperCase();
        const match = channels.find(c => c.name.toUpperCase() === upper);
        if (match)
            matched.push({tag: t, channel: match });
        else
            notMatched.push(t);
    });

    for (let i = 0; i < matched.length; i++) {
        const match = matched[i];
        const channelId = match.channel.channelId;
        let addToChannelUrl = `https://api.vimeo.com/channels/${channelId}/videos/${videoId}`;

        await new Promise((resolve, reject) => {
            request.put(addToChannelUrl, options, (error, response, body) => {
                if (error) {
                    context.log(error);
                    client.trackException({exception: error, tagOverrides:{"ai.operation.id": context.invocationId}});
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    for (let i = 0; i < notMatched.length; i++) {
        const tag = notMatched[i];
        const createChannelUrl = `https://api.vimeo.com/channels`;

        let createChannelOptions = options;
        createChannelOptions.json = {
            name: tag,
            privacy: 'anybody'
        }

        const newChannel = await new Promise((resolve, reject) => {
            request.post(createChannelUrl, createChannelOptions, (error, response, body) => {
                if (error) {
                    context.log(error);
                    client.trackException({exception: error, tagOverrides:{"ai.operation.id": context.invocationId}});
                    reject(error);
                } else {
                    resolve(body);
                }
            });
        });

        const channelId = newChannel.uri.split('/')[2];
        let addToChannelUrl = `https://api.vimeo.com/channels/${channelId}/videos/${videoId}`;

        await new Promise((resolve, reject) => {
            request.put(addToChannelUrl, options, (error, response, body) => {
                if (error) {
                    context.log(error);
                    client.trackException({exception: error, tagOverrides:{"ai.operation.id": context.invocationId}});
                    reject(error);
                } else {
                    resolve();
                }
            });
        }); 
    }
};