const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
    const submission = context.df.getInput();

    //yield context.df.callActivity('VimeoChannelUpdater', submission);

    if (submission.entity.googleVideoImageFileId) {
        yield context.df.callActivity('TransferImageFileToBlob', submission.entity.googleVideoImageFileId);

        if (submission.entity.vimeoId) {
            yield context.df.callActivity('VimeoImageUpload', 
                {   
                    videoId: submission.entity.vimeoId, 
                    imageId: submission.entity.googleVideoImageFileId 
                });
        }
    }

    return context.instanceId;
});