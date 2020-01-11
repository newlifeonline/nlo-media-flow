import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as azure from 'azure-storage';
import * as appInsights from 'applicationinsights';

export interface ITableEntity {
    PartitionKey?: string;
    RowKey?: string;
    [key: string]: | string | number | boolean | undefined;
}

const sortTable = (a: any, b: any): number => {
    const leftDate = new Date(a.eventDate);
    const rightDate = new Date(b.eventDate);
    if (leftDate > rightDate) {
        return -1;
    } else if (leftDate === rightDate) {
        return 0;
    } else {
        return 1;
    }
};

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const connStr = process.env['NLO_STORAGE'];
    const baseBlobUrl = process.env["BASE_BLOB_URL"];
    const blobContainer = 'static-data';
    const sourceTableName = 'MediaFormSubmissions';

    appInsights.setup().start();
    const client = appInsights.defaultClient;

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

    const tableRecordToJavacript = (entity: ITableEntity): ITableEntity => {
        let result: any = {};
        Object.keys(entity).forEach(k => {
          // we do not want to decode metadata
          if (k !== ".metadata") {
            let prop = Object.getOwnPropertyDescriptor(entity, k);
            if (prop) {
              result[k] = prop.value["_"];
            }
          }
        });
        return result;
      }

    const submissionsTable = await new Promise<ITableEntity[]>((resolve, reject) => {
        sourceTableService.queryEntities<ITableEntity>(sourceTableName, null, null, (error, entities, response) => {
            if (error)
                reject(error);
            else
                resolve(entities.entries.map(e => tableRecordToJavacript(e)));
        });
    });
    const submissions = submissionsTable.map(s => {
        const tags = s.tagsCSV.toString().split(',');
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

export default httpTrigger;
