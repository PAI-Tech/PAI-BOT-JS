
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
const { PAIFileConnector, PAIHTTPConnector } = require('@pai-tech/pai-conntectors');
const PAIBotManager = require('./src/pai-bot/src/pai-bot-manager');
const readline = require('readline');
const { PAI_OS } = require('@pai-tech/pai-os');

let manager = new PAIBotManager();
let fileConnector;
let httpConnector;


async function start()
{
    try{
        
        
        await PAICode.loadModule('pai-os',new PAI_OS());
        await PAICode.loadModule('pai-net',new PAINETModule());
        
        
        let activeBot = await manager.loadBots();
        
        if(!activeBot)
        {
            let botNickname = await askBotName();
            if(botNickname)
                await manager.createNewBot(botNickname);
            else
                throw new Error('No active bots!');
        }
    
        fileConnector = new PAIFileConnector();
        fileConnector.start();
        
        // httpConnector = new PAIHTTPConnector( { port:3000 } );
        // httpConntector.start();
        
        
        
        setInterval(async () => {
            let result = await PAICode.executeString('pai-net get-messages');
            result = result[0];
            
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
            
        },1000);

    
        PAICode.start();
    } catch (e) {
        PAICode.stop();
        console.log(e);
    }
    
    return true;
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



start();
