const {
    PAICode,
    PAICodeCommand,
    PAICodeCommandContext,
    PAILogger,
    PAIModuleConfig,
    PAICodeModule
} = require('@pai-tech/pai-code');
const fs = require('fs');
const path = require('path');
const PAIModuleConfigStorageFiles = require('../../../modules-ext/modules-config-storage/pai-module-config-storage-files');
const PAIFilesStorageDataSource = require('../../../modules-ext/modules-data-sources/pai-module-data-source-files');
const MongoDataSource = require('../../../modules-ext/modules-data-sources/mongodb/pai-module-data-source-mongodb');
const PAIBotOSUtils = require("./../utils/pai-bot-os-utils");


/**
 *
 * @param {PAICodeModule} moduleInstance
 * @return {Promise<PAIModuleConfigStorageFiles>}
 */


async function getConfigFileStorage(moduleInstance) {
    const botFolder = await PAIBotOSUtils.getBotFolder();
    let botSettingsFolder = `${botFolder}settings${path.sep}`;

    let storage = new PAIModuleConfigStorageFiles({
        filePath: botSettingsFolder + moduleInstance.setModuleName() + '.json'
    });

    return storage;
}


/**
 *
 * @param {PAICodeModule} moduleInstance
 * @return {Promise<PAIFilesStorageDataSource>}
 */
async function getDataSourceFile(moduleInstance) {
    const botFolder = await PAIBotOSUtils.getBotFolder();
    let botDataFolder = `${botFolder}data${path.sep}`;

    let storage = new PAIFilesStorageDataSource({
        filePath: botDataFolder + moduleInstance.setModuleName()
    });

    return storage;
}

/**
 *
 * @param {PAICodeModule} moduleInstance
 * @return {Promise<PAIFilesStorageDataSource>}
 */
async function getDataSourceMongo() {
    const pai_bot_settings_file = JSON.parse(fs.readFileSync(await PAIBotOSUtils.getBotFolder() + "settings/pai-bot-settings.json"));


    if (!pai_bot_settings_file.DATA_SOURCE_MONGO_URL)
        PAILogger.error("Missing Data Source Mongo Configuration: DATA_SOURCE_MONGO_URL");

    if (!pai_bot_settings_file.DATA_SOURCE_MONGO_PORT)
        PAILogger.error("Missing Data Source Mongo Configuration: DATA_SOURCE_MONGO_PORT");

    if (!pai_bot_settings_file.DATA_SOURCE_MONGO_USER_NAME)
        PAILogger.error("Missing Data Source Mongo Configuration: DATA_SOURCE_MONGO_USER_NAME");

    if (!pai_bot_settings_file.DATA_SOURCE_MONGO_PASSWORD)
        PAILogger.error("Missing Data Source Mongo Configuration: DATA_SOURCE_MONGO_PASSWORD");

    if (!pai_bot_settings_file.DATA_SOURCE_MONGO_DATABASE_NAME)
        PAILogger.error("Missing Data Source Mongo Configuration: DATA_SOURCE_MONGO_DATABASE_NAME");

    const mongo = new MongoDataSource({
        URL: pai_bot_settings_file.DATA_SOURCE_MONGO_URL,
        port: pai_bot_settings_file.DATA_SOURCE_MONGO_PORT,
        userName: pai_bot_settings_file.DATA_SOURCE_MONGO_USER_NAME,
        password: pai_bot_settings_file.DATA_SOURCE_MONGO_PASSWORD,
        dbName: pai_bot_settings_file.DATA_SOURCE_MONGO_DATABASE_NAME
    });

    await mongo.connect();

    return mongo;
}


/**
 *
 * @param {PAICodeModule} moduleInstance
 * @return {Promise<void>}
 */
async function applyBotDataSource(moduleInstance) {
    const pai_bot_settings_file = JSON.parse(fs.readFileSync(await PAIBotOSUtils.getBotFolder() + "settings/pai-bot-settings.json"));


    moduleInstance.config.storage = await getConfigFileStorage(moduleInstance);


    let dataSource = null;
    if (pai_bot_settings_file.DATA_SOURCE === "MONGO")
        dataSource = await getDataSourceMongo();
    else
        dataSource = await getDataSourceFile(moduleInstance);

    moduleInstance.data.dataSource = dataSource;
}


module.exports = applyBotDataSource;

