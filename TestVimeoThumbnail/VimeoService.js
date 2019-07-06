class VimeoService {
    constructor (request, vimeoToken) {
        this.request = request;
        this.vimeoToken = vimeoToken;
    }
    async getVideoById(videoId) {
        let url = `https://api.vimeo.com/videos/${videoId}`;
        let options = {
            headers: {
                'Accept': 'application/vnd.vimeo.*+json;version=3.4',
                'Authorization': `bearer ${this.vimeoToken}`,
                'Content-Type': 'application/json'
            }
        }

        return await new Promise((resolve, reject) => {
            this.request.get(url, options, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });
    }
    async getThumbnailUploadLink(pictureUri) {
        let url = `https://api.vimeo.com${pictureUri}`;
        let options = {
            headers: {
                'Accept': 'application/vnd.vimeo.*+json;version=3.4',
                'Authorization': `bearer ${this.vimeoToken}`,
                'Content-Type': 'application/json'
            }
        }

        return await new Promise((resolve, reject) => {
            this.request.post(url, options, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });
    }
    async patchThumbnail(pictureUri) {
        let options = {
            url: `https://api.vimeo.com${pictureUri}`,
            headers: {
                'Accept': 'application/vnd.vimeo.*+json;version=3.4',
                'Authorization': `bearer ${this.vimeoToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'active': true })
        }

        return await new Promise((resolve, reject) => {
            this.request.patch(options, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });
    }
    async putThumbnail(thumbnailUrl, imgResponse) {
        let options = {
            url: thumbnailUrl,
            headers: {
                'Accept': 'application/vnd.vimeo.*+json;version=3.4',
                'Content-Type': imgResponse.type
            },
            body: imgResponse.body
        }

        return await new Promise((resolve, reject) => {
            this.request.put(options, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(body);
                }
            });
        });
    }
    async getImageFromBlob(imageId) {
        //const googleUrl = `https://docs.google.com/uc?id=${imageId}&export=download`;
        //let url = `/images/${imageId}`;

        return await new Promise((resolve, reject) => {
            this.request.get(googleUrl, { encoding: null }, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    var header = response.headers['content-type'];
                    resolve({ type: header, body: body });
                }
            });
        });
    }
}

module.exports = VimeoService;