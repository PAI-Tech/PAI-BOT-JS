const fs = require('fs');
const pai_code = process.argv.slice(2).join(' ');
const PAIBotOSUtils = require("./src/pai-bot/src/utils/pai-bot-os-utils");


const run = async () => {
    const queueFolder = await PAIBotOSUtils.getBotQueueFolder();
    console.log(pai_code);
    fs.writeFileSync(`${queueFolder}in.pai`, pai_code, 'utf8');
    console.log('Done');
};


run();


