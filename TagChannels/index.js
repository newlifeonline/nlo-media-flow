module.exports = async function (context, req) {
    let channelId = req.query.t;
    let rv = {};

    if (channelId) {
        const channel = context.bindings.inputTable
                            .find(c => {
                                return c.RowKey.toUpperCase() === channelId.toUpperCase();
                            })
        if (channel) {
            rv = {
                channel: channel.RowKey,
                videos: JSON.parse(channel.media)
            };
        } else {
            context.res = {
                status: 404
            };
            return;
        }
    } else {
        const compare = (a, b) => {
            const sortA = a.RowKey.toUpperCase();
            const sortB = b.RowKey.toUpperCase();
            let comparison = 0;
            if (sortA > sortB) {
                comparison = 1;
            } else if (sortA < sortB) {
                comparison = -1;
            }
            return comparison;
        }
        const channels = context.bindings.inputTable
                            .sort(compare);
    
        rv = channels.map(c => {
            return { 
                channel: c.RowKey,
                videos: JSON.parse(c.media)
            };
        });
    }

    context.res = {
        status: 200,
        body: rv
    };
};