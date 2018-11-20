const { PAINETModule } = require('@pai-tech/pai-net');
const { PAI_OS } = require('@pai-tech/pai-os');
const PAIModuleConfigStorageFiles = require('../../../pai-module-config-storage-files/pai-module-config-storage-files');
const PAIFilesStorageDataSource = require('../../../pai-module-config-storage-files/pai-module-data-source-files');
const PAIBotModule = require('../../pcm-pai-bot');
const path = require('path');
const PAISchedulerModule = require('@pai-tech/pai-scheduler').Module;


const paiBOT = new PAIBotModule();
const paiOS = new PAI_OS();
const paiNET = new PAINETModule();
const paiScheduler = new PAISchedulerModule();

const modules = [
    paiOS,
    paiNET,
    paiBOT,
    paiScheduler
];

let modulesLoaded = false;


function setModuleConfigStorage(botSettingsFolder,module) {
    module.config.storage = new PAIModuleConfigStorageFiles({
        filePath: botSettingsFolder + module.setModuleName() + '.json'
    });
}

function setModuleDataSource(botDataFolder,module) {
    module.data.dataSource = new PAIFilesStorageDataSource({
        filePath: botDataFolder + module.setModuleName()
    });
}

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
        
        let botBaseFolder = `${paiOSFolder}${path.sep}Bot${path.sep}`;
        let botSettingsFolder = `${botBaseFolder}settings${path.sep}`;
        let botDataFolder = `${botBaseFolder}data${path.sep}`;
        
    
        for (let i = 0; i < modules.length; i++) {
            setModuleConfigStorage(botSettingsFolder, modules[i]);
            setModuleDataSource(botDataFolder,modules[i]);
        }
        
        modulesLoaded = true;
    }
}


module.exports = {
    modules,
    load: loadModulesConfig
};
