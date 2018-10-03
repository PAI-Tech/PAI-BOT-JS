const {
    PAICode,
    PAILogger,
    PAICodeEvent,
    PAICodeCommand,
    PAICodeCommandContext,
    PAICodeModule,
    PAIModuleConfigParam
} = require('@pai-tech/pai-code');

const {PAIFileConnector, PAIHTTPConnector} = require('@pai-tech/pai-conntectors');
const PAIBotManager = require('./src/pai-bot/src/pai-bot-manager');
const {PAIBotModule} = require('./index');
const BotBaseModules = require('./src/pai-bot/src/modules/bot-base-modules');
const PAIBotOSUtils = require('./src/pai-bot/src/utils/pai-bot-os-utils');

let manager = new PAIBotManager();
let fileConnector;
let httpConnector;

let context = new PAICodeCommandContext('sender', 'gateway');

async function main() {
    try {
        PAICode.start();
        
        await BotBaseModules.load();
        
        let modulesLoaded = await loadModules();
        
        if (!modulesLoaded) {
            // modules failed to load
        }
        
        let botLoaded = await loadBot();
        if (!botLoaded) {
            // bot failed to load
        }
        
        let QFolder = await PAIBotOSUtils.getBotQueueFolder();
        
        fileConnector = new PAIFileConnector( { path: `${QFolder}/in.pai` } );
        fileConnector.start();
        
        httpConnector = new PAIHTTPConnector( { port:3141 } );
        httpConnector.start();
        
        // await getMessages();
        
        
    } catch (e) {
        PAICode.stop();
        console.log(e);
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
        throw new Error('No active bots!');
    }
    
    return (activeBot && activeBot.id && activeBot.id.length > 0);
}


main().then((success) => {

}).catch(e => {
    PAILogger.error(e);
});
