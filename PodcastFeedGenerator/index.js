const PodcastFeed = require('./podcast-feed');

module.exports = async function (context) {
    const m = context.bindings.inputTable
        .sort((a, b) => {
            return new Date(b.eventDate) - new Date(a.eventDate);
        });

    const xml = PodcastFeed.generateXML(m);
    console.log(xml);
    context.bindings.outputBlob = xml;
};