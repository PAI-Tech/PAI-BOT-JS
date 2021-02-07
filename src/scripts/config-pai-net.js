/**
 * PAI-BOT JS
 * Author       : Ron Fridman
 * Date Created : 9/25/2019
 * Copyright PAI-TECH 2018, all right reserved
 *
 *
 *      This program is free software; you can redistribute it and/or
 *		modify it under the terms of the GNU General Public License
 *		as published by the Free Software Foundation; either version
 *		3 of the License, or (at your option) any later version.
 */



const fs = require('fs');
const path = require('path');
const os = require("os");
const inquirer = require('inquirer');

const {
	PAICode,
	PAILogger,
	PAICodeCommandContext
} = require("@pai-tech/pai-code");

//BOTS 2.0
const os_utils = require("../pai-bot/src/utils/bot-os-utils");
const pai_bot_settings = require("../pai-bot/src/utils/pai-bot-settings").get_instance();


const BotBaseModules = require("../pai-bot/src/modules/bot-base-modules");
const registerToPAINET = require("../installation/pai-net-registration/pai-net-registration-flow");






async function main() {
	try {
		await PAICode.on_ready();
		await os_utils.check_bot_folders();
		pai_bot_settings.load();
		await BotBaseModules.load();
        PAILogger.info("Loading bot modules, may the force be with us...");
		let modulesLoaded = await loadModules();
		
		if (!modulesLoaded) {
			// modules failed to load
            PAILogger.info("FAILED to load modules!!!!!!!!!");
		}
        // PAILogger.info("Creating bot files");
		// await manager.createBotFiles();
        // PAILogger.info("Loading bot startup files");
		// await manager.loadBotStartupFile();
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
	return new Promise((resolve, reject) => {
	for (let i = 0; i < BotBaseModules.modules.length; i++) {
		
		let success =  BotBaseModules.modules[i].registerModule();
		
		if (!success) {
			console.log("Unable to load base module " + BotBaseModules.modules[i].get_module_name());
			resolve(false)
		}
	}
	
	resolve( true);
	});
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
	else {

		await ask_questions(commands[0].response.data.nickname);
	}
	
	return true;
}

async function ask_questions(bot_name) {

	return new Promise((resolve, reject) => {

		const questions = [
			{
				type: "confirm",
				name: "register-to-pai-net",
				message: "Your Bot is already connected to PAI-NET as " + bot_name + ". Would you like to register your bot to other PAI-NET  ? ",
				default: false,
			}];
		inquirer
			.prompt(questions)
			.then(answers => {
				for (const key in answers) {
					if (key.indexOf('_') === 0) {
						delete answers[key];
					}
				}

				if (answers.length === 0) {
					PAILogger.info('Nothing to update');
					reject(false);
				}


				if(answers["register-to-pai-net"]) {
					resolve(true);
				}
				else {
					reject(false);
				}


			}).catch(err => {
			PAILogger.error('error:' + err.message, err);
			reject (false);
		});
	});

}

main().then((success) => {
	process.exit(success ? 0 : 1);
}).catch(e => {
	PAILogger.error("PAI-BOT (regsiterBotToPAINET):" + e);
});






