const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
    const submission = context.df.getInput();

    const slackPayload = {
        attachments: [
            {
                title: submission.entity.title,
                text: 'Processing complete',
                color: '#00bcd4'
            }
        ]
    };

    yield context.df.callActivity('SlackNotifier', slackPayload);

    return context.instanceId;
});