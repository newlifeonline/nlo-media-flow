const VimeoService = require('./VimeoService');
const request = require('request');

module.exports = async function (context, req) {
    const vimeoToken = process.env["VIMEO_TOKEN"];
    const vimeoSvc = new VimeoService(request, vimeoToken);

    const videoId = 0;
    const imageId = '';

    const videoResponse = await vimeoSvc.getVideoById(videoId);
    const picUri = videoResponse.metadata.connections.pictures.uri;
    const uploadLinkResponse = await vimeoSvc.getThumbnailUploadLink(picUri);
    const uploadLink = uploadLinkResponse.link;
    const newPicUri = uploadLinkResponse.uri;

    const imgResponse = await vimeoSvc.getImageFromBlob(imageId);

    await vimeoSvc.putThumbnail(uploadLink, imgResponse);

    await vimeoSvc.patchThumbnail(newPicUri);

    context.res = {
        status: 204
    };
};