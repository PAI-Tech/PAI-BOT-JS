const PAIBot = require('./models/pai-bot');
const PAIBotStatus = require('./models/pai-bot-status');
const fs = require('fs');
const shell = require('shelljs');
const PAIBotOSUtils = require('./utils/pai-bot-os-utils');
const {PAICode} = require('pai-code');

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
        
        fs.writeFile(`${settingsFolder}settings.json`, json, 'utf8', function(err,data){
            if(err)
                return reject(err);
            return resolve(data);
        });
        
    })
}

/**
 * Read Bot settings file
 *
 * @param {String} botId
 * @return {Promise<any>}
 */
function readBotFile(botId)
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





class PAIBotManager {
    
    constructor () {
        this.activeBots = [];
        console.log('bot constractor');
    }
    
    
    createNewBot(botNickname) {
        return new Promise( async (resolve,reject) => {
            
            let bot = new PAIBot();
            
            bot.nickname = botNickname;
            bot.id = 'a1324567';
            bot.createdAt = (new Date()).getTime();
            bot.status = PAIBotStatus.NEW;
            
            // TODO: create bot in API
    
            await createBotFiles(bot);
            
            this.activeBots.push(bot);
            
            let botIds = this.activeBots.map(bot => bot.id)
            
            await saveActiveBotsFile(JSON.stringify(botIds));
            
            return resolve(true);
        });
    }
    
    
    async loadBots()
    {
        let fileData = await readActiveBotsFile();
        let botIds = JSON.parse(fileData);
    
        for (let i = 0; i < botIds.length; i++) {
            let bot = await this.loadBot(botIds[i]);
            
            // TODO: run bot startup files
            
            this.activeBots.push(bot);
        }
    }
    
    async loadBot(botId)
    {
        let botData = await readBotFile(botId);
        
        let obj = JSON.parse(botData);
        
        let bot = new PAIBot();
        bot.id = obj.id;
        bot.status = obj.status;
        bot.createdAt = obj.createdAt;
        bot.nickname = obj.nickname;
        
        return bot;
    }
    
    // create bot in files
    
}




module.exports = PAIBotManager;
