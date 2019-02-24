const df = require('durable-functions');
const FormUtil = require('./form-util');

module.exports = async function (context, req) {
    if (req.body && req.body.embeds) {
        const form = req.body.embeds[0];
        const id = form.id;
        const fd = FormUtil.parse(form.formData);
        const submission = {
            id: id,
            entity: fd
        }
        const client = df.getClient(context);
        const instanceId = await client.startNew('Orchestrator',  undefined, submission);

        context.log(`Started orchestration with ID = '${instanceId}'.`);

        return client.createCheckStatusResponse(context.bindingData.req, instanceId);   
    }
    else {
        context.res = {
            status: 400,
            body: 'Please pass a request body'
        };
    }
};