const FormProcessor = require('./form-processor');

module.exports = async function (context) {
    let connStr = process.env['NLO_STORAGE'];
    const processor = new FormProcessor(connStr);
    const input = context.bindings.input;

    processor.process(input.id, input.entity)
                .catch(err => {
                    context.done(err);
                })
                .then(() => {
                    context.done(null, input);
                });
};