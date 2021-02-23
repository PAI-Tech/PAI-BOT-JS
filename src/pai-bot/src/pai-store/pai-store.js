const axios = require('axios');
const fs = require('fs');

class PAIStore {

    constructor() {
        this.id = null;
        this.name = null;
        this.description = "";
        this.type = ""; //data / remote-kb
        this.url = null;
        this.modules = null;
        this.access_token = null;
        this.connected = false;
        this.loaded = false;
    }


    // connect to remote store (auth if needed)
    connect() {

    }


    load(store_data) {
        this.name = store_data["pai-store-name"];
        this.description = store_data["pai-store-description"];
        this.type = store_data["pai-store-type"];

        //for local repos only!
        if (this.type === 'data') {
            this.modules = store_data["pai-code-modules"];
        } else {
            this.url = store_data["pai-store-url"];
        }
    }

    load_from_file(file_path) {

    }

    async get_module(module_name) {
        let foundModule;

        if (this.type === 'data') {
            foundModule = this.modules.filter((mod) => {
                return mod.canonicalName === module_name;
            });
            if (foundModule.length < 1) {
                return null;
            }

            return foundModule[0];
        }

        foundModule = await axios.get(this.url + `/knowledgebases?filters={canonicalName:${module_name}`);
        if (foundModule.data.records.length < 1)
            return null;

        return foundModule.data.records[0];
    }

    async get_all_modules() {
        if (this.type === 'data')
            return this.modules;

        let allModules = await axios.get(this.url + '/knowledgebases?filters={}');


        if (allModules.data.records.length < 1)
            return null;

        return allModules.data.records;
    }


}

module.exports = PAIStore;