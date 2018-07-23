const {
    PAICode,
    PAILogger,
    PAICodeEvent,
    PAICodeCommand,
    PAICodeCommandContext,
    PAICodeModule
} = require('pai-code');


const PAIBotManager = require('./src/pai-bot/src/pai-bot-manager');
const readline = require('readline');



let manager = new PAIBotManager();

manager.loadBots().then(async (activeBots) => {
    
    if(!activeBots || activeBots.length == 0)
    {
        let botNickname = await askBotName();
        if(botNickname)
            return manager.createNewBot(botNickname);
        else
            throw new Error('No active bots!');
    }
}).then(() => {
    PAICode.start();
}).catch(e => {
    PAICode.stop();
    PAICode.log(e);
});


async function askBotName()
{
    let shouldCreateBot = await askQuestion('Cannot find PAIBot on your machine. do you want to create one ? ','yes');
    if(shouldCreateBot == 'yes')
    {
        let botName = await askQuestion('OK. Choose a nickname for your bot.');
        return botName;
    }
    return null;
}


function askQuestion(question, defaultValue)
{
    return new Promise((resolve,reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    
        let questionAndDefault = question + ((defaultValue) ? " (" + defaultValue + ") " : "");
        rl.question(questionAndDefault, (answer) => {
            rl.close();
            return resolve(answer);
        });
    
        if (defaultValue)
            rl.write(defaultValue);
    });
}




