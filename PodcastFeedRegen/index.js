const PodcastFeed = require('./podcast-feed');

module.exports = async function (context, req) {
    const m = context.bindings.inputTable
        .sort((a, b) => {
            return b - a;
        });

    const xml = PodcastFeed.generateXML(m);
    context.bindings.outputBlob = xml;
    context.res = {
        status: 204
    };
};