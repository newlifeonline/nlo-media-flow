

module.exports = async function (context, req) {
    const FormProcessor = require('./form-processor');
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.body && req.body.embeds) {
        let connStr = process.env['NLO_STORAGE'];
        const processor = new FormProcessor(connStr);
        let processPromises = [];

        req.body.embeds.forEach(form => {
            if (form.formData) {
                let id = form.id;
                let fd = form.formData;
                processPromises.push(processor.process(id, fd));
            }
        });

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: ''
        };
    }
    else {
        context.res = {
            status: 400,
            body: 'Please pass a request body'
        };
    }
};