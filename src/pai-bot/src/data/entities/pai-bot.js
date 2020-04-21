const {PAIDataSource, PAIEntity, PAIEntityList} = require('@pai-tech/pai-code');


const schema = {
    /**
     * Name of the entity, this field must be unique
     */
    name: "pai-bot",

    /**
     * Array of fields - for more info check out: field-json-schema.js
     */
    fields: [
        {
            name: "bot-id",
            type: "string",
            required: true
        },
        {
            name: "bot-name",
            type: "string",
            required: true
        }



        /**
         *  possible values: string, number, array, object, date, objectId
         */
    ]
};



class PaiBot extends PAIEntity {


    constructor() {
        super(schema);
    }

    setEntityName() {
        return schema.name;
    }



}


module.exports = PaiBot;
