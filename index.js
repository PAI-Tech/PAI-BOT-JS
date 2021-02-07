const PAIBotModule = require('./src/pai-bot/pcm-pai-bot');
const PAIBotManager = require('./src/pai-bot/src/pai-bot');
//const PAIBot = require('./src/pai-bot/src/models/pai-bot');
const PAIBotStatus = require('./src/pai-bot/src/models/pai-bot-status');


module.exports = {
    PAIBotModule,
    PAIBotManager,
//    PAIBot,
    PAIBotStatus
};