class BlobService {
    constructor (request, baseBlobUrl) {
        this.request = request;
        this.baseBlobUrl = baseBlobUrl;
    }
    async getImageFromBlob(imageId) {
        const url = `${this.baseBlobUrl}/images/${imageId}`;

        return await new Promise((resolve, reject) => {
            this.request.get(url, { encoding: null }, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    if (response.code > 399) {
                        reject('error downloading file');
                    } else {
                        var header = response.headers['content-type'];
                        resolve({ type: header, body: body });
                    }
                }
            });
        });
    }
}

module.exports = BlobService;