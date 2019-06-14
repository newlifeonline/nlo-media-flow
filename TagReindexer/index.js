const appInsights = require("applicationinsights");
appInsights.setup();
const azure = require('azure-storage');
const connStr = process.env['NLO_STORAGE'];
const baseBlobUrl = process.env["BASE_BLOB_URL"];

module.exports = async function (context, req) {
    const tableName = 'TagChannels';
    const partitionKey = 'nlo';
    const submissionsTable = context.bindings.inputTable;

    const masterTagList = [];

    const submissions = submissionsTable.map(s => {
        const tags = s.tagsCSV.split(',');
        const vimeoId = s.vimeoId || null;
        const audioUrl =  s.audioId ? 
            `${baseBlobUrl}/podcasts/${s.audioId}.mp3` : null;

        tags.forEach(tag => {
            if (masterTagList.find(t => t !== tag))
                masterTagList.push(tag);
        });

        return {
            id: s.id,
            title: s.title,
            description: s.description,
            eventDate: s.eventDate,
            audioUrl: audioUrl,
            vimeoId: vimeoId,
            tags: tags
        };
    });    
    
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
    
    const promises = masterTagList.map(t => {
        return new Promise((resolve, rej) => {
            tableService.retrieveEntity(tableName, partitionKey, t, (error, result, response) => {
                let medias = submissions.filter(s => {
                    return s.tags && s.tags.find(subTag => subTag === t);
                });
                medias = medias.sort((a,b) => {
                    let aDate = new Date(a.eventDate);
                    let bDate = new Date(b.eventDate);
                    if (aDate > bDate)
                        return -1;
                    if (aDate < bDate)
                        return 1;
                    return 0;
                });
                // make a new one
                let entity = {
                    PartitionKey: partitionKey,
                    RowKey: t,
                    media: JSON.stringify(medias)
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
        context.res = {
            status: 204
        };
        context.done();
    }).catch(err => {
        context.log.error(err);
        //context.done();
    });  
};