/**
 PAI BOT OS Utils
 @description BOT Utilities for pai-os
 @class PAI_BOT_OS_UTILS
 @author Tamir Fridman
 Date Created : 01/02/2021
 @deprecated
 @copyright PAI-TECH 2018, all right reserved

 **/


//static private members

/**
 * @deprecated
 */
let _PAI_FOLDER = null;

function getPAIFolder(){
    if(!_PAI_FOLDER) {
        _PAI_FOLDER = (new PAI_OS()).getOSPath();
    }
    return _PAI_FOLDER;
}

/**
 * @deprecated
 * @return {string}
 */
async function getBotFolder()
{
    return `${getPAIFolder()}${path.sep}BOT_FOLDER_NAME${path.sep}`;
}


/**
 * @deprecated
 * @return {string}
 */
async function getBotSettingsFolder()
{
    return (await getBotFolder()) + `settings${path.sep}`;
}


/**
 * @deprecated
 * @return {string}
 */
async function getBotSettingsFile()
{
    return (await getBotSettingsFolder()) + 'settings.json';
}

/**
 * @deprecated
 * @return {string}
 */
async function getBotStartupFile()
{
    return (await getBotFolder()) + 'startup.pai';
}



/**
 * @deprecated
 * @return {string}
 */
async function getBotQueueFolder()
{
    return (await getBotFolder()) + 'queue' + path.sep;
}




module.exports = {
    getBotFolder,
    getBotSettingsFolder,
    getBotSettingsFile,
    getBotStartupFile,
    getBotQueueFolder
};


