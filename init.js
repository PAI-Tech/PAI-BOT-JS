const {
	PAICode,
	PAILogger,
	PAICodeCommandContext
} = require("@pai-tech/pai-code");
const env = require("./env-loader");
const readline = require("readline");
const PAIBotManager = require("./src/pai-bot/src/pai-bot-manager");

const BotBaseModules = require("./src/pai-bot/src/modules/bot-base-modules");

let manager = new PAIBotManager();


let args = [];

process.argv.forEach(function (val, index, array) {
	if (index >= 2)
		args.push(val);
});

let initScript = "";
if (args.length > 0)
	initScript = args[0];


PAILogger.info("init script: " + initScript);

const context = new PAICodeCommandContext("sender", "gateway");

async function main() {
	try {
		
		await BotBaseModules.load();
		
		let modulesLoaded = await loadModules();
		
		if (!modulesLoaded) {
			// modules failed to load
		}
		
		let botLoaded = await loadBot();
		if (!botLoaded) {
			// bot failed to load
			PAILogger.error("BOT NOT LOADED");
		}
		
		
		if (initScript && initScript.length > 0) {
			await PAICode.executeString(initScript, context);
		}
		
		
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


/**
 *
 * @return {Promise<boolean>}
 */
async function loadBot() {
	let activeBot = await manager.loadBots();
	
	if (!activeBot) {
		activeBot = await manager.createNewBot();
		if (!(initScript && initScript.length > 0)) {
			let shouldCreateBot = (await askQuestions("No bots found, would you like to create one ?", "yes")) === "yes";
			if (shouldCreateBot)
				await createNewBotInApi();
		}
	}
	
	return (activeBot && activeBot.id && activeBot.id.length > 0);
}

async function createNewBotInApi() {
	let BASE_URL = await askQuestions("Please enter PAI-NET url:", "https://console.pai-net.org");
	await PAICode.executeString(`pai-net config param_name:"base_url" param_value:"${BASE_URL}"`, context);
	
	let username = await askQuestions("Please enter PAI-NET username:");
	let password = await askQuestions("Please enter PAI-NET password:");
	
	let cmdArray = await PAICode.executeString(`
        pai-net login username:"${username}" password:"${password}"
        pai-net get-user
        `, context);
	if (cmdArray.length > 1) {
		let loginCommand = cmdArray[0];
		let userCommand = cmdArray[1];
		if (loginCommand.response.success &&
			loginCommand.response.data === true &&
			userCommand.response.success &&
			userCommand.response.data) {
			PAILogger.info("login success");
			
			let nickname = await askQuestions("Please enter Bot's nickname: ");
			
			cmdArray = await PAICode.executeString(`pai-net create-bot nickname:"${nickname}"`, context);
			if (cmdArray.length > 0) {
				let createBotCommand = cmdArray[0];
				if (createBotCommand.response.success) {
					PAILogger.info("Bot created successfully !");
					let botId = createBotCommand.response.data._id;
					cmdArray = await PAICode.executeString(`pai-net bot-login username:"${username}" password:"${password}" bot_id:"${botId}"`, context);
					
					if (cmdArray.length > 0) {
						let botLoginCommand = cmdArray[0];
						if (botLoginCommand.response.success) {
							PAILogger.info("Bot token is now active :)");
						}
						else {
							PAILogger.error("Error while creating bot token");
						}
					}
					
					
				}
			}
		}
		else {
			PAILogger.error("login failed");
			return createNewBotInApi();
		}
	}
	
}


function askQuestions(question, defaultValue) {
	return new Promise((resolve, reject) => {
		try {
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});
			
			let defaultValueText = defaultValue ? " (" + defaultValue + ")" : "";
			
			rl.question(question + defaultValueText + "     ", (answer) => {
				let fixedAnswer = answer.trim();
				if (fixedAnswer.length < 1) {
					fixedAnswer = defaultValue;
				}
				
				rl.close();
				resolve(fixedAnswer);
			});
		} catch (e) {
			reject(e);
		}
	});
}


main().then((success) => {
	process.exit(success ? 0 : 1);
}).catch(e => {
	PAILogger.error(e);
});






