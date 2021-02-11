//const PAIBot = require('./models/pai-bot');

const {PAICode, PAIUtils, PAICodeCommandContext, PAILogger} = require('@pai-tech/pai-code');
const PAIBotStatus = require('./models/pai-bot-status');

const path = require('path');
const fs = require('fs');
const os_utils = require('./utils/os-utils');
const pai_bot_settings = require("./utils/pai-bot-settings").get_instance();
const pai_bot_base_modules = require("./modules/bot-base-modules");
const {PAIFileConnector, PAIHTTPConnector,PAITcpConnector} = require("@pai-tech/pai-connectors");
let pai_bot_instance = null;


class PAIBot {


    constructor() {
        this.id = null;
        this.bot_name = null;
        this.connectors = {};
        this.status = PAIBotStatus.NEW;
    }


    static get get_instance() {
        if (!pai_bot_instance) {
            pai_bot_instance = new PAIBot();
        }
        return pai_bot_instance;
    }

    async run() {
        await PAICode.on_ready();
        await os_utils.check_bot_folders();
        pai_bot_settings.load();
        await this.load_modules();
        await this.load_connector();
        this.load_additional_files();
        PAICode.start();
    }


    /**
     * load bot
     * @return {Promise<boolean>}
     */
    async load_modules() {
        await pai_bot_base_modules.load_config();
        for (let i = 0; i < pai_bot_base_modules.modules.length; i++) {
            let mod_m = pai_bot_base_modules.modules[i];
            let success = await mod_m.registerModule();

            if (!success)
                return false;
        }
        return true;
    }

    async load_connector() {
        let connectors = pai_bot_settings.all["connectors"];
        if (connectors) {
            connectors.forEach(connector => {
                let bot_connector = null;
                if (connector.type === "HTTP") {
                    bot_connector = new PAIHTTPConnector(connector);
                } else if (connector.type === "TCP") {
                    bot_connector = new PAITcpConnector(connector);
                } else if (connector.type === "FILES") {
                    bot_connector = new PAIFileConnector(connector);
                }
                bot_connector.start();
                this.connectors[connector.type] = bot_connector;
            });
        } else {
            PAILogger.info("NO Connector configured for bot. run bot config to configure connectors");
        }
    }


    /**
     * This function load additional files after the bot is loaded.
     * Additional files specify in package.json of your project under: PAI.includeFiles = [ "yourFile.js" ]
     *
     */
    load_additional_files() {
        try {
            const appRootPath = require("app-root-path").path;
            const packageJsonPath = appRootPath + path.sep + "package.json";
            const packageData = require(packageJsonPath);

            if (packageData && packageData.hasOwnProperty("PAI")) {
                if (packageData.PAI && packageData.PAI.hasOwnProperty("includeFiles")) {
                    const additionalFiles = packageData.PAI.includeFiles;

                    PAILogger.info("Additional files to load: " + JSON.stringify(additionalFiles));

                    for (let i = 0; i < additionalFiles.length; i++) {
                        require(appRootPath + "/" + additionalFiles[i]);
                    }
                }
            }
        } catch (e) {
            PAILogger.error("error while loading includeFiles from package.json " + e);
        }
    }

}


module.exports = PAIBot;
