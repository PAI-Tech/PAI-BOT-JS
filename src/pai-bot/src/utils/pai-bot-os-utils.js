const PAI_FOLDER = '/var/PAI/';
const PAIBot = require('../models/pai-bot');


/**
 *
 * @return {string}
 */
function getBotContainerFolder()
{
    return `${PAI_FOLDER}Bot/`;
}


/**
 *
 * @return {string}
 */
function getActiveBotsFilePath()
{
    return getBotContainerFolder() + 'active-bots.json';
}


/**
 *
 * @param {PAIBot} bot
 * @return {string}
 */
function getBotFolder(bot)
{
    return getBotContainerFolder() + bot.id + '/';
}


/**
 *
 * @param {PAIBot} bot
 * @return {string}
 */
function getBotSettingsFolder(bot)
{
    return getBotFolder(bot) + 'settings/';
}


/**
 *
 * @param {PAIBot} bot
 * @return {string}
 */
function getBotStartupFile(bot)
{
    return getBotFolder(bot) + 'startup.pai';
}



/**
 *
 * @param {PAIBot} bot
 * @return {string}
 */
function getBotQueueFolder(bot)
{
    return getBotFolder(bot) + 'queue/';
}


module.exports = {
    getBotContainerFolder,
    getActiveBotsFilePath,
    getBotFolder,
    getBotSettingsFolder,
    getBotStartupFile,
    getBotQueueFolder
};