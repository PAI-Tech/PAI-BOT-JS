
const {
    PAICode,
    PAILogger,
    PAICodeEvent,
    PAICodeCommand,
    PAICodeCommandContext,
    PAICodeModule,
    PAIModuleConfigParam
} = require('@pai-tech/pai-code');
const { PAINETModule } = require('@pai-tech/pai-net');
const { Config } = require('@pai-tech/pai-net-sdk');
const { PAIFileConnector, PAIHTTPConnector } = require('@pai-tech/pai-conntectors');
const PAIBotManager = require('./src/pai-bot/src/pai-bot-manager');
const readline = require('readline');
const { PAI_OS } = require('@pai-tech/pai-os');
const PAIModuleConfigStorageFiles = require('./src/pai-module-config-storage-files/pai-module-config-storage-files');
const { PAIBotModule } = require('./index');

let manager = new PAIBotManager();
let fileConnector;
let httpConnector;

let paiOS = new PAI_OS();
let paiNET = new PAINETModule();
let paiBOT = new PAIBotModule();

async function main()
{
    try {
    
        let modulesLoaded = await loadModules();
        
        if(!modulesLoaded)
        {
            // modules failed to load
        }
        
        await PAICode.executeString('pai-code show version');
        
        let botLoaded = await loadBot();
        if(!botLoaded)
        {
            // bot failed to load
        }
        
        
        await loadModulesConfig();
    
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

function getMessages()
{
    PAICode.executeString('pai-net get-messages')
    .then(results => {
        let result = results[0];

        if(result.response.success)
        {
            let responses = result.response.data;
            let display = [];
            for (let i = 0; i < responses.length; i++) {
                let commandsInMsg =  responses[i];
                for (let j = 0; j < commandsInMsg.length; j++) {
                    display.push(commandsInMsg[j].response);
                }
            }
    
            if(display.length > 0)
                console.log(display);
        }
    
        setTimeout(getMessages, 1000);
    })
    .catch(err => {
        console.error(err);
        setTimeout(getMessages, 1000);
    });
}


function initPAINET()
{
    const BASE_URL = "http://stage.pai-tech.org:3000";
    
    Config.init({
        BASE_URL
    });
}


async function askBotName()
{
    let shouldCreateBot = await askQuestion('Cannot find PAIBot on your machine. do you want to create one ? ','yes');
    if(shouldCreateBot === 'yes')
    {
        let botName = await askQuestion('OK. Choose a nickname for your bot:',null);
        return botName;
    }
    return null;
}

/**
 *
 * @param {String} question
 * @param {String} defaultValue
 * @return {Promise<any>}
 */
function askQuestion(question, defaultValue)
{
    return new Promise((resolve,reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        let questionAndDefault = question + ((defaultValue) ? " (" + defaultValue + ") " : "") + `
`;
        rl.question(questionAndDefault, (answer) => {
            rl.close();
            answer = answer.trim();
            if(!answer || answer.length == 0)
                answer = defaultValue;
            return resolve(answer);
        });
        
    });
}


/**
 *
 * @return {Promise<boolean>}
 */
async function loadModules(){
    
    let modules = [
        paiOS,
        paiBOT,
        paiNET
    ];
    
    for (let i = 0; i < modules.length; i++) {
        let success = await PAICode.loadModule(modules[i].setModuleName(),modules[i]);
        if(!success)
            return false;
    }
    
    return true;
}


/**
 *
 * @return {Promise<boolean>}
 */
async function loadBot()
{
    let activeBot = await manager.loadBots();
    
    if(!activeBot)
    {
        let botNickname = await askBotName();
        if(botNickname)
            activeBot = await manager.createNewBot(botNickname);
        else
            throw new Error('No active bots!');
    }
    
    return (activeBot && activeBot.id && activeBot.id.length > 0);
}

/**
 * Load configuration for every module
 * @return {Promise<void>}
 */
async function loadModulesConfig()
{
    let paiOSFolder = `/var/PAI/`;
    await paiOS.config.setConfigParam('folderPath',paiOSFolder);
    
    let botSettingsFolder = `${paiOSFolder}Bot/${manager.activeBot.id}/settings/`;
    paiNET.config.storage = new PAIModuleConfigStorageFiles({filePath:`${botSettingsFolder}${paiNET.setModuleName()}.json`});
}




main().then((success) => {

}).catch(e => {
    console.log(e);
});
