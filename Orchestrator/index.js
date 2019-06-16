const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
    const submission = context.df.getInput();

    if (submission.entity.googleVideoFileId) {
        const vimeoResult = yield context.df.callActivity('VimeoNotifier', submission.entity);
        submission.entity.vimeoUri = vimeoResult.videoUri;
        submission.entity.vimeoId = vimeoResult.videoId;
    } else if (submission.entity.videoId) {
        submission.entity.vimeoUri = `/videos/${submissoin.entity.videoId}`;
    }
    // TODO - update vimeo with title and desc

    yield context.df.callActivity('SaveMediaSubmission', submission);

    if (submission.entity.googleAudioFileId)
        yield context.df.callActivity('TransferGoogleFileToBlob', submission.entity.googleAudioFileId);
    
    if (submission.entity.googleAudioImageFileId)
        yield context.df.callActivity('TransferGoogleFileToBlob', submission.entity.googleAudioImageFileId);
    
    if (submission.entity.googleVideoImageFileId)
        yield context.df.callActivity('TransferGoogleFileToBlob', submission.entity.googleVideoImageFileId);
    
    yield context.df.callActivity('PodcastFeedGenerator');
    yield context.df.callActivity('TagIndexer', submission);

    const slackPayload = {
        attachments: [
            {
                title: encodeURI(submission.entity.title),
                text: 'Processing complete'
            }
        ]
    };

    yield context.df.callActivity('SlackNotifier', slackPayload);

    return context.instanceId;
});