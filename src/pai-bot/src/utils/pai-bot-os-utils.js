let _PAI_FOLDER = null;
const PAI_OS = require('@pai-tech/pai-os').PAI_OS;
const path = require('path');

async function getPAIFolder(){
    if(!_PAI_FOLDER)
    {
        _PAI_FOLDER = await (new PAI_OS()).getOSPath();
    }
    return _PAI_FOLDER;
}

/**
 *
 * @return {string}
 */
async function getBotFolder()
{
    return `${await getPAIFolder()}${path.sep}Bot${path.sep}`;
}


/**
 *
 * @return {string}
 */
async function getBotSettingsFolder()
{
    return (await getBotFolder()) + `settings${path.sep}`;
}


/**
 *
 * @return {string}
 */
async function getBotSettingsFile()
{
    return (await getBotSettingsFolder()) + 'settings.json';
}

/**
 *
 * @return {string}
 */
async function getBotStartupFile()
{
    return (await getBotFolder()) + 'startup.pai';
}



/**
 *
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