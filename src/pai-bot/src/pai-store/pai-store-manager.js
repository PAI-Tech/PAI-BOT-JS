


let pai_store_manager_instance = null;

class PAIStoreManager {

    /**
     * @constructor
     */
    constructor() {
        this.stores = {}
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

    }

    del_store(pai_store_name) {

    }

    get_stores() {

    }

    connect(pai_store_name) {

    }

    get_module(pai_store_name,module_name) {

    }


}


module.exports = PAIStoreManager;