const appInsights = require("applicationinsights");
appInsights.setup();
const client = appInsights.defaultClient;
const azure = require('azure-storage');
const connStr = process.env['NLO_STORAGE'];

module.exports = async function (context, req) {
    const tableName = 'TagChannels';
    const partitionKey = 'nlo';
    const blobContainer = 'static-data';

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



    const entities = await new Promise((resolve, reject) => {
        tableService.queryEntities(tableName, null, null, (error, result, response) => {
            if (error)
                reject(error);
            else
                resolve(response.body.value);
        });
    });

    const promises = entities.map(entity => {
        return new Promise((resolve, reject) => {
            const name = entity.RowKey.toLowerCase().split(' ').join('_');
            const blobName = `${name}.json`;
            const blockName = `${name}`;

            if (entity.media) {
                const jsonObj = {
                    channel: entity.RowKey,
                    videos: JSON.parse(entity.media)
                }

                blobService.createBlockFromText(blockName, blobContainer, blobName, JSON.stringify(jsonObj), (err) => {
                    if (err) {
                        client.trackException({
                            exception: error,
                            tagOverrides: {
                                "ai.operation.id": context.invocationId
                            }
                        });
                        reject(err);
                    }

                    blobService.commitBlocks(blobContainer, blobName, {
                        LatestBlocks: [blockName]
                    },{
                        contentSettings: { contentType: 'application/json' }
                    },
                    (err) => {
                        if (err) {
                            client.trackException({
                                exception: error,
                                tagOverrides: {
                                    "ai.operation.id": context.invocationId
                                }
                            });
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
    })

    Promise.all(promises).then(() => {
        context.log.info('Completed');
        context.res = {
            status: 204
        };
    }).catch(err => {
        context.log.error(err);
        context.res = {
            status: 500
        };
    });
};