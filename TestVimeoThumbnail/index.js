const VimeoService = require('./VimeoService');
const request = require('request');
const vimeoToken = process.env["VIMEO_TOKEN"];
const vimeoSvc = new VimeoService(request, vimeoToken);

module.exports = async function (context, req) {
    const videoId = 0;
    const imageId = '';

    const videoResponse = await vimeoSvc.getVideoById(videoId);
    console.dir(videoResponse, {depth: null});
    const picUri = videoResponse.metadata.connections.pictures.uri;
    const uploadLinkResponse = await vimeoSvc.getThumbnailUploadLink(picUri);
    const uploadLink = uploadLinkResponse.link;

    const imgResponse = await vimeoSvc.getImageFromBlob(imageId);

    await vimeoSvc.putThumbnail(uploadLink, imgResponse);

    //await vimeoSvc.patchThumbnail(picUri);

    context.res = {
        status: 204
    };
};