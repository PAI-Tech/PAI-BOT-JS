const {
	PAICode,
	PAILogger,
} = require("@pai-tech/pai-code");

const env = require("./env-loader");

const path = require("path");
const {PAIFileConnector, PAIHTTPConnector} = require("@pai-tech/pai-conntectors");
const PAIBotManager = require("./src/pai-bot/src/pai-bot-manager");
const BotBaseModules = require("./src/pai-bot/src/modules/bot-base-modules");
const PAIBotOSUtils = require("./src/pai-bot/src/utils/pai-bot-os-utils");

let manager = new PAIBotManager();
let fileConnector;
let httpConnector;


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
		PAILogger.error(e);
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
		PAILogger.error("error while loading includeFiles from package.json");
		PAILogger.error(e);
	}
}

main().then((success) => {
	if (success) {
		PAILogger.info("Bot started with success");
	}
	else
		PAILogger.error("Bot filed to start");
}).catch(e => {
	PAILogger.error("Bot filed to start");
	PAILogger.error(e);
});
