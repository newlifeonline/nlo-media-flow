const df = require('durable-functions');

module.exports = async function (context, message) {
    const client = df.getClient(context);
    const instanceId = await client.startNew('Orchestrator',  undefined, message);

    context.log(`Started orchestration with ID = '${instanceId}'.`);

    return client.createCheckStatusResponse(context.bindingData.req, instanceId);   
};