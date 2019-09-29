const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
    const submission = context.df.getInput();
    //const submissionsTable = context.bindings.inputTable;
/*
    for (let index = 0; index < submissionsTable.length; index++) {
        const submission = submissionsTable[index];

        const vimeoResponse = yield context.df.callActivity('VimeoVideoDataFetch', { vimeoId: submission.vimeoId });
    
        submission.thumbUrlLarge = vimeoResponse.pictures ? vimeoResponse.pictures.sizes.filter(s => s.width === 960)[0].link : '';
        submission.thumbUrlSmall = vimeoResponse.pictures ? vimeoResponse.pictures.sizes.filter(s => s.width === 295)[0].link : '';

        yield context.df.callActivity('SaveMediaSubmission', { id: submission.RowKey, entity: submission });
    }*/

    yield context.df.callActivity('TagJsonGenerator', submission);
    //yield context.df.callActivity('VimeoChannelUpdater', submission);
    /*
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
    */
    return context.instanceId;
});