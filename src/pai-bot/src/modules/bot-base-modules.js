const { PAINETModule } = require('@pai-tech/pai-net');
const { PAI_OS } = require('@pai-tech/pai-os');
const PAIModuleConfigStorageFiles = require('../../../pai-module-config-storage-files/pai-module-config-storage-files');
const PAIBotModule = require('../../pcm-pai-bot');
const path = require('path');
const PAISchedulerModule = require('@pai-tech/pai-scheduler').Module;
const PAIMonitorModule = require('@pai-tech/pai-monitor').Module;


const paiBOT = new PAIBotModule();
const paiOS = new PAI_OS();
const paiNET = new PAINETModule();
const paiScheduler = new PAISchedulerModule();
const paiMonitor = new PAIMonitorModule();

const modules = [
    paiOS,
    paiNET,
    paiBOT,
    paiScheduler,
    paiMonitor
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
        let paiOSFolder = await paiOS.getOSPath();
        
        if(!paiOSFolder)
            throw new Error('$PAI is not defined in server');
        
        let botSettingsFolder = `${paiOSFolder}${path.sep}Bot${path.sep}settings${path.sep}`;
        
        paiNET.config.storage = new PAIModuleConfigStorageFiles({
            filePath: botSettingsFolder + paiNET.setModuleName() + '.json'
        });
        
        paiBOT.config.storage = new PAIModuleConfigStorageFiles({
            filePath: botSettingsFolder + paiBOT.setModuleName() + '.json'
        });
    
        paiScheduler.config.storage = new PAIModuleConfigStorageFiles({
            filePath: botSettingsFolder + paiScheduler.setModuleName() + '.json'
        });
        
        paiMonitor.config.storage = new PAIModuleConfigStorageFiles({
            filePath: botSettingsFolder + paiMonitor.setModuleName() + '.json'
        });
        
        modulesLoaded = true;
    }
}


module.exports = {
    modules,
    load: loadModulesConfig
};
