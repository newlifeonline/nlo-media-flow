const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
    const submission = context.df.getInput();
    const vimeoResult = yield context.df.callActivity('VimeoNotifier', submission.entity);
    
    submission.entity.vimeoUri = vimeoResult.videoUri;
    submission.entity.vimeoId = vimeoResult.videoId;

    yield context.df.callActivity('SaveMediaSubmission', submission);
    yield context.df.callActivity('TransferGoogleFileToBlob', submission.entity.googleAudioFileId);
    yield context.df.callActivity('PodcastFeedGenerator');
    yield context.df.callActivity('TagIndexer', submission);

    return context.instanceId;
});