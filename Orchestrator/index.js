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
    } else if (submission.entity.vimeoId) {
        submission.entity.vimeoUri = `/videos/${submission.entity.vimeoId}`;
        yield context.df.callActivity('VimeoDataUpdater', submission.entity);
    }

    yield context.df.callActivity('VimeoChannelUpdater', submission);

    if (submission.entity.googleAudioFileId)
        yield context.df.callActivity('TransferPodcastFileToBlob', submission.entity.googleAudioFileId);
    
    if (submission.entity.googleAudioImageFileId)
        yield context.df.callActivity('TransferImageFileToBlob', submission.entity.googleAudioImageFileId);
    
    if (submission.entity.googleVideoImageFileId) {
        yield context.df.callActivity('TransferImageFileToBlob', submission.entity.googleVideoImageFileId);

        if (submission.entity.vimeoId) {
            if (submission.entity.googleVideoImageFileId ) {
                yield context.df.callActivity('VimeoImageUpload', 
                    {   
                        videoId: submission.entity.vimeoId, 
                        imageId: submission.entity.googleVideoImageFileId 
                    });
            }

            const vimeoResponse = yield context.df.callActivity('VimeoVideoDataFetch',
                                            {
                                                vimeoId: submission.entity.vimeoId
                                            });

            submission.entity.thumbUrlLarge = vimeoResponse.pictures ? vimeoResponse.pictures.sizes.find(s => s.width === 960 && s.height === 540).link : '';
            submission.entity.thumbUrlSmall = vimeoResponse.pictures ? vimeoResponse.pictures.sizes.find(s => s.width === 295 && s.height === 166).link : '';
        }
    }

    yield context.df.callActivity('SaveMediaSubmission', submission);

    if (submission.entity.googleAudioFileId)
        yield context.df.callActivity('PodcastFeedGenerator');
    
    yield context.df.callActivity('TagIndexer', submission);
    yield context.df.callActivity('TagJsonGenerator', submission);

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