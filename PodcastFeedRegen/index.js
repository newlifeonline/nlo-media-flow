const PodcastFeed = require('./podcast-feed');

module.exports = async function (context, req) {
    const m = context.bindings.inputTable
        .sort((a, b) => {
            return new Date(b.eventDate) - new Date(a.eventDate);
        });

    const xml = PodcastFeed.generateXML(m);
    context.bindings.outputBlob = xml;
    context.res = {
        status: 204
    };
};