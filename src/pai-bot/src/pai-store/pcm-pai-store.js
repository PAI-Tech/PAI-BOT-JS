/**
 * PAI-STORE Module Interface
 * Author       : Tamir Fridman
 * Date Created : 10/02/2021
 * Copyright PAI-TECH 2021, all right reserved
 */


const {
    PAICodeModule, PAIModuleConfigParam, PAIModuleCommandSchema,
    PAIModuleCommandParamSchema,
    PAILogger,
    PAICodeCommand,
    PAIUtils,
    PAICode
} = require("@pai-tech/pai-code");
const CONFIG_BOT_MODULES = "bot_modules";


const pai_store_manager = require('./pai-store-manager').get_instance();

async function loadNpmModule(knowledgeBase) {
    if (knowledgeBase.repository && knowledgeBase.repository.length > 0) {
        try {
            const moduleContainer = require(knowledgeBase.repository);
            const moduleInterface = knowledgeBase.pai_interface ? moduleContainer[knowledgeBase.pai_interface] : moduleContainer["Module"];
            let moduleInstance = new moduleInterface();

            await applyBotDataSource(moduleInstance);

            PAICode.loadModule(moduleInstance.setModuleName(), moduleInstance);

            PAILogger.info('New module has been loaded => ' + moduleInstance.setModuleName());
        } catch (e) {
            PAILogger.info('Unable to load module -==  ' + knowledgeBase.repository + " ==- \n" + e);
        }

    }
}

async function getBotModules(config) {
    let modulesStr = await config.getConfigParam(CONFIG_BOT_MODULES).catch(err => {
        PAILogger.error("PAI-BOT (getBotModules):" + err);
    });

    if (!modulesStr)
        modulesStr = '[]';

    return JSON.parse(modulesStr);
}

async function addBotModuleToConfig(config, newModule) {

    let newModuleObj = JSON.parse(newModule);

    let modules = await getBotModules(config);

    let exists = false;
    for (let i = 0; i < modules.length; i++) {
        let module = JSON.parse(modules[i]);
        if (module._id === newModuleObj._id) {
            exists = true;
            break;
        }
    }

    if (exists)
        return true;

    modules.push(newModule);
    let success = await config.setConfigParam(CONFIG_BOT_MODULES, JSON.stringify(modules));
    return success;
}

class PCM_PAI_STORE extends PAICodeModule {
    constructor() {

        let infoText = `pai-store connector`;

        super(infoText);

        this.config.schema = [
            new PAIModuleConfigParam("Stores list", "This list specify the stores that the Bot is connected", "pai-stores", "[]")
        ];


    }

    /**
     * load basic module commands from super
     * and load all the functions for this module
     */
    async load() {
        await super.load();

        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "version", func: "version"
        }));

        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "learn",
            func: "learn",
            params:{
                "module": new PAIModuleCommandParamSchema("module", "PAI Knowledge Base canonicalName to learn", true, "Module Canonical Name")

            }

        }));
        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "get-pai-stores",
            func: "get_stores"

        }));

        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "add-pai-store",
            func: "add_store",
            params: {
                "pai-store-name": new PAIModuleCommandParamSchema("pai-store-name", "PAI-STORE name", true, "PAI-STORE name"),
                "pai-store-description": new PAIModuleCommandParamSchema("pai-store-description", "PAI-STORE description", true, "PAI-STORE description"),
                "pai-store-url": new PAIModuleCommandParamSchema("pai-store-url", "PAI-STORE url", true, "PAI-STORE url")

            }
        }));
        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "delete-pai-store",
            func: "del_store",
            params: {
                "pai-store-name": new PAIModuleCommandParamSchema("pai-store-name", "PAI-STORE name", true, "PAI-STORE name")

            }
        }));
        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "get-pai-module",
            func: "get_module",
            params: {
                "pai-module": new PAIModuleCommandParamSchema("pai-module", "PAI-MODULE name", true, "PAI-MODULE name"),
                "pai-store-name": new PAIModuleCommandParamSchema("pai-store-name", "PAI-STORE name", false, "PAI-STORE name")

            }
        }));

        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "get-all-pai-modules",
            func: "get_all_modules",
            params: {
                "pai-store-name": new PAIModuleCommandParamSchema("pai-store-name", "PAI-STORE name- not required", false, "PAI-STORE name")
            }

        }));


    }


    get_module_name() {
        return "pai-store";
    }

    version() {
        return "1.0.0";
    }

    /**
     *
     * @param {PAICodeCommand} cmd
     * @return {string}
     */

    add_store(cmd) {
        pai_store_manager.add_store({
            "pai-store-name": cmd.params["pai-store-name"].value,
            "pai-store-description": cmd.params["pai-store-description"].value,
            "pai-store-type": "url",
            "pai-store-url": cmd.params["pai-store-url"] ? cmd.params["pai-store-url"].value : null
        });
        return 'store added!';
    };

    del_store(cmd) {
        pai_store_manager.del_store(cmd.params["pai-store-name"].value);
        return 'store deleted!';
    };

    get_stores() {
        return pai_store_manager.get_stores();
    };

    async get_module(cmd) {
        return await pai_store_manager.get_module(cmd.params["pai-module"].value, cmd.params["pai-store-name"] ? cmd.params["pai-store-name"].value : null);
    };

    async get_all_modules(cmd) {
        return await pai_store_manager.get_all_modules(cmd.params["pai-store-name"] ? cmd.params["pai-store-name"].value : null);

    };


    async learn(cmd) {
        if (!cmd.params["module"] || !cmd.params["module"].value)
            throw(new Error("module not specified"));


        let paiModule = cmd.params["module"].value;


        let knowledgeBase = await pai_store_manager.get_module(paiModule);


        if (!knowledgeBase) {
            PAILogger.error("could not find kb");
            throw(new Error("could not find kb"));
        }

        PAILogger.info('FOUND KB!');


        if (cmd.context.sender && cmd.context.sender !== 'sender')
            await PAICode.executeString(`pai-net send-message to:"${cmd.context.sender}" content:"Learning ${knowledgeBase.name}"`, cmd.context);


        if (knowledgeBase.repository && knowledgeBase.repository.length > 0) {
            /*
             * await npmInstall(knowledgeBase.repository).catch(err => {
             *     PAILogger.error("could not install npm package: " + knowledgeBase.repository, err);
             *     reject(new Error("could not install npm package: " + knowledgeBase.repository));
             *     rejected = true;
             * });
             */


            let installCommand = "npm i " + knowledgeBase.repository;
            if (cmd.context.sender && cmd.context.sender !== 'sender')
                await PAICode.executeString(`pai-net send-message to:"${cmd.context.sender}" content:"installing npm package ${knowledgeBase.repository}"`, cmd.context);
            PAILogger.info('RUNNING NPM I KB!');
            await PAICode.executeString(`pai-os run command:"${installCommand}"`, cmd.context);
        }


        /*
         * if(cmd.context.sender)
         *     await PAICode.executeString(`pai-net send-message to:"${cmd.context.sender}" content:"installed (I think)..."`,cmd.context);
         */

        PAILogger.info('LOADING KB TO BOT!');
        await loadNpmModule(knowledgeBase).catch(err => {
            PAILogger.error("could not load npm package " + err.message);

        });

        /*
         * if(cmd.context.sender)
         *     await PAICode.executeString(`pai-net send-message to:"${cmd.context.sender}" content:"loaded..."`,cmd.context);
         */


        await addBotModuleToConfig(this.config, JSON.stringify(knowledgeBase)); // TODO: change config to data

        return ('I know ' + knowledgeBase.name + '!');
    }


}


module.exports = PCM_PAI_STORE;
