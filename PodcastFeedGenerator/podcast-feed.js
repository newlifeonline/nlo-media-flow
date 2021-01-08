const Podcast = require('podcast');
const baseBlobUrl = process.env["BASE_BLOB_URL"];
class PodcastFeed {
    static generateXML(mediaItems) {
        let feed = new Podcast(PodcastFeed.getFeedHeader());
        mediaItems.forEach(m => {
            if (m.googleAudioFileId) {
                const item = PodcastFeed.getFeedItem(m)
                feed.addItem(item);
            }
        });

        return feed.buildXml('\t');
    }

    static getFeedHeader() {
        return {
            title: 'New Life Weekend Messages | Saxonburg',
            author: 'New Life Christian Ministries',
            description: 'Weekend messages from New Life Christian Ministries in Saxonburg. Ordinary people serving an EXTRAORDINARY GOD!',
            feedUrl: 'https://nlostoreprd1.blob.core.windows.net/podcasts/feed.xml',
            categories: ['Christianity'],
            pubDate: new Date(),
            language: 'en',
            copyright: 'All content copyright New Life Christian Ministries Inc.',
            itunesAuthor: 'New Life Christian Ministries',
            itunesSubTitle: 'This is the podcast of New Life Christian Ministries in Saxonburg, PA!',
            itunesExplicit: false,
            itunesSummary: 'Weekend messages from New Life Christian Ministries in Saxonburg. Ordinary people serving an EXTRAORDINARY GOD!',
            itunesImage: 'http://www.newlifexn.com/podcasts/iTunes-Cover-Art/images/NL18.jpg',
            itunesCategory: [{text: 'Religion &amp; Spirituality', subcats:[{text:'Christianity'}]}],
            itunesOwner: { name: 'Brad French', email:'webservant@newlifexn.org' },
            itunesKeywords: ['New Life', 'New Life Christian Ministries', 'Saxonburg', 'Church', 'Bible', 'God', 'Preaching', 'Teaching', 'Bible Teaching', 'Bible Preaching', 'Chris Marshall', 'Brad French', 'Mark Lutz', 'New', 'Life', 'Jesus', 'God', 'Holy Spirit', 'Christianity', 'Christian', 'Faith']
        };
    }

    static getFeedItem(m) {
        const id = m.googleAudioFileId;
        return {
            title: m.title,
            description: m.description,
            enclosure: {
                url: `${baseBlobUrl}/podcasts/${id}.mp3`
            },
            date: new Date(m.eventDate),
            guid: id,
            itunesDuration: m.audioDuration ? m.audioDuration : 1800, // default to 30 mins
            itunesExplicit: false,
            itunesKeywords: ['New Life', 'New Life Christian Ministries', 'Saxonburg', 'Church', 'Bible', 'God', 'Preaching', 'Teaching', 'Bible Teaching', 'Bible Preaching', 'Chris Marshall', 'Brad French', 'Mark Lutz', 'New', 'Life', 'Jesus', 'God', 'Holy Spirit', 'Christianity', 'Christian', 'Faith']
        };
    }
}

module.exports = PodcastFeed;