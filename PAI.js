const {
    PAICode,
    PAILogger,
    PAICodeEvent,
    PAICodeCommand,
    PAICodeCommandContext,
    PAICodeModule,
    PAIModuleConfigParam
} = require('@pai-tech/pai-code');
const {PAINETModule} = require('@pai-tech/pai-net');
const {Config} = require('@pai-tech/pai-net-sdk');
const {PAIFileConnector, PAIHTTPConnector} = require('@pai-tech/pai-conntectors');
const PAIBotManager = require('./src/pai-bot/src/pai-bot-manager');
const readline = require('readline');
const {PAI_OS} = require('@pai-tech/pai-os');
const PAIModuleConfigStorageFiles = require('./src/pai-module-config-storage-files/pai-module-config-storage-files');
const {PAIBotModule} = require('./index');

const BotBaseModules = require('./src/pai-bot/src/modules/bot-base-modules');

let manager = new PAIBotManager();
let fileConnector;
let httpConnector;

let context = new PAICodeCommandContext('sender', 'gateway');

async function main() {
    try {
        await BotBaseModules.load();
        
        let modulesLoaded = await loadModules();
        
        if (!modulesLoaded) {
            // modules failed to load
        }
        
        await PAICode.executeString('pai-code show version', context);
        
        let botLoaded = await loadBot();
        if (!botLoaded) {
            // bot failed to load
        }
        
        
        // console.log(`${await paiNET.config.getConfigParam('nickname')}     ${await  paiNET.config.getConfigParam('id')}`);
        
        
        fileConnector = new PAIFileConnector();
        fileConnector.start();
        
        // httpConnector = new PAIHTTPConnector( { port:3000 } );
        // httpConntector.start();
        
        
        await getMessages();
        
        PAICode.start();
    } catch (e) {
        PAICode.stop();
        console.log(e);
    }
    
    return true;
}

function getMessages() {
    PAICode.executeString('pai-net get-messages', context)
        .then(results => {
            let result = results[0];
            
            if (result.response.success) {
                let responses = result.response.data;
                if (responses) {
                    let display = [];
                    for (let i = 0; i < responses.length; i++) {
                        let commandsInMsg = responses[i];
                        for (let j = 0; j < commandsInMsg.length; j++) {
                            display.push(commandsInMsg[j].response);
                        }
                    }
                    
                    if (display.length > 0)
                        console.log(display);
                }
            }
            
            setTimeout(getMessages, 1000);
        })
        .catch(err => {
            console.error(err);
            setTimeout(getMessages, 1000);
        });
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
    console.log(e);
});
