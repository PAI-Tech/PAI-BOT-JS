const PAIBot = require('./models/pai-bot');
const PAIBotStatus = require('./models/pai-bot-status');
const fs = require('fs');
const shell = require('shelljs');
const PAIBotOSUtils = require('./utils/pai-bot-os-utils');
const { PAICode, PAIUtils } = require('@pai-tech/pai-code');

/**
 * Create all bot files in PAI-OS
 *
 * @param {PAIBot} bot
 * @return {Promise<any>}
 */
function createBotFiles(bot)
{
    return new Promise((resolve,reject) => {
        let json = JSON.stringify(bot);
        
        let settingsFolder = PAIBotOSUtils.getBotSettingsFolder();
        let queueFolder = PAIBotOSUtils.getBotQueueFolder();
        
        shell.mkdir('-p', settingsFolder);
        shell.mkdir('-p', queueFolder);
        
        fs.writeFile(PAIBotOSUtils.getBotStartupFile(), 'pai-code show version', 'utf8', function(err,data){
            
            fs.writeFile(PAIBotOSUtils.getBotSettingsFile(), json, 'utf8', function(err,data){
                if(err)
                    return reject(err);
                return resolve(data);
            });
            
        });
        
    });
}


/**
 *
 * @return {Promise<Boolean>}
 */
function isFileExists(filePath)
{
    return new Promise( (resolve, reject) => {
        fs.exists(filePath, function read(exists) {
            return resolve(exists);
        });
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
        this.activeBot = null;
        process.pai.bot = null;
    }
    
    
    /**
     *
     * @return {Promise<PAIBot>}
     */
    createNewBot() {
        return new Promise( async (resolve,reject) => {
            
            let bot = new PAIBot();
            
            bot.nickname = 'sample bot';
            bot.id = PAIUtils.pai_guid();
            bot.createdAt = (new Date()).getTime();
            bot.status = PAIBotStatus.NEW;
            
            // TODO: create bot in API
    
            await createBotFiles(bot);
    
            this.setBot(bot);
            
            return resolve(bot);
        });
    }
    
    /**
     * Load all bots from file
     * @return {Promise< PAIBot >}
     */
    async loadBots()
    {
        let file = await isFileExists(PAIBotOSUtils.getBotSettingsFile());
        if(file)
        {
            let fileData = await readFile(PAIBotOSUtils.getBotSettingsFile());
            let botObj = JSON.parse(fileData);
    
    
            let bot = Object.assign(new PAIBot(),botObj);
            
            let botStartupCode = await readFile(PAIBotOSUtils.getBotStartupFile());
            if(botStartupCode)
            {
                let startupResponse = await PAICode.executeString(botStartupCode);
            }
            
            this.activeBot = bot;
        }
        
        return this.activeBot;
    }
    
    
    // create bot in files
    
    /**
     *
     * @param {PAIBot} bot
     */
    setBot(bot){
        this.activeBot = bot;
        process.pai.bot = bot;
    }
}


module.exports = PAIBotManager;
