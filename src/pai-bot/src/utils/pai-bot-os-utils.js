const PAI_FOLDER = '/var/PAI/';
const PAIBot = require('../models/pai-bot');

/**
 *
 * @return {string}
 */
function getBotFolder()
{
    return `${PAI_FOLDER}Bot/`;
}


/**
 *
 * @return {string}
 */
function getBotSettingsFolder()
{
    return getBotFolder() + 'settings/';
}


/**
 *
 * @return {string}
 */
function getBotSettingsFile()
{
    return getBotSettingsFolder() + 'settings.json';
}

/**
 *
 * @return {string}
 */
function getBotStartupFile()
{
    return getBotFolder() + 'startup.pai';
}



/**
 *
 * @return {string}
 */
function getBotQueueFolder()
{
    return getBotFolder() + 'queue/';
}


module.exports = {
    getBotFolder,
    getBotSettingsFolder,
    getBotSettingsFile,
    getBotStartupFile,
    getBotQueueFolder
};