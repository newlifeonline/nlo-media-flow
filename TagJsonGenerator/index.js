const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;
const azure = require('azure-storage');
const connStr = process.env['NLO_STORAGE'];

module.exports = async function (context) {
    const tableName = 'TagChannels';
    const partitionKey = 'nlo';
    const blobContainer = 'static-data';
    const submission = context.bindings.input;
    const tags = submission.entity.tagsCSV.split(',');

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

    const blobService = azure.createBlobService(connStr);
    
    const promises = tags.map(t => {
        return new Promise((resolve, reject) => {
            tableService.retrieveEntity(tableName, partitionKey, t, (error, result, response) => {
                const name = t.toLowerCase().replace(' ', '_');
                const blobName = `${name}.json`;
                const blockName = `${name}`;
                const entity = response.body;

                if (entity.media) {
                    const jsonObj = {
                        channel: entity.RowKey,
                        videos: JSON.parse(entity.media)
                    }

                    blobService.createBlockFromText(blockName, blobContainer, blobName, JSON.stringify(jsonObj), (err) => {
                        if (err) {
                            client.trackException({exception: error, tagOverrides:{"ai.operation.id": context.invocationId}});
                            reject(err);
                        }
    
                        blobService.commitBlocks(blobContainer, blobName, { LatestBlocks: [ blockName ]},{
                            contentSettings: { contentType: 'application/json' }
                        }, (err) => {
                            if (err) {
                                client.trackException({exception: error, tagOverrides:{"ai.operation.id": context.invocationId}});
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                } else {
                    resolve();
                }

                
            });
        });
    });

    Promise.all(promises).then(() => {
        context.log.info('Completed');
    }).catch(err => {
        context.log.error(err);
    });  
};