const FormUtil = require('./form-util');
const azure = require('azure-storage');

class FormProcessor {
    constructor(connStr) {
        this.connStr = connStr;
        this.entityKey = 'MediaFormSubmissions';
        this.partitionKey = 'nlo';
    }

    process(id, formData) {
        const tableService = azure.createTableService(this.connStr);
        const results = FormUtil.parse(formData);

        // add the table props to the entity
        results.PartitionKey = this.partitionKey;
        results.RowKey = id;

        return new Promise(resolve => {
            tableService.insertOrReplaceEntity(this.entityKey, tblData, (error, result, response) => {
                if (error)
                    context.log(error);
                    
                resolve();
            });
        });
    }
}

module.exports = FormProcessor;