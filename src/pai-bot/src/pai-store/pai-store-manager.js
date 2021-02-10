const fs = require('fs');
const path = require('path');
const pai_bot_settings = require("../utils/pai-bot-settings").get_instance();
const axios = require('axios');


let pai_store_manager_instance = null;

class PAIStoreManager {

    /**
     * @constructor
     */
    constructor() {
        this.stores = {};
    }

    /**
     * Singletone implementation
     * @static
     */
    static get_instance() {
        if (!pai_store_manager_instance) {
            pai_store_manager_instance = new PAIStoreManager();
        }
        return pai_store_manager_instance;
    }

    add_store(pai_store) {
        if (pai_bot_settings.has_param('pai-stores')) {
            let pai_stores = pai_bot_settings.get_param('pai-stores');
            pai_stores.push(pai_store);
            pai_bot_settings.set_param('pai-stores', pai_stores);

        } else {
            pai_bot_settings.set_param('pai-stores', [pai_store]);
        }
    }

    del_store(pai_store_name) {
        if (pai_bot_settings.has_param('pai-stores')) {
            let pai_stores = pai_bot_settings.get_param('pai-stores');
            pai_stores = pai_stores.filter((pai_store) => {
                return pai_store.name !== pai_store_name;
            });
            pai_bot_settings.set_param('pai-stores', pai_stores);

        }

    }

    get_stores() {
        if (pai_bot_settings.has_param('pai-stores')) {
            return pai_bot_settings.get_param('pai-stores');
        } else {
            return [];
        }

    }

    connect(pai_store_name) {

    }

    async get_module(module_name, pai_store_name = null) {

        //Search in basic repo

        let basic_repo = JSON.parse(fs.readFileSync('./pai-store-basic-repo.json'));
        let foundModule;
        foundModule = basic_repo.filter((kb) => {
            return kb.canonicalName === module_name;
        });

        if (foundModule.length > 1) {
            return foundModule[0];
        }

// search in pai-store
        if (pai_store_name && pai_bot_settings.has_param('pai-stores')) {
            let found_pai_store = pai_bot_settings.get_param('pai-stores').filter((ps) => {
                return ps.name === pai_store_name;
            });

            if (found_pai_store.length < 1)
                return null;

            foundModule = await axios.get(found_pai_store[0].url+'/knowledgebases', {
                params: {
                    filters: {canonicalName: module_name}
                }
            });

            if (foundModule.data.records.length < 1)
                return null;

            return foundModule.data.records[0];
        }

        return null;

    }


}


module.exports = PAIStoreManager;