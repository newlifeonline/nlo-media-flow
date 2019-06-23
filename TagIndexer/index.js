const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;
const azure = require('azure-storage');
const connStr = process.env['NLO_STORAGE'];
const baseBlobUrl = process.env["BASE_BLOB_URL"];

module.exports = async function (context) {
    context.log('Here');
    const tableName = 'TagChannels';
    const partitionKey = 'nlo';
    const submission = context.bindings.input;
    const tags = submission.entity.tagsCSV.split(',');
    const vimeoId = submission.entity.vimeoId || null;
    const audioUrl =  submission.entity.audioId ? 
        `${baseBlobUrl}/podcasts/${submission.entity.audioId}.mp3` : null;

    const f = {
        id: submission.id,
        title: submission.entity.title,
        description: submission.entity.description,
        eventDate: submission.entity.eventDate,
        audioUrl: audioUrl,
        vimeoId: vimeoId
    }
    
    const tableService = azure.createTableService(connStr);
    await new Promise((resolve, reject) => {
        tableService.createTableIfNotExists(tableName, (err, r, re) => {
            if (err) {
                context.log(err);
                reject(err);
            } else {
                resolve();
            }
            
        });
    });
    
    const promises = tags.map(t => {
        return new Promise((resolve, rej) => {
            tableService.retrieveEntity(tableName, partitionKey, t, (error, result, response) => {
                let entity = {};
                if (error || !result) {
                    // make a new one
                    entity = {
                        PartitionKey: partitionKey,
                        RowKey: t,
                        media: JSON.stringify([f])
                    }
                } else {
                    entity = response.body;
                    let medias = [];
                    if (entity.media && entity.media.length > 0) {
                        medias = JSON.parse(entity.media);
                        // if dup, replace it
                        let foundInArray = false;
                        medias = medias.map((item) => {
                            if (item.id === f.id) {
                                foundInArray = true;
                                return f;
                            } else {
                                return item;
                            }
                        });

                        if (!foundInArray) {
                            medias.push(f);
                        }
                        medias = medias.sort((a,b) => {
                            let aDate = new Date(a.eventDate);
                            let bDate = new Date(b.eventDate);
                            if (aDate > bDate)
                                return -1;
                            if (aDate < bDate)
                                return 1;
                            return 0;
                        });
                    } else {
                        // new array
                        medias = [f];
                    }
                    
                    entity.media = JSON.stringify(medias);
                }

                tableService.insertOrReplaceEntity(tableName, entity, (e, resl, resp) => {
                    if (e) {
                        context.log.error(e);
                        rej(e);
                    } else {
                        resolve();
                    }
                });
            });
        });
    });

    Promise.all(promises).then(() => {
        context.log.info('Completed');
        context.done();
    }).catch(err => {
        context.log.error(err);
        //context.done();
    });  
};