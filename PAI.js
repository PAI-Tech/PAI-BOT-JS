
const {
    PAICode,
    PAILogger,
    PAICodeEvent,
    PAICodeCommand,
    PAICodeCommandContext,
    PAICodeModule
} = require('@pai-tech/pai-code');


const { PAINETModule } = require('@pai-tech/pai-net');

const { Config } = require('@pai-tech/pai-net-sdk');

const { PAIFileConnector } = require('@pai-tech/pai-conntectors');

const PAIBotManager = require('./src/pai-bot/src/pai-bot-manager');

const readline = require('readline');


let manager = new PAIBotManager();
let fileConnector = null;

let pcmPAI_NET = null;

manager.loadBots().then(async (activeBot) => {
    
    if(!activeBot)
    {
        let botNickname = await askBotName();
        if(botNickname)
            return manager.createNewBot(botNickname);
        else
            throw new Error('No active bots!');
    }
}).then(async () => {
    initPAINET();
    // load more modules
    pcmPAI_NET = new PAINETModule();
    await PAICode.loadModule('pai-net',pcmPAI_NET);
    
    PAICode.start();
    
    // register new connector
    fileConnector = new PAIFileConnector();
    fileConnector.start();
    
    
}).catch(e => {
    PAICode.stop();
    console.log(e);
});



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
    if(shouldCreateBot == 'yes')
    {
        let botName = await askQuestion('OK. Choose a nickname for your bot.');
        return botName;
    }
    return null;
}


function askQuestion(question, defaultValue)
{
    return new Promise((resolve,reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        let questionAndDefault = question + ((defaultValue) ? " (" + defaultValue + ") " : "");
        rl.question(questionAndDefault, (answer) => {
            rl.close();
            return resolve(answer);
        });
        
        if (defaultValue)
            rl.write(defaultValue);
    });
}




