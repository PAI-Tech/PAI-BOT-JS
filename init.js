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
		
		await BotBaseModules.load();
		
		let modulesLoaded = await loadModules();
		
		if (!modulesLoaded) {
			// modules failed to load
		}
		
		await manager.createBotFiles();
		await manager.loadBotStartupFile();
		
		await registerBotToPAINET();
		
		
	} catch (e) {
		PAICode.stop();
		PAILogger.error(e);
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
	PAILogger.error(e);
});






