const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const {PAIEntity, PAIEntityList, PAIUtils, PAIBaseDataSource, PAILogger} = require('@pai-tech/pai-code');

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
 * @param {String} data
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
 *
 * @param {String} filePath
 */
function deleteFile(filePath){
    return new Promise( (resolve,reject) => {
        
        fs.unlink(filePath, function(err,data){
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
 * @param {String} dirPath
 */
function getAllFilesInDirectory(dirPath){
    return new Promise((resolve,reject) => {
    
        fs.readdir(dirPath, function(err, data) {
            if(err)
                return reject(err);
            return resolve(data.filter(file => {
                return file.indexOf(".json") >= 0;
            }));
        });
    })
}


/**
 * @param {String} dirPath
 */
async function readFilesInDirectory(dirPath) {
    
    let filesData = [];
    
    
    let allFiles = await getAllFilesInDirectory(dirPath);
    if(!allFiles)
        return;
        
    for (let i = 0; i < allFiles.length; i++) {
        let fileName = allFiles[i];
        let fileData = await getFromFile(dirPath + path.sep + fileName);
        
        if(fileData)
            filesData.push(JSON.parse(fileData));
        
        
    }
    
    return filesData;
}


function convertToEntities(entity, data) {
    
    let ent = Object.create(entity);
    ent = Object.assign(ent,data);
    return ent;
}





class PAIFilesStorageDataSource extends PAIBaseDataSource {
    
    
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
            let dirPath = this._getPathForEntity(entity);
    
    
            let allFilesInDir = await readFilesInDirectory(dirPath).catch(err => {
                throw err;
            });
            
            let allRecordsInEntity = allFilesInDir.map(data => {
               return convertToEntities(entity,data);
            });
            
            let filteredEntityData = applyOptionsOnEntityData(allRecordsInEntity, options);
            
            let result = new PAIEntityList();
            result.count = filteredEntityData.length;
            result.total = filteredEntityData.length;
            result.offset = 0;
            result.records = filteredEntityData;
            
            resolve(result);
        });
    }
    
    
    
    
    update(entity) {
        return new Promise(async (resolve, reject) => {
            
            if(!entity._id) {
                return reject(new Error('Missing entity._id, required for update'));
            }
            
            let currentTime = new Date().getTime();
            entity.updatedAt = currentTime;
    
            let entityFolder = this._getPathForEntity(entity);
            await saveToFile(
                entityFolder + path.sep + entity._id + ".json",
                JSON.stringify(entity)
            );
            
    
            resolve(entity);
        });
    }
    
    
    
    delete(entity) {
        return new Promise(async (resolve, reject) => {
            
            if(!entity._id) {
                return reject(new Error('Missing entity._id, required for delete'));
            }
    
    
            let entityFolder = this._getPathForEntity(entity);
            await deleteFile(
                entityFolder + path.sep + entity._id + ".json"
            );
            
            resolve(entity);
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