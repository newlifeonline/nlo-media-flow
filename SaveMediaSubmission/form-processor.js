const azure = require('azure-storage');

class FormProcessor {
    constructor(connStr) {
        this.connStr = connStr;
        this.entityKey = 'MediaFormSubmissions';
        this.partitionKey = 'nlo';
    }

    process(id, formData) {
        const tableService = azure.createTableService(this.connStr);

        // add the table props to the entity
        formData.PartitionKey = this.partitionKey;
        formData.RowKey = id;
        return new Promise((resolve, rej) => {
            tableService.insertOrReplaceEntity(this.entityKey, formData, (error, result, response) => {
                if (error)
                    rej(error);

                resolve();
            });
        });
    }
}

module.exports = FormProcessor;