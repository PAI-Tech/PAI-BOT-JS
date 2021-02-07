/**
 * PAI-BOT JS
 * Author       : Ron Fridman
 * Date Created : 9/25/2019
 * Copyright PAI-TECH 2018, all right reserved
 * This file is the entry point of your base module.
 *      This program is free software; you can redistribute it and/or
 *        modify it under the terms of the GNU General Public License
 *        as published by the Free Software Foundation; either version
 *        3 of the License, or (at your option) any later version.
 */


const {
    PAICodeModule,
    PAIModuleConfigParam,
    PAIModuleCommandSchema,
    PAIModuleCommandParamSchema,
    PAILogger,
    PAICodeCommand,
    PAIUtils,
    PAICode
} = require("@pai-tech/pai-code");
const npmLogin = require('npm-cli-login');
const {exec} = require('child_process');

//const pai_bot_entity = require("./src/data/entities/pai-bot");
const PAI_OS = require('@pai-tech/pai-os').PAI_OS;

const CONFIG_BOT_MODULES = "bot_modules";

const path = require('path');
const fs = require('fs');
const os_utils = require("./src/utils/bot-os-utils");


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

        this.set_module_name("pai-bot-module")

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
            op: "install",
            func: "install",
            params: {
                "module": new PAIModuleCommandParamSchema("module", "PAI Knowledge Base canonicalName to learn", true, "Module Canonical Name"),
                "from-text": new PAIModuleCommandParamSchema("from-text", "Text To Learn From", false, "Text Repo"),
                "from-file": new PAIModuleCommandParamSchema("from-file", "File To Learn From", false, "File Repo"),
                "from-url": new PAIModuleCommandParamSchema("from-url", "Url To Learn From", false, "Url Repo")
            }
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
            op: "npm-login",
            func: "npm_login",
            params: {
                "username": new PAIModuleCommandParamSchema("username", "npm user_name", true, "username"),
                "password": new PAIModuleCommandParamSchema("password", "password", true, "password"),
                "email": new PAIModuleCommandParamSchema("email", "email", true, "email")
            }
        }));


        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "uninstall",
            func: "uninstall",
            params: {
                "module": new PAIModuleCommandParamSchema("module", "PAI Knowledge Base canonicalName to forget", true, "Module Canonical Name")
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
        //     op: "config-env",
        //     func: "edit_env_file",
        //     params: {
        //         "email": new PAIModuleCommandParamSchema("email", "Maintainer email", true, "Maintainer Email"),
        //         "https": new PAIModuleCommandParamSchema("https", "Allow Https true or false", true, "Allow Https")
        //     }
        // }));
        //
        // this.loadCommandWithSchema(new PAIModuleCommandSchema({
        //     op: "add_domain",
        //     func: "add_domain",
        //     params: {
        //         "domain": new PAIModuleCommandParamSchema("domain", "domain to add", true, "domain")
        //
        //     },
        //     showOnInterface:"false"
        // }));

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
            func: "get_bot_folder",
            showOnInterface: "false"
        }));


        await this.loadExistingModules();


    }


    setModuleName() {
        return "pai-bot";
    }


    npm_login(cmd) {
        let username = cmd.params.username.value;
        let email = cmd.params.email.value;
        let password = cmd.params.password.value;
        npmLogin(username, password, email);

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

    get_bot_folder() {
        return os_utils.get_bot_folder()
    }

    edit_env_file(cmd) {
        let email = cmd.params.email.value;
        let https = cmd.params.https.value;
        const envfile = require('envfile');
        let obj;
        try {
            if (fs.existsSync('config.env')) {
                let file = fs.readFileSync('config.env', "utf8");
                obj = envfile.parse(file);
            } else {
                obj = {};
            }
            obj['MAINTAINER_EMAIL'] = email;
            obj['ALLOW_SSL'] = https;
            fs.writeFileSync('config.env', envfile.stringify(obj));
            return 'config has been saved please restart bot!';
        } catch (e) {
            PAILogger.error(e);
            return e;
        }


    }

    async add_domain(cmd) {
        const domain = cmd.params.domain.value;
        let command = `npx greenlock add --subject ${domain} --altnames ${domain}`;
        // const cmdArray = await PAICode.executeString(cmd, context);
        return exec(command, (err, stdout, stderr) => {
            if (err) {
                // node couldn't execute the command
                return;
            }

            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            return 'Domain Added';
        });
    }

}


const learnExt = require("./src/module-ext/learn");
const updatesExt = require("./src/module-ext/updates");
const forgetExt = require("./src/module-ext/forget");

learnExt(PCM_PAI_BOT);
updatesExt(PCM_PAI_BOT);
forgetExt(PCM_PAI_BOT);

module.exports = PCM_PAI_BOT;
