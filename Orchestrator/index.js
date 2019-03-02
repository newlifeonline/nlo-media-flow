const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
    const submission = context.df.getInput();
    const vimeoResult = yield context.df.callActivity('VimeoNotifier', submission.entity);
    
    submission.entity.vimeoUri = vimeoResult.videoUri;
    submission.entity.vimeoId = vimeoResult.videoId;

    const tags = submission.entity.tagsCSV.split(',');
    tags.forEach(t => {
        const input = { videoId: vimeoResult.videoId, tag: t };
        context.log(input);
        yield context.df.callActivity('VimeoVideoTagger', input);
    });

    yield context.df.callActivity('SaveMediaSubmission', submission);
    return context.instanceId;
});