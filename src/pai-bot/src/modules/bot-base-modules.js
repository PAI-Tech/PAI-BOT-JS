const { PAINETModule } = require("@pai-tech/pai-net");
const { PAI_OS } = require("@pai-tech/pai-os");
const PAIBotModule = require("../../pcm-pai-bot");
const PAISchedulerModule = require("@pai-tech/pai-scheduler").Module;


const applyBotDataSource = require("./../module-ext/data-and-config");


const paiBOT = new PAIBotModule();
const paiOS = new PAI_OS();
const paiNET = new PAINETModule();
const paiScheduler = new PAISchedulerModule();

let modules = [
    paiOS,
    paiNET,
    paiBOT,
    paiScheduler
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
		for (let i = 0; i < modules.length; i++) {
			await applyBotDataSource(modules[i]);
        }
        
        modulesLoaded = true;
    }
}


module.exports = {
    modules,
    load: loadModulesConfig
};
