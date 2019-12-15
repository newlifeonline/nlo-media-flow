const FormProcessor = require('./form-processor');
const appInsights = require("applicationinsights");


module.exports = async function (context) {
    appInsights.setup().start();
    const client = appInsights.defaultClient;
    
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