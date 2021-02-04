const fs = require('fs');
const shell = require('shelljs');
const { PAIModuleConfigStorage } = require('@pai-tech/pai-code');


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
 * @param {String} filePath
 */
function getFromFile(filePath){
    return new Promise((resolve,reject) => {
        
        fs.readFile(filePath, function(err,data){
            if(err)
                return reject(err);
            return resolve(data);
        });
        
    });
}

/**
 *
 * @param {String} filePath
 * @return {Promise<any>}
 */
function getAllParamsFromFile(filePath)
{
    return new Promise( (resolve,reject) => {
        getFromFile(filePath)
        .then(data => {
            return resolve(JSON.parse(data));
        })
        .catch(err => {
            return resolve({});
        });
    });
}


class PAIModuleConfigStorageFiles extends PAIModuleConfigStorage {
    
    constructor(config) {
        super();
        
        let defaults = {
            filePath: '../PAI/Bot/settings/module.json'
        };
     
        this.config = Object.assign(defaults,config || {});
        
        // create folders
        // shell.mkdir('-p', this.config.filePath);
    }
    
    /**
     *
     * @param {string} paramName
     * @param value
     */
    async setParam(paramName, value) {
        let params = await getAllParamsFromFile(this.config.filePath);
        params[paramName] = value;
        await saveToFile(this.config.filePath,JSON.stringify(params));
        return true;
    }
    
    /**
     *
     * @param {String} paramName
     */
    async getParam(paramName) {
        let params = await getAllParamsFromFile(this.config.filePath);
        return params[paramName];
    }
    
    
    
}

module.exports = PAIModuleConfigStorageFiles;




