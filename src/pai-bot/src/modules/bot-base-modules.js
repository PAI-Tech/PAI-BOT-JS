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
