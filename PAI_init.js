
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
        }
        
        if(initScript && initScript.length > 0)
        {
            let context = new PAICodeCommandContext('sender','gateway');
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
    }
    
    return (activeBot && activeBot.id && activeBot.id.length > 0);
}


main().then((success) => {
    process.exit(0);
}).catch(e => {
    console.log(e);
});
