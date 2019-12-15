const azure = require('azure-storage');

module.exports = async function (context, req) {
    const connStr = process.env['NLO_STORAGE'];
    const baseBlobUrl = process.env["BASE_BLOB_URL"];

    const sourceTableName = 'MediaFormSubmissions';
    const tableName = 'TagChannels';
    const partitionKey = 'nlo';

    const sourceTableService = azure.createTableService(connStr);
    await new Promise((resolve, reject) => {
        sourceTableService.createTableIfNotExists(sourceTableName, (err, r, re) => {
            if (err) {
                context.log(err);
                reject(err);
            } else {
                resolve();
            }
        });
    });

    const submissionsTable = await new Promise((resolve, reject) => {
        sourceTableService.queryEntities(sourceTableName, null, null, (error, result, response) => {
            if (error)
                reject(error);
            else
                resolve(response.body.value);
        });
    });

    let masterTagList = [];

    const submissions = submissionsTable.map(s => {
        const tags = s.tagsCSV.split(',');
        const vimeoId = s.vimeoId || null;
        const audioUrl =  s.audioId ? 
            `${baseBlobUrl}/podcasts/${s.audioId}.mp3` : null;

        tags.forEach(tag => {
            if (!masterTagList.find(t => t === tag))
                masterTagList.push(tag);
        });

        return {
            id: s.id,
            title: s.title,
            description: s.description,
            eventDate: s.eventDate,
            audioUrl: audioUrl,
            vimeoId: vimeoId,
            tags: tags,
            thumbUrlLarge: s.thumbUrlLarge,
            thumbUrlSmall: s.thumbUrlSmall
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
                medias = medias.map(m => {
                    return {
                        id: m.id,
                        title: m.title,
                        description: m.description,
                        eventDate: m.eventDate,
                        audioUrl: m.audioUrl,
                        vimeoId: m.vimeoId,
                        thumbUrlLarge: m.thumbUrlLarge,
                        thumbUrlSmall: m.thumbUrlSmall
                    };
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
    }).catch(err => {
        context.log.error(err);
    });  
};