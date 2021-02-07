/**
 * PAI-BOT JS
 * Author       : Ron Fridman
 * Date Created : 9/25/2018
 * Copyright PAI-TECH 2018, all right reserved
 *
 *  This file is the entry point of the bot.
 *
 *      This program is free software; you can redistribute it and/or
 *        modify it under the terms of the GNU General Public License
 *        as published by the Free Software Foundation; either version
 *        3 of the License, or (at your option) any later version.
 */


const {PAICode,PAILogger} = require("@pai-tech/pai-code");

// const env = require("./env-loader");
require('dotenv').config({path: './config.env'});
const path = require("path");
const fs = require('fs');
const os = require("os");
const {PAIFileConnector, PAIHTTPConnector} = require("@pai-tech/pai-connectors");
const PAIBotManager = require("./src/pai-bot/src/pai-bot-manager");
const BotBaseModules = require("./src/pai-bot/src/modules/bot-base-modules");
const PAIBotOSUtils = require("./src/pai-bot/src/utils/pai-bot-os-utils");

//BOTS 2.0
const os_utils = require("./src/pai-bot/src/utils/bot-os-utils");
const pai_bot_settings = require("./src/pai-bot/src/utils/pai-bot-settings").get_instance();

let manager = new PAIBotManager();
let fileConnector;
let httpConnector;



async function main() {
    try {

        os_utils.check_bot_folders();
        pai_bot_settings.load();

        //PAICode.start();

        await BotBaseModules.load();

        let modulesLoaded = await loadModules();

        if (!modulesLoaded) {
            // modules failed to load
        }

        //await manager.createBotFiles();

        //await manager.loadBotStartupFile();


        let connectors = pai_bot_settings.all["connectors"];
        if(connectors) {
            connectors.forEach( connector => {
                if(connector.type === "HTTP") {
                    httpConnector = new PAIHTTPConnector(connector);
                    httpConnector.start(true);
                }
                else if(connector.type === "FILES") {
                    fileConnector = new PAIFileConnector(connector);
                    fileConnector.start();;
                }
            })
        }
        else {
            PAILogger.info("NO Connector configured for bot. run bot config to configure connectors");
        }


        loadAdditionalFiles();

    } catch (e) {
        //PAICode.stop();
        PAILogger.error("PAI-BOT (main):" + e);
        return false;
    }

    return true;
}

/**
 *
 * @return {Promise<boolean>}
 */
async function loadModules() {

    for (let i = 0; i < BotBaseModules.modules.length; i++) {
        let mod_m = BotBaseModules.modules[i];
        let success = await mod_m.registerModule();

        if (!success)
            return false;
    }

    return true;
}


/**
 * This function load additional files after the bot is loaded.
 * Additional files specify in package.json of your project under: PAI.includeFiles = [ "yourFile.js" ]
 */
function loadAdditionalFiles() {
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



main().then((success) => {

    if (success) {
        PAILogger.info("Bot started with great success");
    } else
        PAILogger.error("Bot failed to start");
}).catch(e => {
    PAILogger.error("Bot failed to start " + e);
});
