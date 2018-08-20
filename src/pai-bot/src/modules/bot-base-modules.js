const { PAINETModule } = require('@pai-tech/pai-net');
const { PAI_OS } = require('@pai-tech/pai-os');
const PAIModuleConfigStorageFiles = require('../../../pai-module-config-storage-files/pai-module-config-storage-files');
const PAIBotModule = require('../../pcm-pai-bot');


const paiBOT = new PAIBotModule();
const paiOS = new PAI_OS();
const paiNET = new PAINETModule();


const modules = [
    paiOS,
    paiNET,
    paiBOT
];

let modulesLoaded = false;

/**
 * Load configuration for every module
 * @return {Promise<void>}
 */
async function loadModulesConfig()
{
    if(!modulesLoaded)
    {
        await paiOS.getOSPath();
        
        let paiOSFolder = await paiOS.config.getConfigParam('PAI_OS_PATH');
        
        if(!paiOSFolder)
            throw new Error('$PAI is not defined in server');
        
        let botSettingsFolder = `${paiOSFolder}/Bot/settings/`;
        
        paiNET.config.storage = new PAIModuleConfigStorageFiles({
            filePath: botSettingsFolder + paiNET.setModuleName() + '.json'
        });
        
        paiBOT.config.storage = new PAIModuleConfigStorageFiles({
            filePath: botSettingsFolder + 'config.json'
        });
        
        modulesLoaded = true;
    }
}


module.exports = {
    modules,
    load: loadModulesConfig
};
