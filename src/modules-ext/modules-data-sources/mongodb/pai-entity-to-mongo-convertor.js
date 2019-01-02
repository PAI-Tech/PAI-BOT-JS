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
	

	const entityKeys = Object.keys(entity).filter(fieldName => {
		return !(fieldName === "_id" ||
			fieldName === "createdAt" ||
			fieldName === "updatedAt" ||
			fieldName === "dataSource");
	});
	
	
	let schemaFields = {};
	
	for (let i = 0; i < entityKeys.length; i++) {
		const field = entityKeys[i];
		schemaFields[field] = String; // set string object by default
	}
	
	
	const entitySchema = new Schema(schemaFields,
		{
			timestamps: true
		});
	
	
	return mongoose.model(entity.setEntityName(),entitySchema);
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
	let clonedEntity = Object.assign(entity,{});
	
	let mongoObj = JSON.parse(JSON.stringify(mongoRecord));
	delete mongoObj["__v"]; // delete the version flag
	
	const entityKeys = Object.keys(clonedEntity);
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