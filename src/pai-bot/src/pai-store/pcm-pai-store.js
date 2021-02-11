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
            op: "get-stores",
            func: "get_stores",
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
        return "pai-store"
    }

    version() {
        return "1.0.0";
    }

    /**
     *
     * @param {PAICodeCommand} cmd
     * @return {Promise<void>}
     */
    async get_stores(cmd) {

    }




}


module.exports = PCM_PAI_STORE;
