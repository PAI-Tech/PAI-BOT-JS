/**
 * PAI-BOT JS
 * Author       : Ron Fridman
 * Date Created : 9/25/2019
 * Copyright PAI-TECH 2018, all right reserved
 * This file is the entry point of your base module.
 *      This program is free software; you can redistribute it and/or
 *		modify it under the terms of the GNU General Public License
 *		as published by the Free Software Foundation; either version
 *		3 of the License, or (at your option) any later version.
 */


const {PAICodeModule, PAIModuleConfigParam, PAIModuleCommandSchema, PAIModuleCommandParamSchema, PAILogger, PAICodeCommand,PAIUtils} = require("@pai-tech/pai-code");

//const pai_bot_entity = require("./src/data/entities/pai-bot");
const PAI_OS = require('@pai-tech/pai-os').PAI_OS;

const CONFIG_BOT_MODULES = "bot_modules";

const path = require('path');
const fs = require('fs');

class PCM_PAI_BOT extends PAICodeModule {
    constructor() {

        let infoText = `
welcome to pai-bot:
        
functions:
    1. version
    2. learn(module-name)
    3. shutdown
        `;

        super(infoText);

        this.config.schema = [
            new PAIModuleConfigParam("Modules list", "This list specify the modules that the Bot has learned", CONFIG_BOT_MODULES, "[]")
        ];


    }

    /**
     * load basic module commands from super
     * and load all the functions for this module
     */
    async load() {
        await super.load(this);


        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "version",
            func: "version"
        }));

        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "learn",
            func: "learn",
            params: {
                "module": new PAIModuleCommandParamSchema("module", "PAI Knowledge Base canonicalName to learn", true, "Module Canonical Name"),
                "repo": new PAIModuleCommandParamSchema("repo", "Repo To Learn From", false, "Module Repo")

            }
        }));

        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "forget",
            func: "forget",
            params: {
                "module": new PAIModuleCommandParamSchema("module", "PAI Knowledge Base canonicalName to forget", true, "Module Canonical Name")
            }
        }));

        // this.loadCommandWithSchema(new PAIModuleCommandSchema({
        //     op: "update-bot",
        //     func: "updateBot"
        // }));

        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "update-modules",
            func: "updateModules"
        }));

        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "shutdown",
            func: "shutdown"
        }));

        // this.loadCommandWithSchema(new PAIModuleCommandSchema({
        //     op: "get-id",
        //     func: "get_bot_id"
        // }));

        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "get-bot-folder",
            func: "get_bot_folder"
        }));


        await this.loadExistingModules();


    }




    setModuleName() {
        return "pai-bot";
    }


    version() {
        return require("./../../package").version;
    }

    /**
     *
     * @param {PAICodeCommand} cmd
     * @return {Promise<void>}
     */
    async shutdown(cmd) {
        const sender = cmd.context.sender;
        PAILogger.warn("Shutdown command called by " + sender);
        process.exit(0);
    }

    async get_bot_folder()
    {
        let paios = new  PAI_OS();
        return (await paios.getOSPath()) + path.sep + "Bot" + path.sep
    }

}


const learnExt = require("./src/module-ext/learn");
const updatesExt = require("./src/module-ext/updates");
const forgetExt = require("./src/module-ext/forget");

learnExt(PCM_PAI_BOT);
updatesExt(PCM_PAI_BOT);
forgetExt(PCM_PAI_BOT);

module.exports = PCM_PAI_BOT;
