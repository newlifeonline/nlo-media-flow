const PodcastFeed = require('./podcast-feed');

module.exports = async function (context) {
    const m = context.bindings.inputTable
        .sort((a, b) => {
            return b - a;
        });

    const xml = PodcastFeed.generateXML(m);
    console.log(xml);
    context.bindings.outputBlob = xml;
};