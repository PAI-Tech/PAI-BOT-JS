const { PAICode, PAICodeCommand,PAICodeCommandContext,PAILogger, PAIModuleConfig } = require('@pai-tech/pai-code');
const npm = require('npm');
const { KnowledgeBase } = require('@pai-tech/pai-net-sdk');
const applyBotDataSource = require("./data-and-config");
const CONFIG_BOT_MODULES = "bot_modules";

/**
 *
 * @param {String} paiModule
 * @param {PAICodeCommand} parentCommand
 * @return {Promise<KnowledgeBase>}
 */
async function getPAIModuleFromKnowledgeBase(paiModule, parentCommand)
{
    let params = {canonicalName:paiModule, status: "PUBLISHED"};
    let paramsString = JSON.stringify(params).replace(/["]/g,"\\\"");
    let context = new PAICodeCommandContext(parentCommand.context.sender,parentCommand.context.gateway,parentCommand);
    let commandsArray = null;
    try{
        commandsArray = await PAICode.executeString(`pai-net get-knowledge-base filters:"${paramsString}"`,context);
    }catch (e) {
		PAILogger.error(e);
    }

    if(!commandsArray || commandsArray.length === 0)
    {
        throw new Error('knowledge base not found for module:' + paiModule);
    }

    let response = commandsArray[0].response;


    if(!response.success)
    {
        throw response.error;
    }


    let listResponse = response.data.data;

    if(listResponse.count === 0)
    {
        throw new Error('knowledge base not found for module:' + paiModule);
    }


    return listResponse.records[0]; // knowledge base record
}


/**
 * Install new NPM package
 * @param {String} packageName
 * @return {Promise<any>}
 */
function npmInstall(packageName)
{
    return new Promise((resolve,reject) => {

        npm.load({
            save:true,
			progress: false,
        }, function (er) {
            if (er)
            {
                PAILogger.error(er);
				return reject(er);
			}

            npm.commands.install([packageName], function (er, data) {
                if (er) {
					PAILogger.error(er);
					return reject(er);
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
    if(knowledgeBase.repository && knowledgeBase.repository.length > 0)
    {
        const moduleContainer = require(knowledgeBase.repository);
        const moduleInterface = moduleContainer[knowledgeBase.pai_interface];
        let moduleInstance = new moduleInterface();

        await applyBotDataSource(moduleInstance);

        PAICode.loadModule(moduleInstance.setModuleName(),moduleInstance);

        PAILogger.info('New module has been loaded => ' + moduleInstance.setModuleName());
    }
}


/**
 *
 * @param {PAIModuleConfig} config
 * @return {Promise<[String]>}
 */
async function getBotModules(config)
{
	let modulesStr = await config.getConfigParam(CONFIG_BOT_MODULES).catch(err => {
        PAILogger.error(err);
    });

    if(!modulesStr)
        modulesStr = '[]';

    return JSON.parse(modulesStr);
}


/**
 *
 * @param {PAIModuleConfig} config
 * @param {String} paramName
 * @param {String} newModule
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
    let success = await config.setConfigParam(CONFIG_BOT_MODULES, JSON.stringify(modules));
	return success;
}


module.exports = (module) => {

    /**
     *
     * @param {PAICodeCommand} cmd
     * @return {Promise<any>}
     */
    module.prototype.learn = function(cmd) {
        return new Promise(async (resolve, reject) => {

            let rejected = false;

            if(!cmd.params["module"] || !cmd.params["module"].value)
                reject(new Error("module not specified"));

            if(cmd.context.sender)
                await PAICode.executeString(`pai-net send-message to:"${cmd.context.sender}" content:"Learning..."`,cmd.context);

            let paiModule = cmd.params["module"].value;

            let knowledgeBase = await getPAIModuleFromKnowledgeBase(paiModule,cmd).catch(err => {
                PAILogger.error("Could not find knowledge base " + err.message);
                reject(new Error("Could not find knowledge base " + err.message));
                rejected = true;
            });

            if(rejected)
                return;

            if(knowledgeBase.repository && knowledgeBase.repository.length>0)
                await npmInstall(knowledgeBase.repository).catch(err => {
                    PAILogger.error("could not install npm package: " + knowledgeBase.repository,err);
                    reject(new Error("could not install npm package: " + knowledgeBase.repository));
                    rejected = true;
                });

            if(rejected)
                return;

            await loadNpmModule(knowledgeBase).catch(err => {
                PAILogger.error("could not load npm package " + err.message);
				reject(new Error("could not load npm package " + err.message));
                rejected = true;
            });

            if(rejected)
                return;

            await addBotModuleToConfig(this.config,JSON.stringify(knowledgeBase)); // TODO: change config to data

            resolve('I know ' + knowledgeBase.name + '!');
        });

    };

    module.prototype.loadExistingModules = async function() {

        /**
         * @type {[String]}
         */
        let modules = await getBotModules(this.config);

        for (let i = 0; i < modules.length; i++) {
            /**
             * @type {KnowledgeBase}
             */
            let module = JSON.parse(modules[i]);

            if(module.repository && module.repository.length>0)
                await npmInstall(module.repository);


            await loadNpmModule(module);
        }
    };


    module.prototype.applyBotDataSource = applyBotDataSource;

};


