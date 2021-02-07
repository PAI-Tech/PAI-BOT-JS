/**
 PAI BOT Settings
 @description This object stores the bot global settings
 @class PAI_BOT_SETTINGS
 @author Tamir Fridman
 Date Created : 01/02/2021
 @copyright PAI-TECH 2018, all right reserved

 **/


const os_utils = require("./bot-os-utils");
const pai_logger = require("@pai-tech/pai-code").PAILogger;
const path = require("path");
const fs = require('fs');


const PAI_BOT_SETTINGS_FILE = os_utils.get_bot_settings_folder() + "pai-bot-config.json";

let pai_bot_settings_instance = null;

class PAI_BOT_SETTINGS {

    /**
     * @constructor
     */
    constructor() {
        this.module_data = {};
    }

    /**
     * Singletone implementation
     * @static
     */
    static get_instance() {
        if (!pai_bot_settings_instance) {
            pai_bot_settings_instance = new PAI_BOT_SETTINGS();
        }
        return pai_bot_settings_instance;
    }

    /**
     * load settings file from storage.
     * @throws Exception
     */
    load() {
        if(fs.existsSync(PAI_BOT_SETTINGS_FILE))
        {
            let file_data = fs.readFileSync(PAI_BOT_SETTINGS_FILE);
            this.module_data = JSON.parse(file_data);
        }
        else
        {
            pai_logger.info("bot settings file not found")
        }
    }

    /**
     * saves the settings data to the settings file on the storage.
     */
    async save() {
        try {
            fs.writeFileSync(PAI_BOT_SETTINGS_FILE,JSON.stringify(this.module_data));
        } catch (pex)
        {
            pai_logger.error("unable to save bot settings file because " + pex + " !!!!");
        }
    }


    get all() {
        return this.module_data;
    }

    set_all(data) {
        this.module_data = data;
        this.save();
    }

    get_param(param_name) {
        return this.module_data[param_name];
    }

    has_param(param_name) {
        return this.module_data.hasOwnProperty(param_name);
    }

    has_params(params_array) {
        let rv_all = true;

        params_array.forEach(param => rv_all = rv_all && this.has_param(param));
        return rv_all;
    }


    set_param(param_name, param_value) {

        this.module_data[param_name] = param_value;
        this.save();
    }

}


module.exports = PAI_BOT_SETTINGS;
