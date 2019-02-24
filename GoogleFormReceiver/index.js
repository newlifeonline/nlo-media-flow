const df = require('durable-functions');
const FormUtil = require('./form-util');

module.exports = async function (context, req) {
    const FormProcessor = require('./form-processor');
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.body && req.body.embeds) {
        let connStr = process.env['NLO_STORAGE'];
        const processor = new FormProcessor(connStr);
        let processPromises = [];
        let task = {};

        req.body.embeds.forEach(form => {
            if (form.formData) {
                const id = form.id;
                const fd = FormUtil.parse(form.formData);
                const vimeoResult = yield context.df.callActivity('VimeoNotifier', fd);
                fd.vimeoUri = vimeoResult;
                processPromises.push(processor.process(id, fd));
            }
        });

        if (processPromises.length > 0) {
            Promise
                .all(processPromises)
                .catch(err => {
                    context.log(err);
                    context.res = {
                        status: 500
                    };
                })
                .then(d => {
                    context.res = {
                        status: 201
                    };
                });
        } else {
            context.res = {
                status: 400, /* Defaults to 200 */
                body: 'No data'
            };
        }        
    }
    else {
        context.res = {
            status: 400,
            body: 'Please pass a request body'
        };
    }
};