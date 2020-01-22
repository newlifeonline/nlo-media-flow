const azure = require('azure-storage');

module.exports = async function (context, req) {
    const connStr = process.env['NLO_STORAGE'];
    const baseBlobUrl = process.env["BASE_BLOB_URL"];

    const sourceTableName = 'MediaFormSubmissions';

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
    }).sort(sortTable);
    
    const blobService = azure.createBlobService(connStr);
    await new Promise((resolve, reject) => {
        const name = 'all_media';
        const blobName = `${name}.json`;
        const blockName = `${name}`;
        blobService.createBlockFromText(blockName, blobContainer, blobName, JSON.stringify(submissions), (err) => {
            if (err) {
                client.trackException({
                    exception: err,
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
                        exception: err,
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
    });

    context.log.info('Completed');
    context.res = {
        status: 204
    };
};