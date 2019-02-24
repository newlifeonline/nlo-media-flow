const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
    let submission = context.df.getInput();
    const vimeoResult = yield context.df.callActivity('VimeoNotifier', submission.entity);
    context.log(vimeoResult);

    let entity = submission.entity;
    entity.vimeoUri = vimeoResult;
    submission.entity = entity;

    yield context.df.callActivity('SaveMediaSubmission', submission);
    return context.instanceId;
});