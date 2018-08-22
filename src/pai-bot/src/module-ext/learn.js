const { PAICode, PAICodeCommand,PAICodeCommandContext,PAILogger, PAIModuleConfig } = require('@pai-tech/pai-code');
const path = require('path');
const npm = require('npm');
const PAIModuleConfigStorageFiles = require('./../../../pai-module-config-storage-files/pai-module-config-storage-files')
const { KnowledgeBase } = require('@pai-tech/pai-net-sdk');

const CONFIG_BOT_MODULES = "bot_modules";

/**
 *
 * @param {String} paiModule
 * @param {PAICodeCommand} parentCommand
 * @return {Promise<KnowledgeBase>}
 */
async function getPAIModuleFromKnowledgeBase(paiModule, parentCommand)
{
    let params = {name:paiModule};
    let paramsString = JSON.stringify(params).replace(/["]/g,"\\\"");
    let context = new PAICodeCommandContext(parentCommand.context.sender,parentCommand.context.gateway,parentCommand);
    let commandsArray = null;
    try{
        commandsArray = await PAICode.executeString(`pai-net get-knowledge-base filters:"${paramsString}"`,context);
    }catch (e) {
        console.error(e);
    }
    
    if(!commandsArray || commandsArray.length == 0)
    {
        return reject(new Error('knowledge base not found for module:' + paiModule));
    }
    
    let response = commandsArray[0].response;
    
    
    if(!response.success)
    {
        return reject(response.error);
    }
    
    
    let listResponse = response.data.data;
    
    if(listResponse.count == 0)
    {
        return reject(new Error('knowledge base not found for module:' + paiModule));
    }
    
    
    let knowledgebase = listResponse.records[0];
    return knowledgebase;
}


/**
 * Install new NPM package
 * @param {String} packageName
 * @return {Promise<any>}
 */
function npmInstall(packageName)
{
    return new Promise((resolve,reject) => {
        
        npm.load(null, function (er) {
            if (er)
                return console.log(er);
            
            npm.commands.install([packageName], function (er, data) {
                if (er) {
                    console.log(er);
                }
                resolve(data);
                // command succeeded, and data might have some info
            });
            
        });
        
    });
}

/**
 *
 * @param {KnowledgeBase} knowledgeBase
 * @return {Promise<void>}
 */
async function loadNpmModule(knowledgeBase)
{
    const moduleContainer = require(knowledgeBase.repository);
    const moduleInterface = moduleContainer[knowledgeBase.pai_interface];
    let moduleInstance = new moduleInterface();
    
    let paiOSFolder = await PAICode.modules['pai-os'].getOSPath();
    let botSettingsFolder = `${paiOSFolder}${path.sep}Bot${path.sep}settings${path.sep}`;
    
    moduleInstance.config.storage = new PAIModuleConfigStorageFiles({
        filePath: botSettingsFolder + knowledgeBase.name + '.json'
    });
    
    PAICode.loadModule(moduleInstance.setModuleName(),moduleInstance);
    
    PAILogger.info('New module has been loaded => ' + moduleInstance.setModuleName());
    
}


/**
 *
 * @param {PAIModuleConfig} config
 * @return {Promise<[String]>}
 */
async function getBotModules(config)
{
    let modulesStr = null;
    modulesStr = await config.getConfigParam(CONFIG_BOT_MODULES).catch(err => {
        console.log(err);
    });
    
    if(!modulesStr)
        modulesStr = '[]';
    
    return JSON.parse(modulesStr);
}


/**
 *
 * @param {PAIModuleConfig} config
 * @param paramName
 * @param newModule
 * @return {Promise<boolean>} success
 */
async function addBotModuleToConfig(config, newModule){
    
    let newModuleObj = JSON.parse(newModule);
    
    let modules = await getBotModules(config);
    
    let exists = false;
    for (let i = 0; i < modules.length; i++) {
        let module = JSON.parse(modules[i]);
        if(module._id === newModuleObj._id)
        {
            exists = true;
            break;
        }
    }
    
    if(exists)
        return true;
    
    modules.push(newModule);
    return await config.setConfigParam(CONFIG_BOT_MODULES, JSON.stringify(modules));
}


module.exports = (module) => {
    
    /**
     *
     * @param {PAICodeCommand} cmd
     * @return {Promise<any>}
     */
    module.prototype.learn = function(cmd) {
        return new Promise(async (resolve, reject) => {
            
            if(!cmd.params["2"] || !cmd.params["2"].value)
                reject(new Error("module not specified"));
            
            let paiModule = cmd.params["2"].value;
            
            let knowledgeBase = await getPAIModuleFromKnowledgeBase(paiModule,cmd);
            let npmData = await npmInstall(knowledgeBase.repository);
            
            await loadNpmModule(knowledgeBase);
            
            await addBotModuleToConfig(this.config,JSON.stringify(knowledgeBase));
            
            resolve(true);
        });
        
    };
    
    module.prototype.loadExistingModules = async function() {
       
        /**
         * @type {[String]}
         */
        let modules = await getBotModules(this.config);

        for (let i = 0; i < modules.length; i++) {
            /**
             *
             * @type {KnowledgeBase}
             */
            let module = JSON.parse(modules[i]);
            await loadNpmModule(module);
        }
    };
    
    
};


