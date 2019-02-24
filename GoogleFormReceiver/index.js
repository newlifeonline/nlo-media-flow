const df = require('durable-functions');
const FormUtil = require('./form-util');

module.exports = async function (context, req) {
    if (req.body && req.body.embeds) {
        let results = [];

        req.body.embeds.forEach(form => {
            if (form.formData) {
                const id = form.id;
                const fd = FormUtil.parse(form.formData);
                const vimeoResult = yield context.df.callActivity('VimeoNotifier', fd);
                fd.vimeoUri = vimeoResult;
                const entity = {
                    id: id,
                    entity: fd
                }
                const tableResult = yield context.df.callActivity('SaveMediaSubmission', entity);

                results.push(entity);
            }
        });

        context.res = {
            status: 201,
            body: entity
        };       
    }
    else {
        context.res = {
            status: 400,
            body: 'Please pass a request body'
        };
    }
};