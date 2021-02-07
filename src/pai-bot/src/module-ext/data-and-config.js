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
const os_utils = require("./../utils/bot-os-utils");
const pai_bot_settings = require("./../utils/pai-bot-settings").get_instance();

/**
 *
 * @param {PAICodeModule} moduleInstance
 * @return {Promise<PAIModuleConfigStorageFiles>}
 */


async function getConfigFileStorage(moduleInstance) {
    let botSettingsFolder = os_utils.get_bot_settings_folder();

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

    let botDataFolder = os_utils.get_bot_folder("data");

    let storage = new PAIFilesStorageDataSource({
        filePath: botDataFolder + moduleInstance.setModuleName()
    });

    return storage;
}

/**
 *
 * @param {PAICodeModule} moduleInstance
 * @return {Promise<MongoDataSource>}
 */
async function getDataSourceMongo() {
    //const pai_bot_settings_file = JSON.parse(fs.readFileSync(await PAIBotOSUtils.getBotFolder() + "settings/pai-bot-settings.json"));

    if (pai_bot_settings.has_params(["mongo-url","mongo-port","mongo-user-name","mongo-pwd","mongo-schema"])) {
        const mongo = new MongoDataSource({
            URL: pai_bot_settings.all["mongo-url"],
            port: pai_bot_settings.all["mongo-port"],
            userName: pai_bot_settings.all["mongo-user-name"],
            password: pai_bot_settings.all["mongo-pwd"],
            dbName: pai_bot_settings.all["mongo-schema"]
        });

        await mongo.connect();

        return mongo;
    }

}


/**
 *
 * @param {PAICodeModule} moduleInstance
 * @return {Promise<void>}
 */
async function applyBotDataSource(moduleInstance) {
    //const pai_bot_settings_file = JSON.parse(fs.readFileSync(await PAIBotOSUtils.getBotFolder() + "settings/pai-bot-settings.json"));


    moduleInstance.config.storage = await getConfigFileStorage(moduleInstance);


    let dataSource = null;

    if (pai_bot_settings.has_param("data-source")) {
        let ds = pai_bot_settings.get_param("data-source");
        if(ds === "MONGO") {
            dataSource = await getDataSourceMongo();
        }
        else
            dataSource = await getDataSourceFile(moduleInstance);
    }
    else {
        pai_bot_settings.set_param("data-source","PAI-DDB")
        dataSource = await getDataSourceFile(moduleInstance);
    }





    moduleInstance.data.dataSource = dataSource;
}


module.exports = applyBotDataSource;

