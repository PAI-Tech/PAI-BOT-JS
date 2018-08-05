
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
const PAIBotManager = require('./src/pai-bot/src/pai-bot-manager');
const { PAI_OS } = require('@pai-tech/pai-os');
const PAIModuleConfigStorageFiles = require('./src/pai-module-config-storage-files/pai-module-config-storage-files');
const { PAIBotModule } = require('./index');

let manager = new PAIBotManager();


let paiBOT = new PAIBotModule();
let paiOS = new PAI_OS();
let paiNET = new PAINETModule();

let args = [];

process.argv.forEach(function (val, index, array) {
    if(index >= 2)
        args.push(val);
});

let initScript = "";
if(args.length > 0)
    initScript = args[0];


console.log(initScript);


return process.exit(0);


async function main()
{
    try {
    
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
    
        await loadModulesConfig();
        
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
async function loadModules(){
    
    let modules = [
        paiOS,
        paiBOT,
        paiNET
    ];
    
    for (let i = 0; i < modules.length; i++) {
        let success =  await modules[i].registerModule();
        
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

/**
 * Load configuration for every module
 * @return {Promise<void>}
 */
async function loadModulesConfig()
{
    let paiOSFolder = await paiOS.config.getConfigParam('PAI_OS_PATH');
    let botSettingsFolder = `${paiOSFolder}Bot/${manager.activeBot.id}/settings/`;
    paiNET.config.storage = new PAIModuleConfigStorageFiles({
        filePath: botSettingsFolder + paiNET.setModuleName() + '.json'
    });
}


main().then((success) => {
    process.exit(0);
}).catch(e => {
    console.log(e);
});
