const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
    const submission = context.df.getInput();

    yield context.df.callActivity('VimeoChannelUpdater', submission);

    return context.instanceId;
});