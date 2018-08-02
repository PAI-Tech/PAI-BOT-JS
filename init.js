
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


let manager = new PAIBotManager();
let fileConnector;
let httpConnector;

let paiOS = new PAI_OS();
let paiNET = new PAINETModule();


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
    let paiOSFolder = `/var/PAI/`;
    await paiOS.config.setConfigParam('folderPath',paiOSFolder);
    
    let botSettingsFolder = `${paiOSFolder}Bot/${manager.activeBot.id}/settings/`;
    paiNET.config.storage = new PAIModuleConfigStorageFiles({filePath:`${botSettingsFolder}${paiNET.setModuleName()}.json`});
}




main().then((success) => {
    process.exit(0);
}).catch(e => {
    console.log(e);
});
