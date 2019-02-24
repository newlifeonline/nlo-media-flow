const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
    const submission = context.df.getInput();
    const vimeoResult = yield context.df.callActivity('VimeoNotifier', submission.entity);

    submission.entity.vimeoUri = vimeoResult;

    yield context.df.callActivity('SaveMediaSubmission', submission);
    return context.instanceId;
});