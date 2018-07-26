const PAIBot = require('./models/pai-bot');
const PAIBotStatus = require('./models/pai-bot-status');
const fs = require('fs');
const shell = require('shelljs');
const PAIBotOSUtils = require('./utils/pai-bot-os-utils');
const { PAICode,PAIUtils } = require('@pai-tech/pai-code');

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
        
        
        let folder = PAIBotOSUtils.getBotFolder(bot);
        let settingsFolder = PAIBotOSUtils.getBotSettingsFolder(bot);
        let queueFolder = PAIBotOSUtils.getBotQueueFolder(bot);
        
        shell.mkdir('-p', folder);
        shell.mkdir('-p', settingsFolder);
        shell.mkdir('-p', queueFolder);
    
        fs.writeFile(PAIBotOSUtils.getBotStartupFile(bot), 'pai-code show version', 'utf8', function(err,data){
            
            fs.writeFile(`${settingsFolder}settings.json`, json, 'utf8', function(err,data){
                if(err)
                    return reject(err);
                return resolve(data);
            });
            
        });
        
    });
}

/**
 * Read Bot settings file
 *
 * @param {PAIBot} bot
 * @return {Promise<any>}
 */
function readBotFile(bot)
{
    return new Promise((resolve,reject) => {
        
        let settingsFolder = PAIBotOSUtils.getBotSettingsFolder(bot);
        fs.readFile(`${settingsFolder}settings.json`, function(err,data){
            if(err)
                return reject(err);
            return resolve(data);
        });
        
    })
}


/**
 * Save active bots file
 * @param {String} activeBots
 * @return {Promise<any>}
 */
function saveActiveBotsFile(activeBots){
    
    return new Promise((resolve,reject) => {
        let filePath = PAIBotOSUtils.getActiveBotsFilePath();
        
        fs.writeFile(filePath, activeBots, 'utf8', function(err,data){
            if(err)
                return reject(err);
            return resolve(data);
        });
    });
    
}


/**
 * Read Active bots file and return it as string
 * @return {Promise<any>}
 */
function readActiveBotsFile()
{
    return new Promise( (resolve, reject) => {
        let filePath = PAIBotOSUtils.getActiveBotsFilePath();
        fs.readFile(filePath, function read(err, data) {
            if (err) {
                return reject(err);
            }
            return resolve(data);
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
        let filePath = PAIBotOSUtils.getActiveBotsFilePath();
        fs.exists(filePath, function read(exists) {
            return resolve(exists);
        });
    });
}




/**
 * Read Bot's startup file
 *
 * @param {PAIBot} bot
 * @return {Promise<any>}
 */
function readStartupFile(bot)
{
    return new Promise( (resolve, reject) => {
        let filePath = PAIBotOSUtils.getBotStartupFile(bot);
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
    
    
    createNewBot(botNickname) {
        return new Promise( async (resolve,reject) => {
            
            let bot = new PAIBot();
            
            bot.nickname = botNickname;
            bot.id = PAIUtils.pai_guid();
            bot.createdAt = (new Date()).getTime();
            bot.status = PAIBotStatus.NEW;
            
            // TODO: create bot in API
    
            await createBotFiles(bot);
    
            this.setBot(bot);
            
            let botIds = [bot.id];//this.activeBots.map(bot => bot.id)
            
            await saveActiveBotsFile(JSON.stringify(botIds));
            
            return resolve(true);
        });
    }
    
    /**
     * Load all bots from file
     * @return {Promise< PAIBot[] >}
     */
    async loadBots()
    {
        let file = await isFileExists(PAIBotOSUtils.getActiveBotsFilePath());
        if(file)
        {
            let fileData = await readActiveBotsFile();
            let botIds = JSON.parse(fileData);
        
            for (let i = 0; i < botIds.length; i++) {
                let bot = await this.loadBot(botIds[i]);
                
                // TODO: run bot startup files
                this.setBot(bot);
        
                let botStartupCode = await readStartupFile(bot);
                if(botStartupCode) {
                    let startupResponse = await PAICode.executeString(botStartupCode);
                }
                
                break; // support only single bot for now
            }
        }
        
        return this.activeBot;
    }
    
    /**
     *
     * @param {String} botId
     * @return {Promise<PAIBot>}
     */
    async loadBot(botId)
    {
        let bot = new PAIBot();
        bot.id = botId;
        
        let botData = await readBotFile(bot);
        
        let obj = JSON.parse(botData);
        
        bot.status = obj.status;
        bot.createdAt = obj.createdAt;
        bot.nickname = obj.nickname;
        
        return bot;
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
