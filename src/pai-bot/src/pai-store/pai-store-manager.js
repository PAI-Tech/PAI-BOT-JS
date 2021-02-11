const fs = require('fs');
const path = require('path');
const pai_bot_settings = require("../utils/pai-bot-settings").get_instance();
const axios = require('axios');
const PAIStore = require('./pai-store');


let pai_store_manager_instance = null;

class PAIStoreManager {

    /**
     * @constructor
     */
    constructor() {
        let ps = new PAIStore();
        ps.load(JSON.parse(fs.readFileSync('./pai-store-basic-repo.json')));
        this.stores = {
            "base-local-pai-store": ps
        };
        this.load();
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


    load() {
        if (pai_bot_settings.has_param('pai-stores')) {
            let pai_stores = pai_bot_settings.get_param('pai-stores');
            pai_stores.forEach((ps) => {
                let ps_instance = new PAIStore();
                ps_instance.load(ps);
                this.stores[ps["pai-store-name"]] = ps_instance;
            });

        }
    }

    add_store(pai_store) {
        if (pai_bot_settings.has_param('pai-stores')) {
            let pai_stores = pai_bot_settings.get_param('pai-stores');
            pai_stores.push(pai_store);
            pai_bot_settings.set_param('pai-stores', pai_stores);

        } else {
            pai_bot_settings.set_param('pai-stores', [pai_store]);
        }
        this.load();
    }

    del_store(pai_store_name) {
        if (pai_bot_settings.has_param('pai-stores')) {
            let pai_stores = pai_bot_settings.get_param('pai-stores');
            pai_stores = pai_stores.filter((pai_store) => {
                return pai_store.name !== pai_store_name;
            });
            pai_bot_settings.set_param('pai-stores', pai_stores);
            this.load();

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
        if (this.stores.hasOwnProperty(pai_store_name)) {
            this.stores[pai_store_name].connect();
        }
    }

    async get_module(module_name, pai_store_name = null) {
        if (pai_store_name) {
            return await this.stores[pai_store_name].get_module(module_name);
        } else {
            let KB = null;
            await Promise.all(this.stores.map(async (ps) => {
                let found = await this.stores[ps].get_module(module_name);
                if (found) {
                    KB = found;
                }
            }));
            return KB;
        }

    }


}


module.exports = PAIStoreManager;