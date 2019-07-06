const request = require('request');
const appInsights = require("applicationinsights");
const VimeoService = require('./VimeoService');
const BlobService = require('./BlobService');

appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context) {
    try {
        const vimeoToken = process.env["VIMEO_TOKEN"];
        const baseBlobUrl = process.env["BASE_BLOB_URL"];

        const vimeoSvc = new VimeoService(request, vimeoToken);
        const blobSvc = new BlobService(request, baseBlobUrl);

        const input = context.bindings.input;

        const videoId = input.videoId;
        const imageId = input.imageId;

        const videoResponse = await vimeoSvc.getVideoById(videoId);
        
        const picUri = videoResponse.metadata.connections.pictures.uri;
        
        const uploadLinkResponse = await vimeoSvc.getThumbnailUploadLink(picUri);

        const uploadLink = uploadLinkResponse.link;

        const imgResponse = await blobSvc.getImageFromBlob(imageId);

        return await vimeoSvc.putThumbnail(uploadLink, imgResponse);           
    } catch (error) {
        client.trackException({exception: error, tagOverrides:{"ai.operation.id": context.invocationId}});
    }
};