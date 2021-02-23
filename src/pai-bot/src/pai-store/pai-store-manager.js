const fs = require('fs');
const path = require('path');
const pai_bot_settings = require("../utils/pai-bot-settings").get_instance();
const axios = require('axios');
const PAIStore = require('./pai-store');
const basic_repo = require('./pai-store-basic-repo.json');


let pai_store_manager_instance = null;

class PAIStoreManager {

    /**
     * @constructor
     */
    constructor() {
        let ps = new PAIStore();
        ps.load(basic_repo);
        this.stores = [
            {
                name: "base-local-pai-store",
                store: ps
            }
        ];
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
                this.stores.push({
                    name: ps["pai-store-name"],
                    store: ps_instance
                });
            });

        }
    }

    async add_store(pai_store) {
        if (pai_bot_settings.has_param('pai-stores')) {
            let pai_stores = pai_bot_settings.get_param('pai-stores');
            pai_stores.push(pai_store);
            await pai_bot_settings.set_param('pai-stores', pai_stores);

        } else {
            await pai_bot_settings.set_param('pai-stores', [pai_store]);
        }
        this.load();
    }

    async del_store(pai_store_name) {
        if (pai_bot_settings.has_param('pai-stores')) {
            let pai_stores = pai_bot_settings.get_param('pai-stores');
            pai_stores = pai_stores.filter((pai_store) => {
                return pai_store["pai-store-name"] !== pai_store_name;
            });
            await pai_bot_settings.set_param('pai-stores', pai_stores);
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
        let foundStore = this.stores.filter((store) => store["pai-store-name"] === pai_store_name);
        if (foundStore.length > 0) {
            foundStore[0].store.connect();
        }
    }

    async get_module(module_name, pai_store_name = null) {
        let KB = null;
        if (pai_store_name) {
            let foundStore = this.stores.filter((store) => store["pai-store-name"] === pai_store_name);
            if (foundStore.length < 1)
                throw 'pai-store not found!';
            KB = await foundStore[0].store.get_module(module_name);
            return KB;
        } else {
            await Promise.all(this.stores.map(async (ps) => {
                let found = await ps.store.get_module(module_name);
                if (found) {
                    KB = found;
                }
            }));
            return KB;
        }

    }


    async get_all_modules(pai_store_name = null) {
        if (pai_store_name) {
            let foundStore = this.stores.filter((store) => store["name"] === pai_store_name);
            if (foundStore.length < 1)
                throw 'pai-store not found!';
            return await foundStore[0].store.get_all_modules();
        } else {
            let modules = [];
            await Promise.all(this.stores.map(async (ps) => {
                let found = await ps.store.get_all_modules();
                if (found) {
                    modules.push(found);
                }
            }));
            return modules;
        }

    }


}


module.exports = PAIStoreManager;