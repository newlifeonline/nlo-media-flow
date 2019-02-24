module.exports = async function (context, req) {
    if (req.body) {
        const title = req.body.title;
        const desc = req.body.description;
        const fileId = req.body.googleVideoFileId;
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
            headers : {
                'Accept': 'application/vnd.vimeo.*+json;version=3.4',
                'Authorization': `bearer ${vimeoToken}`,
                'Content-Type': 'application/json'
            },
            json: vimeoUpload
        }
        request.post(options, (error, response, body) => {
            if (error) {
                context.log(error);
                context.res = {
                    status: 500, /* Defaults to 200 */
                    body: "Error occured while contacting vimeo"
                };
            } else {
                const videoUri = body.uri;
                context.log(videoUri);
                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: {
                        vimeoUri: videoUri
                    }
                };
            }
        });
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a body"
        };
    }
};