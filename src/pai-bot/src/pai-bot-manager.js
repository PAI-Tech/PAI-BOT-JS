const PAIBot = require('./models/pai-bot');
const PAIBotStatus = require('./models/pai-bot-status');
const fs = require('fs');
const shell = require('shelljs');
const PAIBotOSUtils = require('./utils/pai-bot-os-utils');
const { PAICode, PAIUtils, PAICodeCommandContext, PAILogger } = require('@pai-tech/pai-code');





class PAIBotManager {
    
    constructor () {
    }
    
    
    /**
     * Create all bot files in PAI-OS
     * @return {Promise<PAIBot>}
     */
	createBotFiles() {
		return new Promise(async (resolve,reject) => {
			
			const settingsFolder = await PAIBotOSUtils.getBotSettingsFolder();
			const queueFolder = await PAIBotOSUtils.getBotQueueFolder();
		  	const startupFile = await PAIBotOSUtils.getBotStartupFile();
			
			shell.mkdir('-p', settingsFolder);
			shell.mkdir('-p', queueFolder);
		
			if(!(fs.existsSync(startupFile)))
			{
				fs.writeFile(startupFile, 'pai-code show version', 'utf8', async function(err,data) {
				
					if(err)
					{
						PAILogger.error("Error while creating startup file", err);
						reject(err);
					}
					
					resolve(true);
				});
			}
			else
			{
				resolve(true);
			}
			
		
		});
    }
	
	/**
	 * Load all bots from file
	 */
    async loadBotStartupFile()
    {
        const botStartupFile = await PAIBotOSUtils.getBotStartupFile();
        const fileExists = fs.existsSync(botStartupFile);
        
        if(!fileExists)
        {
            PAILogger.warn("startup.pai file not found");
            return;
		}
        
        let botStartupCode = await fs.readFileSync(botStartupFile,"utf8");
        if(botStartupCode)
        {
            let context = new PAICodeCommandContext('sender','gateway');
            // await PAICode.(botStartupCode,context).catch(err => {
            //     PAILogger.error("Cannot execute startup command",err);
            // });
            let res = await PAICode.run(botStartupCode);
            PAILogger.info( + "startup file response:\n" + res);
        }
    }
    
}


module.exports = PAIBotManager;
