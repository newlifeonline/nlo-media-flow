const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
    const submission = context.df.getInput();
    
    const startSlackNotification = {
        attachments: [
            {
                title: submission.entity.title,
                text: 'Processing... :coffee:',
                color: '#00bcd4'
            }
        ]
    };

    yield context.df.callActivity('SlackNotifier', startSlackNotification);

    if (submission.entity.googleVideoFileId) {
        const vimeoResult = yield context.df.callActivity('VimeoNotifier', submission.entity);
        submission.entity.vimeoUri = vimeoResult.videoUri;
        submission.entity.vimeoId = vimeoResult.videoId;
    } else if (submission.entity.videoId) {
        submission.entity.vimeoUri = `/videos/${submission.entity.vimeoId}`;
        yield context.df.callActivity('VimeoDataUpdater', submission.entity);
    }

    yield context.df.callActivity('VimeoChannelUpdater', submission);

    yield context.df.callActivity('SaveMediaSubmission', submission);

    if (submission.entity.googleAudioFileId)
        yield context.df.callActivity('TransferPodcastFileToBlob', submission.entity.googleAudioFileId);
    
    if (submission.entity.googleAudioImageFileId)
        yield context.df.callActivity('TransferImageFileToBlob', submission.entity.googleAudioImageFileId);
    
    if (submission.entity.googleVideoImageFileId)
        yield context.df.callActivity('TransferImageFileToBlob', submission.entity.googleVideoImageFileId);
    
    yield context.df.callActivity('PodcastFeedGenerator');
    yield context.df.callActivity('TagIndexer', submission);

    const p = ':raised_hands:';

    const slackPayload = {
        attachments: [
            {
                title: submission.entity.title,
                text: `Processing complete! ${p} ${p} ${p}`,
                color: '#99cc33'
            }
        ]
    };

    yield context.df.callActivity('SlackNotifier', slackPayload);

    return context.instanceId;
});