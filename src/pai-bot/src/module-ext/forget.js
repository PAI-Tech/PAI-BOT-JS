const {PAICode, PAICodeCommand, PAICodeCommandContext, PAILogger, PAIModuleConfig} = require('@pai-tech/pai-code');
const npm = require('npm');
const {KnowledgeBase} = require('@pai-tech/pai-net-sdk');
const applyBotDataSource = require("./data-and-config");
const CONFIG_BOT_MODULES = "bot_modules";

/**
 *
 * @param {String} paiModule
 * @param {PAICodeCommand} parentCommand
 * @return {Promise<KnowledgeBase>}
 */
async function getPAIModuleFromKnowledgeBase(paiModule, parentCommand) {
    let params = {canonicalName: paiModule, status: "PUBLISHED"};
    let paramsString = JSON.stringify(params).replace(/["]/g, "\\\"");
    let context = new PAICodeCommandContext(parentCommand.context.sender, parentCommand.context.gateway, parentCommand);
    let commandsArray = null;
    try {
        commandsArray = await PAICode.executeString(`pai-net get-knowledge-base filters:"${paramsString}"`, context);
    } catch (e) {
        PAILogger.error("PAI-BOT (getPAIModuleFromKnowledgeBase):" + e);
    }

    if (!commandsArray || commandsArray.length === 0) {
        throw new Error('knowledge base not found for module:' + paiModule);
    }

    let response = commandsArray[0].response;


    if (!response.success) {
        throw response.error;
    }


    let listResponse = response.data.data;

    if (listResponse.count === 0) {
        throw new Error('knowledge base not found for module:' + paiModule);
    }


    return listResponse.records[0]; // knowledge base record
}


/**
 * Install new NPM package
 * @param {String} packageName
 * @return {Promise<any>}
 */
function npmUnInstall(packageName) {
    return new Promise((resolve, reject) => {

        npm.load({
            progress: false,
            save: true,
        }, function (er) {
            if (er) {
                PAILogger.error("PAI-BOT (npmUninstall):" + er);
                return reject(er);
            }

            npm.commands.uninstall([packageName], function (er, data) {
                if (er) {
                    PAILogger.error("PAI-BOT (npmUninstall):" + er);
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


/**
 *
 * @param {PAIModuleConfig} config
 * @return {Promise<[String]>}
 */
async function getBotModules(config) {
    let modulesStr = await config.getConfigParam(CONFIG_BOT_MODULES).catch(err => {
        PAILogger.error("PAI-BOT (getBotModules):" + err);
    });

    if (!modulesStr)
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
async function removeBotModuleFromConfig(config, newModule) {

    let newModuleObj = JSON.parse(newModule);

    let modules = await getBotModules(config);
    let index;
    let found = false;
    for (let i = 0; i < modules.length; i++) {
        let module = JSON.parse(modules[i]);
        if (module._id === newModuleObj._id) {
            index = i;
            found = true;
        }
    }


    if (found) {
        modules.splice(index, 1);
        let success = await config.setConfigParam(CONFIG_BOT_MODULES, JSON.stringify(modules));
        return success;
    }
    return true;

}




module.exports = (module) => {



    /**
     *
     * @param {PAICodeCommand} cmd
     * @return {Promise<any>}
     */
    module.prototype.forget = function (cmd) {
        return new Promise(async (resolve, reject) => {

            let rejected = false;

            if (!cmd.params["module"] || !cmd.params["module"].value)
                reject(new Error("module not specified"));

            if (cmd.context.sender)
                await PAICode.executeString(`pai-net send-message to:"${cmd.context.sender}" content:"forgetting..."`, cmd.context);

            let paiModule = cmd.params["module"].value;

            let knowledgeBase = await getPAIModuleFromKnowledgeBase(paiModule, cmd).catch(err => {
                PAILogger.error("Could not find knowledge base " + err.message);
                reject(new Error("Could not find knowledge base " + err.message));
                rejected = true;
            });

            if (rejected)
                return;

            if (knowledgeBase.repository && knowledgeBase.repository.length > 0)
                await npmUnInstall(knowledgeBase.repository).catch(err => {
                    PAILogger.error("could not install npm package: " + knowledgeBase.repository, err);
                    reject(new Error("could not install npm package: " + knowledgeBase.repository));
                    rejected = true;
                });

            if (rejected)
                return;


            await removeBotModuleFromConfig(this.config, JSON.stringify(knowledgeBase)); // TODO: change config to data

            resolve('I Forgot ' + knowledgeBase.name + '! Please Restart Bot');
        });

    };


};


