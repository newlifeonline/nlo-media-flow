const FormProcessor = require('./form-processor');
const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context) {
    let connStr = process.env['NLO_STORAGE'];
    const processor = new FormProcessor(connStr);
    const input = context.bindings.input;

    processor.process(input.id, input.entity)
                .catch(err => {
                    client.trackException({exception: err, tagOverrides:{"ai.operation.id": context.invocationId}});
                    context.done(err);
                })
                .then(() => {
                    context.done(null, input);
                });
};