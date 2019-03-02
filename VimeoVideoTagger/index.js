const request = require('request');

module.exports = async function (context) {
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
                context.log(error);
                reject(error);
            } else {
                resolve();
            }
        });
    });
};