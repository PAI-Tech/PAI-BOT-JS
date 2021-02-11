


class PAIStore {

    constructor() {
        this.id = null;
        this.name = null;
        this.description = "";
        this.type = "",  //data / remote-kb
        this.url = null;
        this.access_token = null;
        this.connected= false;
        this.loaded = false;
    }


    // coonect to remote store (auth if needed)
    connect() {

    }


    load(store_data) {
        this.name = store_data["pai-store-name"];
        this.description = store_data["pai-store-description"];
        this.type = store_data["pai-store-type"];
    }

    load_from_file(file_path) {

    }

    get_module(module_name) {

    }

    get_all_modules() {

    }

}