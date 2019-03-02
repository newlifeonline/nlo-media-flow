const Podcast = require('podcast');
class PodcastFeed {
    static generateXML(mediaItems) {
        let feed = new Podcast(PodcastFeed.getFeedHeader());
        mediaItems.forEach(m => {
            const item = PodcastFeed.getFeedItem(m)
            feed.addItem(item);
        });

        return feed.buildXml('\t');
    }

    static getFeedHeader() {
        return {
            title: 'New Life Weekend Messages | Saxonburg',
            description: 'Lead Pastor Chris Marshall',
            feedUrl: '',
            categories: ['Christianity'],
            pubDate: new Date(),
            language: 'en-GB',
            copyright: 'All content copyright New Life Christian Ministries Inc.',
            itunesAuthor: 'New Life',
            itunesSubTitle: 'This is the podcast of New Life Christian Ministries in Saxonburg, PA!',
            itunesExplicit: false,
            itunesSummary: 'Weekend messages from New Life Christian Ministries in Saxonburg. Ordinary people serving an EXTRAORDINARY GOD!',
            itunesImage: 'http://www.newlifexn.com/podcasts/iTunes-Cover-Art/images/NL18.jpg',
        };
    }

    static getFeedItem(m) {
        return {
            title: m.title,
            description: m.description,
            enclosure: {
                url: ''
            },
            date: m.eventDate,
            guid: '',
            itunesDuration: 0,
            itunesExplicit: false,
            itunesKeywords: ['New Life', 'New Life Christian Ministries', 'Saxonburg', 'Church', 'Bible', 'God', 'Preaching', 'Teaching', 'Bible Teaching', 'Bible Preaching', 'Chris Marshall', 'Brad French', 'Mark Lutz', 'New', 'Life', 'Jesus', 'God', 'Holy Spirit', 'Christianity', 'Christian', 'Faith']
        };
    }
}

module.exports = PodcastFeed;