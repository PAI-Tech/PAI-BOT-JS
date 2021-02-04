/**
 * PAI-BOT JS
 * Author       : Ron Fridman
 * Date Created : 9/25/2018
 * Copyright PAI-TECH 2018, all right reserved
 *
 * This file is the entry point of your base module.
 *      This program is free software; you can redistribute it and/or
 *        modify it under the terms of the GNU General Public License
 *        as published by the Free Software Foundation; either version
 *        3 of the License, or (at your option) any later version.
 */


const {
    PAICode,
    PAILogger,
} = require("@pai-tech/pai-code");

// const env = require("./env-loader");
require('dotenv').config({path: './config.env'});
const path = require("path");
const fs = require('fs');
const os = require("os");
const {PAIFileConnector, PAIHTTPConnector} = require("@pai-tech/pai-conntectors");
const PAIBotManager = require("./src/pai-bot/src/pai-bot-manager");
const BotBaseModules = require("./src/pai-bot/src/modules/bot-base-modules");
const PAIBotOSUtils = require("./src/pai-bot/src/utils/pai-bot-os-utils");

let manager = new PAIBotManager();
let fileConnector;
let httpConnector;


async function main() {
    try {
        await check_pai_os_folders();

        PAICode.start();

        await BotBaseModules.load();

        let modulesLoaded = await loadModules();

        if (!modulesLoaded) {
            // modules failed to load
        }

        await manager.createBotFiles();

        await manager.loadBotStartupFile();

        let QFolder = await PAIBotOSUtils.getBotQueueFolder();


        if (process.env.PAI_CONNECTORS.includes('FILES')) {
            fileConnector = new PAIFileConnector({path: `${QFolder}/in.pai`});
            fileConnector.start();
        }
        if (process.env.PAI_CONNECTORS.includes('HTTP')) {
            httpConnector = new PAIHTTPConnector({port: (process.env.HTTP_PORT || 3141)});
            httpConnector.start(false);
        }


        loadAdditionalFiles();

    } catch (e) {
        PAICode.stop();
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


async function check_pai_os_folders() {

    let pai_root_folder = (os.platform == "win32") ? "..\\PAI\\" : "../PAI/";
    const pai_bot_folder = pai_root_folder + "Bot";
    const pai_log_folder = pai_root_folder + "Logs";

    PAILogger.info("Checking PAI O/S folders");

    //create PAI O/S Folder
    if (!fs.existsSync(pai_root_folder)) {
        PAILogger.info("Creating PAI O/S folder " + pai_root_folder);
        fs.mkdirSync(pai_root_folder);
    } else {
        PAILogger.info("PAI O/S Folder is " + pai_root_folder);
    }

    if (!fs.existsSync(pai_log_folder)) {
        PAILogger.info("Creating PAI Logs folder " + pai_log_folder);
        fs.mkdirSync(pai_log_folder);
    } else {
        PAILogger.info("PAI-BOT Logs is " + pai_log_folder);
    }

    if (!fs.existsSync(pai_bot_folder)) {
        PAILogger.info("Creating PAI-BOT folder " + pai_bot_folder);
        fs.mkdirSync(pai_bot_folder);
    } else {
        PAILogger.info("PAI-BOT Folder is " + pai_bot_folder);
    }
}


main().then((success) => {

    if (success) {
        PAILogger.info("Bot started with great success");
        if(process.env.PAI_CONNECTORS.includes('HTTP')){
            httpConnector.add_catch_all();
        }
        PAILogger.info("Number of modules loaded ");
    } else
        PAILogger.error("Bot failed to start");
}).catch(e => {
    PAILogger.error("Bot failed to start " + e);
});
