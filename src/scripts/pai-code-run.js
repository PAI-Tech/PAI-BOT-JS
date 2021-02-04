const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');


const PAIBotOSUtils = require("../pai-bot/src/utils/pai-bot-os-utils");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



const run = async () => {
    const queueFolder = await PAIBotOSUtils.getBotQueueFolder();


    fs.readdir(queueFolder, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(queueFolder, file), err => {
                if (err) throw err;
            });
        }
    });


    let  pai_code = process.argv.slice(2).join(' ');



    //console.log(pai_code.length);
    if(pai_code.trim().length == 0)
    {
        inquirer.prompt([
            {
                type: 'input',
                name: 'PAI_CODE',
                message: 'Insert pai-code to run'
            }
        ]).then( answers => {

            if(answers.length === 0)
            {
                console.log('not pai-code to run');
                return;
            }

            write2Q(queueFolder,answers.PAI_CODE);
        });
    }
    else {
        write2Q(queueFolder,pai_code);
    }







};


async function write2Q(queueFolder,pai_code) {
    //console.log(pai_code);
    fs.writeFileSync(`${queueFolder}in.pai`, pai_code, 'utf8');
    //console.log('Done');
    let files = fs.readdirSync(queueFolder);
    while( files[0] == "in.pai") {

        await sleep(10);
        files = fs.readdirSync(queueFolder);
    }

    console.log(fs.readFileSync(queueFolder + files[0], 'utf-8'));


}



run();


