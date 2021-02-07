/**
 PAI BOT O/S Utils
 @description BOT Utilities for pai-os
 @class BOT_OS_UTILS
 @author Tamir Fridman
 Date Created : 01/02/2021
 @copyright PAI-TECH 2018, all right reserved

 **/

const pai_os = require('@pai-tech/pai-os').PAI_OS;
const path = require('path');
const fs = require('fs');

const Bot_Folder_Name = "Bot";


const Bot_Folders = {
    "settings" : "bot settings folder",
    "queue" : "bot queue folder for incoming pai-code files",
    "data" : "bot data folder (for entities and pai-ddb data)",
    "storage" : "bot storage folder",
    "log" : "bot log folder",
    "ssl" : "SSL files",
}

//static private members
let _pai_folder;


class PAI_BOT_OS_UTILS {


    static get_pai_folder() {
        if(!_pai_folder) {
            _pai_folder = (new pai_os()).getOSPath();
        }
        return _pai_folder;
    }


    /**
     * @static Returns the installation folder of the bot
     * @param folder - specific bot folder from BOT_FOLDERS list
     * @static
     * @return {string}
     */
    static get_bot_folder(folder = null)
    {
        let bf = PAI_BOT_OS_UTILS.get_pai_folder() + path.sep + Bot_Folder_Name + path.sep;
        if(folder && Bot_Folders.hasOwnProperty(folder)) {
            bf = bf + folder + path.sep;
        }
        return bf;
    }

    /**
     * Returns the settings folder of the bot
     * @static
     * @return {string}
     */
    static get_bot_settings_folder() {
        return PAI_BOT_OS_UTILS.get_bot_folder("settings");
    }

    static get_bot_queue_folder() {
        return PAI_BOT_OS_UTILS.get_bot_folder("queue");
    }


    static check_folder(folder,folder_name) {
        if (!fs.existsSync(folder)) {
            console.log("Creating "+ folder_name +" folder ");
            fs.mkdirSync(folder);
        }
    }

    static check_bot_folders()
    {
        //create PAI O/S Folder
        PAI_BOT_OS_UTILS.check_folder(PAI_BOT_OS_UTILS.get_pai_folder(),"PAI");
        PAI_BOT_OS_UTILS.check_folder(PAI_BOT_OS_UTILS.get_bot_folder(),"Bot");
        let bf_keys = Object.keys(Bot_Folders);
        bf_keys.forEach(folder => PAI_BOT_OS_UTILS.check_folder(PAI_BOT_OS_UTILS.get_bot_folder(folder),folder));
        console.log("Bot folders OK");
    }

}

module.exports = PAI_BOT_OS_UTILS;


