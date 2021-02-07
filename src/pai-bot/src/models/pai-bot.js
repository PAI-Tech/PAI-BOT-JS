const PAIBotStatus = require('./pai-bot-status');

let pai_bot_instance = null;

class PAI_BOT {


    constructor() {
        this.id = null;
        this.nickname = null;
        this.status = null;
        this.createdAt = null;
    }

    static get get_instance() {
        if (!pai_bot_instance) {
            pai_bot_instance = new PAI_BOT();
        }
        return pai_bot_instance;
    }



}


module.exports = PAI_BOT;