const request = require('request');

module.exports = async function (context) {
    const input = context.bindings.input;

    const title = input.title;
    const desc = input.description;
    const fileId = input.googleVideoFileId;
    
    const vimeoToken = process.env["VIMEO_TOKEN"];
    const googleUrl = `https://docs.google.com/uc?id=${fileId}&export=download`;

    let vimeoUpload = {
        'upload': {
            'approach': 'pull',
            'size': '0',
            'link': googleUrl
        },
        'name': title,
        'description': desc
    };

    let options = {
        url: 'https://api.vimeo.com/me/videos',
        headers: {
            'Accept': 'application/vnd.vimeo.*+json;version=3.4',
            'Authorization': `bearer ${vimeoToken}`,
            'Content-Type': 'application/json'
        },
        json: vimeoUpload
    }
    return await new Promise((resolve, reject) => {
        request.post(options, (error, response, body) => {
            if (error) {
                context.log(error);
                reject(error);
            } else {
                const videoUri = body.uri;
                context.log(videoUri);
                resolve(videoUri);
            }
        });
    });
};