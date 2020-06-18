/**
 * PAI-BOT JS
 * Author       : Ron Fridman
 * Date Created : 9/25/2019
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
require('dotenv').config({path:'./config.env'});
const path = require("path");
const {PAIFileConnector, PAIHTTPConnector} = require("@pai-tech/pai-conntectors");
const PAIBotManager = require("./src/pai-bot/src/pai-bot-manager");
const BotBaseModules = require("./src/pai-bot/src/modules/bot-base-modules");
const PAIBotOSUtils = require("./src/pai-bot/src/utils/pai-bot-os-utils");

let manager = new PAIBotManager();
let fileConnector;
let httpConnector;

console.log(process.env.MAINTAINER_EMAIL);

async function main() {
    try {
        PAICode.start();

        await BotBaseModules.load();

        let modulesLoaded = await loadModules();

        if (!modulesLoaded) {
            // modules failed to load
        }

        await manager.loadBotStartupFile();

        let QFolder = await PAIBotOSUtils.getBotQueueFolder();

        fileConnector = new PAIFileConnector({path: `${QFolder}/in.pai`});
        fileConnector.start();

        httpConnector = new PAIHTTPConnector({port: (process.env.HTTP_PORT || 3141)});
        httpConnector.start();

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
        let success = await BotBaseModules.modules[i].registerModule();

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
