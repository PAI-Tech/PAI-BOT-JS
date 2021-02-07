/**
 * PAI-BOT JS
 * Author       : Ron Fridman
 * Date Created : 9/25/2019
 * Copyright PAI-TECH 2018, all right reserved

 * This file is the entry point of your base module.

 *      This program is free software; you can redistribute it and/or
 *		modify it under the terms of the GNU General Public License
 *		as published by the Free Software Foundation; either version
 *		3 of the License, or (at your option) any later version.
 */

const pai_logger = require("@pai-tech/pai-code").PAILogger;
const { PAINETModule } = require("@pai-tech/pai-net");
const { PAI_OS } = require("@pai-tech/pai-os");
const PAIBotModule = require("../../pcm-pai-bot");
const PAISchedulerModule = require("@pai-tech/pai-scheduler").Module;


const applyBotDataSource = require("./../module-ext/data-and-config");


const pai_bot = new PAIBotModule();
const pai_os = new PAI_OS();
const pai_net = new PAINETModule();
const pai_scheduler = new PAISchedulerModule();

let modules = [
    pai_os,
    pai_net,
    pai_bot,
    pai_scheduler
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
            pai_logger.info("loading bot base module " + modules[i].get_module_name())
			await applyBotDataSource(modules[i]);
        }
        
        modulesLoaded = true;
    }
}


module.exports = {
    modules,
    load: loadModulesConfig
};
