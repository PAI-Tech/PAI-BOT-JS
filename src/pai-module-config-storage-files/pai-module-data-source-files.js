const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const {PAIEntity, PAIEntityList, PAIUtils, PAIDataSource, PAILogger} = require('@pai-tech/pai-code');

/**
 *
 * @param entityData
 * @param options
 * @return {[PAIEntity]}
 */
function applyOptionsOnEntityData(entityData = [], options = {}) {
    let { offset = 0, filters } = options;
    
    // TODO: apply options on entity data
    
    let newEntityData = entityData.filter(entity => {
        for (let field in filters) {
            let value = filters[field];
            
            if (entity[field] !== value)
                return false;
        }
        
        return true;
    });
    
    return newEntityData;
}




/**
 *
 * @param {String} filePath
 * @param {String} datashell
 */
function saveToFile(filePath, data){
    return new Promise( (resolve,reject) => {
        
        fs.writeFile(filePath, data, 'utf8', function(err,data){
            if(err)
                return reject(err);
            return resolve(data);
        });
        
    });
}

/**
 * @param {String} filePath
 */
function getFromFile(filePath){
    return new Promise((resolve,reject) => {
        
        fs.readFile(filePath, 'utf-8' , function(err,data){
            if(err)
                return reject(err);
            return resolve(data);
        });
        
    })
}


/**
 * @param {String} filePath
 */
function getAllFilesInDirectory(dirname){
    return new Promise((resolve,reject) => {
    
        fs.readdir(dirname, function(err, data) {
            if(err)
                return reject(err);
            return resolve(data);
        });
    })
}


/**
 * @param {String} dirname
 */
async function readFilesInDirectory(dirname) {
    
    let filesData = [];
    
    
    let allFiles = await getAllFilesInDirectory(dirname);
    if(!allFiles)
        return;
        
    for (let i = 0; i < allFiles.length; i++) {
        let fileName = allFiles[i];
        let fileData = await getFromFile(dirname + path.sep + fileName);
        
        if(fileData)
            filesData.push(JSON.parse(fileData));
        
        
    }
    
    return filesData;
}





class PAIFilesStorageDataSource extends PAIDataSource {
    
    
    constructor(config) {
        super();
    
    
        let defaults = {
            filePath: '/var/PAI/Bot/settings/module.json'
        };
    
        this.config = Object.assign(defaults,config || {});
        
        
        // create folder if not exists
        if(!fs.existsSync(this.config.filePath))
            shell.mkdir('-p',this.config.filePath);
    }
    
    
    async save(entity) {
        let currentTime = new Date().getTime();
        entity._id = PAIUtils.pai_guid();
        entity.createdAt = currentTime;
        entity.updatedAt = currentTime;

        let entityFolder = this._getPathForEntity(entity);
        await saveToFile(
            entityFolder + path.sep + entity._id + ".json",
            JSON.stringify(entity)
        );
        
        
        return entity;
    }
    
    /**
     *
     * @param {PAIEntity} entity
     * @param options
     * @return {Promise<PAIEntityList>}
     */
    find(entity, options) {
        return new Promise(async (resolve, reject) => {
            let allRecordsInEntity = await readFilesInDirectory(this._getPathForEntity(entity));
            
            let filteredEntityData = applyOptionsOnEntityData(allRecordsInEntity, options);
            
            let result = new PAIEntityList();
            result.count = filteredEntityData.length;
            result.total = filteredEntityData.length;
            result.offset = 0;
            result.records = filteredEntityData;
            
            resolve(result);
        });
    }
    
    _getPathForEntity(entity) {
    
        let entityPath = this.config.filePath + path.sep + entity.setEntityName();

        if(!fs.existsSync(entityPath))
            fs.mkdirSync(entityPath);
        
        return entityPath;
    }
    
}


module.exports = PAIFilesStorageDataSource;