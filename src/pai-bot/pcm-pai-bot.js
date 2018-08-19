const { PAICode, PAICodeCommand, PAICodeModule,PAIModuleConfigParam,PAIModuleConfig,PAICodeCommandContext,PAILogger,PAIModuleCommandSchema,PAIModuleCommandParamSchema } = require('@pai-tech/pai-code');
const npm = require('npm');
const PAIModuleConfigStorageFiles = require('./../pai-module-config-storage-files/pai-module-config-storage-files')

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



class PCM_PAI_BOT extends PAICodeModule
{	
    constructor()
    {
        
        let infoText = `
welcome to pai-bot:
        
functions:
    1. show-name
    2. learn(module-name)
        `;
        
        super(infoText);
        
        this.config.schema = [
            new PAIModuleConfigParam('Modules list',"This list specify the modules that the Bot has learned","bot_modules","[]")
        ];
        
        
    }
    
    /**
     * load basic module commands from super
     * and load all the functions for this module
     */
    async load()
    {
        await super.load(this);
        
        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "learn",
            func:"learn",
            params: {
                "2": new PAIModuleCommandParamSchema("2","PAI Module name to learn",true)
            }
        }));
    }
    
    
    setModuleName() {
        return 'pai-bot';
    }
    
    /**
     *
     * @param {PAICodeCommand} cmd
     */
    show_name(cmd)
    {
        return new Promise( (resolve,reject) => {
            let name = 'temp name';
            resolve(name);
        });
    }
    
    /**
     *
     * @param {PAICodeCommand} cmd
     * @return {Promise< KnowledgeBase[] >}
     */
    learn(cmd) {
        return new Promise(async (resolve, reject) => {
            
            if(!cmd.params["2"] || !cmd.params["2"].value)
                reject(new Error("module not specified"));
            
            let paiModule = cmd.params["2"].value;
            let params = {name:paiModule};
            let paramsString = JSON.stringify(params).replace(/["]/g,"\\\"");
            let context = new PAICodeCommandContext(cmd.context.sender,cmd.context.gateway,cmd);
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
            
            let npmData = await npmInstall(knowledgebase.repository);
            
            const moduleContainer = require(knowledgebase.repository);
            const moduleInterface = moduleContainer[knowledgebase.pai_interface];
            let moduleInstance = new moduleInterface();
    
            let paiOSFolder = await PAICode.modules['pai-os'].config.getConfigParam('PAI_OS_PATH');
            let botSettingsFolder = `${paiOSFolder}/Bot/settings/`;
            
            moduleInstance.config.storage = new PAIModuleConfigStorageFiles({
                filePath: botSettingsFolder + knowledgebase.name + '.json'
            });
            
            PAICode.loadModule(moduleInstance.setModuleName(),moduleInstance);
    
            PAILogger.info('New module has been loaded => ' + moduleInstance.setModuleName());
            
            resolve(listResponse);
        });
        
    }
   
    
}

module.exports = PCM_PAI_BOT;