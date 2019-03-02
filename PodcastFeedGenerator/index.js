const PodcastFeed = require('./podcast-feed');

module.exports = async function (context, req) {
    const m = context.bindings.inputTable
        .sort((a, b) => {
            return b - a;
        });

    const xml = PodcastFeed.generateXML(m);

    context.res = {
        'headers': {
            'Content-Type': 'text/xml'
        },
        'body': xml,
        'isRaw': true
    };
    context.done();
};