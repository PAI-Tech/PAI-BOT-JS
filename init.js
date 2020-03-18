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


const {
	PAICode,
	PAILogger,
	PAICodeCommandContext
} = require("@pai-tech/pai-code");
const env = require("./env-loader");

const PAIBotManager = require("./src/pai-bot/src/pai-bot-manager");
const BotBaseModules = require("./src/pai-bot/src/modules/bot-base-modules");
const registerToPAINET = require("./src/installation/pai-net-registration/pai-net-registration-flow");

let manager = new PAIBotManager();

async function main() {
	try {

        PAILogger.info("Hey :)");
		await BotBaseModules.load();
        PAILogger.info("Loading bot modules, may the force be with us...");
		let modulesLoaded = await loadModules();
		
		if (!modulesLoaded) {
			// modules failed to load
            PAILogger.info("FAILED to load modules!!!!!!!!!");
		}
        PAILogger.info("Creating bot files");
		await manager.createBotFiles();
        PAILogger.info("Loading bot startup files");
		await manager.loadBotStartupFile();
        PAILogger.info("Registering to PAI-NET");
		await registerBotToPAINET();
		
		
	} catch (e) {
		PAICode.stop();
		PAILogger.error("PAI-BOT (main):" + e);
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

async function registerBotToPAINET() {
	
	const context = new PAICodeCommandContext("sender", "gateway");
	
	let commands = await PAICode.executeString(`pai-net get-bot`,context);
	if(commands && commands[0] && commands[0].response.success && commands[0].response.data == null)
	{
		PAILogger.info(`
--------------------------------------------------------------------------
			`);
		
		await registerToPAINET();
		
	}
	
	return true;
}



main().then((success) => {
	process.exit(success ? 0 : 1);
}).catch(e => {
	PAILogger.error("PAI-BOT (regsiterBotToPAINET):" + e);
});






