const readline = require('readline');

const {
    PAICode,
    PAILogger,
    PAICodeCommandContext
} = require('@pai-tech/pai-code');

const PAIBotManager = require('./src/pai-bot/src/pai-bot-manager');

const BotBaseModules = require('./src/pai-bot/src/modules/bot-base-modules');


let manager = new PAIBotManager();


let args = [];

process.argv.forEach(function (val, index, array) {
    if(index >= 2)
        args.push(val);
});

let initScript = "";
if(args.length > 0)
    initScript = args[0];


console.log("init script: " + initScript);


const context = new PAICodeCommandContext('sender','gateway');

async function main()
{
    try {
    
        await BotBaseModules.load();
        
        let modulesLoaded = await loadModules();
        
        if(!modulesLoaded)
        {
            // modules failed to load
        }
        
        let botLoaded = await loadBot();
        if(!botLoaded)
        {
            // bot failed to load
            PAILogger.error('BOT NOT LOADED');
        }
    
        
        
        if(initScript && initScript.length > 0)
        {
            let cmdArray = await PAICode.executeString(initScript,context);
        }
        
        
    } catch (e) {
        PAICode.stop();
        PAILogger.error(e);
    }
    
    return true;
}


/**
 *
 * @return {Promise<boolean>}
 */
async function loadModules(){
    
    for (let i = 0; i < BotBaseModules.modules.length; i++) {
        
        let success =  await BotBaseModules.modules[i].registerModule();
        
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
        activeBot = await manager.createNewBot();
        let shouldCreateBot = (await askQuestions("No bots found, would you like to create one ?", "yes")) === "yes" ;
        if(shouldCreateBot)
            await createNewBotInApi();
        
    }
    
    return (activeBot && activeBot.id && activeBot.id.length > 0);
}

async function createNewBotInApi()
{
    let BASE_URL = await askQuestions("Please enter PAI-NET url:","http://dev.pai-net.org");
    await PAICode.executeString(`pai-net config param_name:"base_url" param_value:"${BASE_URL}"`,context);
    
    let username = await askQuestions("Please enter PAI-NET username:");
    let password = await askQuestions("Please enter PAI-NET password:");
    
    let cmdArray = await PAICode.executeString(`
        pai-net login username:"${username}" password:"${password}"
        pai-net get-user
        `,context);
    if(cmdArray.length > 1) {
        let loginCommand = cmdArray[0];
        let userCommand = cmdArray[1];
        if(loginCommand.response.success &&
            loginCommand.response.data === true &&
            userCommand.response.success &&
            userCommand.response.data)
        {
            console.log('login success');
    
            let nickname = await askQuestions("Please enter Bot's nickname");
    
            cmdArray = await PAICode.executeString(`pai-net create-bot nickname:"${nickname}"`,context);
            if(cmdArray.length > 0) {
                let createBotCommand = cmdArray[0];
                if(createBotCommand.response.success)
                {
                    console.log('Bot created successfully !');
                    let botId = createBotCommand.response.data._id;
                    cmdArray = await PAICode.executeString(`pai-net bot-login username:"${username}" password:"${password}" bot_id:"${botId}"`,context);
    
                    if(cmdArray.length > 0) {
                        let botLoginCommand = cmdArray[0];
                        if(botLoginCommand.response.success)
                        {
                            console.log('Bot token is now active :)');
                        }
                        else
                        {
                            console.log('Error while creating bot token');
                        }
                    }
                    
                    
                }
            }
        }
        else
        {
            console.log('login failed');
            return createNewBotInApi();
        }
    }
    
}


function askQuestions(question, defaultValue) {
    return new Promise((resolve, reject) => {
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    
        let defaultValueText = defaultValue ? " (" + defaultValue + ")" : "";
        
        rl.question(question + defaultValueText + "     ", (answer) => {
            
            answer = answer.trim();
            if(answer.length < 1)
            {
                answer = defaultValue;
            }
            
            rl.close();
            resolve(answer);
        });
    });
}


main().then((success) => {
    process.exit(0);
}).catch(e => {
    console.log(e);
});