const PAIBot = require('./models/pai-bot');
const PAIBotStatus = require('./models/pai-bot-status');
const fs = require('fs');
const shell = require('shelljs');
const PAIBotOSUtils = require('./utils/pai-bot-os-utils');
const { PAICode, PAIUtils, PAICodeCommandContext, PAILogger } = require('@pai-tech/pai-code');


/**
 *
 * @return {Promise<Boolean>}
 */
function isFileExists(filePath)
{
    return new Promise( (resolve, reject) => {
        try {
			fs.exists(filePath, function read(exists) {
				return resolve(exists);
			});
		}catch (e) {
            PAILogger.error("Cannot check if file exists: " + filePath, e);
            reject(e);
		}
    });
}



/**
 * Read text from file
 *
 * @param {String} filePath
 * @return {Promise<String>}
 */
function readFile(filePath)
{
    return new Promise( (resolve, reject) => {
        fs.readFile(filePath, function read(err, data) {
            if (err) {
                return reject(err);
            }
            if(data)
                data = data.toString('utf8');
            
            return resolve(data);
        });
    });
}





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
		
			if(!(await isFileExists(startupFile)))
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
        const fileExists = await isFileExists(botStartupFile);
        
        if(!fileExists)
        {
            PAILogger.warn("startup.pai file not found");
            return;
		}
        
        let botStartupCode = await readFile(botStartupFile);
        if(botStartupCode)
        {
            let context = new PAICodeCommandContext('sender','gateway');
            await PAICode.executeString(botStartupCode,context).catch(err => {
                PAILogger.error("Cannot execute startup command",err);
            });
        }
    }
    
}


module.exports = PAIBotManager;
