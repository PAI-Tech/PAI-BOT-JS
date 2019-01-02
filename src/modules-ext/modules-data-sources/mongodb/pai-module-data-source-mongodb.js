const {PAIEntity, PAIEntityList, PAIBaseDataSource, PAILogger} = require("@pai-tech/pai-code");
const DBConnector = require("./db-connector");
const EntityConvertor = require("./pai-entity-to-mongo-convertor");


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
    
        this.config = Object.assign(defaults,config || {});
        
        DBConnector.connect({
            URL: this.config.URL,
            port: this.config.port,
            userName: this.config.userName,
            password: this.config.password,
            dbName: this.config.dbName
		}).then( () =>{
            // connection success
			PAILogger.info("Connection with MongoDB is established successfully");
        })
        .catch((err) => {
            PAILogger.error("COULD NOT CONNECT TO DATABASE!",err);
        });
    }
	
	/**
	 * @param {PAIEntity} entity
	 * @return {Promise<PAIEntity>}
	 */
    async save(entity) {
    
        // convert PAIEntity into Mongo model
        const mongoModel = EntityConvertor.getMongoModelForEntity(entity);
        
        // initiate Mongo model with the entity data
        let mongoEntity = new mongoModel(entity);
        
        // set id for the record we are about to create
        mongoEntity._id = DBConnector.mongoose.Types.ObjectId();
        
        // save the entity to MongoDB
        const createdMongoEntity = await mongoEntity.save().catch(err => { throw err; });
        
        // convert the entity we just created in mongo to PAIEntity
        const createdPAIEntity = EntityConvertor.convertMongoRecordToPAIEntity(entity,createdMongoEntity);
        
        return createdPAIEntity;
    }
    
    /**
     *
     * @param {PAIEntity} entity
     * @param options
     * @return {Promise<PAIEntityList>}
     */
    find(entity, options) {
        return new Promise(async (resolve, reject) => {
        
			const mongoModel = EntityConvertor.getMongoModelForEntity(entity);
			
			let results = await mongoModel.find(options.filters).catch(err => {
                reject(err);
            });
	
			results = results.map( record => {
                return EntityConvertor.convertMongoRecordToPAIEntity(entity,record);
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
				PAILogger.error("MongoDB Data Source - update() - Could not find entity with type: " + entity.setEntityName() + " with id: " + entity._id,err);
				reject(err);
			});
	
			Object.assign(record,entity);
			
			let updatedMongoEntity = await record.save();
	
			const updatedPAIEntity = EntityConvertor.convertMongoRecordToPAIEntity(entity,updatedMongoEntity);
			
			resolve(updatedPAIEntity);
        });
    }
    
    delete(entity) {
        return new Promise(async (resolve, reject) => {
	
			const mongoModel = EntityConvertor.getMongoModelForEntity(entity);
			await mongoModel.findOneAndDelete(entity._id).catch(err => {
				reject(err);
			});
			
			resolve(true);
        
        });
    }
    
}


module.exports = PAIMongoDBDataSource;