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


const pai_store_manager = require('./pai-store-manager').get_instance();


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

        // this.loadCommandWithSchema(new PAIModuleCommandSchema({
        //     op: "learn",
        //     func: "learn",
        //     params: {
        //         "module": new PAIModuleCommandParamSchema("module", "PAI Knowledge Base canonicalName to learn", true, "Module Canonical Name"),
        //         "repo": new PAIModuleCommandParamSchema("repo", "Repo To Learn From", false, "Module Repo")
        //     }
        // }));
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

    get_stores(cmd) {
        return pai_store_manager.get_stores();
    };

    async get_module(cmd) {
        const {store_name, module_name} = cmd.params;
        return await pai_store_manager.get_module(module_name, store_name);
    };


}


module.exports = PCM_PAI_STORE;
