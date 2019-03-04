const {PAIEntity, PAILogger} = require("@pai-tech/pai-code");
const mongoose = require("./db-connector").mongoose;
const Schema = mongoose.Schema;



let models = {};

/**
 *
 * @param {PAIEntity} entity
 * @return {Model}
 */
function convertPAIEntityToMongoSchema(entity){
	

	const entityKeys = Object.keys(entity.__entity_schema.fields).filter(fieldName => {
		return !(fieldName === "_id" ||
			fieldName === "createdAt" ||
			fieldName === "updatedAt" ||
			fieldName === "dataSource");
	});
	
	
	let schemaFields = {};
	
	for (let i = 0; i < entityKeys.length; i++) {
		const field = entityKeys[i];
		schemaFields[field] = convertFiledToMongo(entity.__entity_schema.fields[field].__field_schema.type);// String; // set string object by default
	}
	
	
	const entitySchema = new Schema(schemaFields,
		{
			timestamps: true
		});
	
	
	return mongoose.model(entity.setEntityName(),entitySchema);
}

function convertFiledToMongo(type) {

    let mongoType = String;

    switch(type) {
        case "string":
            mongoType = String;
            break;
        case "object":
            mongoType = mongoose.ObjectId;
            break;
        case "array":
            mongoType = Array;
            break;
        case "number":
            mongoType = Number;
            break;
        case "date":
            mongoType = Date;
            break;
        case "boolean":
            mongoType = Boolean;
            break;
        default:
            mongoType = String;
    }

    return mongoType;
}

/**
 * Get MongoDB Model
 * @param entity
 * @return {Model}
 */
function getMongoModelForEntity(entity) {
	
	const entityName = entity.setEntityName();
	
	if(!models.hasOwnProperty(entity.setEntityName()))
	{
		models[entityName] = convertPAIEntityToMongoSchema(entity);
		
		PAILogger.info("MongoDB Model just created: " + entityName);
	}
	
	return models[entityName];
}

/**
 *
 * Convert MongoDB record after pulling from DB and convert it to PAIEntity
 *
 * @param {PAIEntity} entity
 * @param mongoRecord
 * @return {PAIEntity}
 */
function convertMongoRecordToPAIEntity(entity,mongoRecord)
{
	let clonedEntity = Object.assign({},entity);
    clonedEntity['__proto__'] = entity['__proto__'];
	
	let mongoObj = JSON.parse(JSON.stringify(mongoRecord));
	delete mongoObj["__v"]; // delete the version flag
	
	const entityKeys = Object.keys(clonedEntity.__entity_schema.fields);
	for (let i = 0; i < entityKeys.length; i++) {
		const field = entityKeys[i];
		
		if(field === "createdAt" || field === "updatedAt")
			clonedEntity[field] = mongoRecord[field].getTime();
		else if(field === "_id")
			clonedEntity[field] = mongoRecord[field].toString();
		else
			clonedEntity[field] = mongoRecord[field];
	}


	return clonedEntity;
}


module.exports = {
	getMongoModelForEntity,
	convertMongoRecordToPAIEntity
};