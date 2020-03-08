const {PAIEntity, PAIEntityList, PAIBaseDataSource, PAILogger} = require("@pai-tech/pai-code");
const DBConnector = require("./db-connector");
const EntityConvertor = require("./pai-entity-to-mongo-convertor");
let isConnected = false;

class PAIMongoDBDataSource extends PAIBaseDataSource {

    constructor(config) {
        super();

        let defaults = {
            URL: "",
            port: "27017",
            userName: "",
            password: "",
            dbName: "PAI_BOT"
        };

        this.config = Object.assign(defaults, config || {});

    }

    async connect() {

        if (isConnected)
            return;

        await DBConnector.connect({
            URL: this.config.URL,
            port: this.config.port,
            userName: this.config.userName,
            password: this.config.password,
            dbName: this.config.dbName
        }).catch((err) => {
            isConnected = false;
            PAILogger.error("COULD NOT CONNECT TO DATABASE!", err);
            throw err;
        });

        isConnected = true;
        PAILogger.info("Connection with MongoDB is established successfully");

    }

    /**
     * @param {PAIEntity} entity
     * @return {Promise<PAIEntity>}
     */
    async save(entity) {

        // convert PAIEntity into Mongo model
        const mongoModel = EntityConvertor.getMongoModelForEntity(entity);


        const entityKeys = Object.keys(entity.__entity_schema.fields).filter(fieldName => {
            return (fieldName != "_id" &&
                fieldName != "createdAt" &&
                fieldName != "updatedAt");
        });


        // initiate Mongo model with the entity data
        let mongoEntity = new mongoModel();

        // set id for the record we are about to create
        mongoEntity._id = DBConnector.mongoose.Types.ObjectId();


        for (let i = 0; i < entityKeys.length; i++) {
            const name = entityKeys[i];
            mongoEntity[name] = entity[name];
        }


        // save the entity to MongoDB
        const createdMongoEntity = await mongoEntity.save().catch(err => {
            throw err;
        });

        // convert the entity we just created in mongo to PAIEntity
        const createdPAIEntity = EntityConvertor.convertMongoRecordToPAIEntity(entity, createdMongoEntity);

        return createdPAIEntity;
    }

    /**
     *
     * @param {PAIEntity} entity
     * @param options
     * @param limit
     * @return {Promise<PAIEntityList>}
     */
    find(entity, options, limit) {
        return new Promise(async (resolve, reject) => {

            const mongoModel = EntityConvertor.getMongoModelForEntity(entity);


            let results;

            if (limit) {
                results = await mongoModel.find(options.filters).limit(limit).catch(err => {
                    reject(err);
                });
            } else {
                results = await mongoModel.find(options.filters).catch(err => {
                    reject(err);
                });
            }

            results = results.map(record => {
                return EntityConvertor.convertMongoRecordToPAIEntity(entity, record);
            });


            let result = new PAIEntityList();
            result.count = results.length;
            result.total = results.length;
            result.offset = 0;
            result.records = results;

            resolve(result);

        });
    }


    update(entity) {
        return new Promise(async (resolve, reject) => {

            const mongoModel = EntityConvertor.getMongoModelForEntity(entity);

            let record = await mongoModel.findById(entity._id).catch(err => {
                PAILogger.error("MongoDB Data Source - update() - Could not find entity with type: " + entity.setEntityName() + " with id: " + entity._id, err);
                reject(err);
            });

            Object.assign(record, entity);

            let updatedMongoEntity = await record.save();

            const updatedPAIEntity = EntityConvertor.convertMongoRecordToPAIEntity(entity, updatedMongoEntity);

            delete updatedPAIEntity["__entity_schema"]; // delete the version flag

            resolve(updatedPAIEntity);
        });
    }

    delete(entity) {
        return new Promise(async (resolve, reject) => {

            const mongoModel = EntityConvertor.getMongoModelForEntity(entity);
            await mongoModel.findByIdAndRemove(entity._id).catch(err => {
                reject(err);
            });

            resolve(true);

        });
    }

}


module.exports = PAIMongoDBDataSource;
