const {PAILogger} = require("@pai-tech/pai-code");
const fs = require('fs');
const path = require('path');
const os = require("os");


let pai_root_folder = (os.platform == "win32") ? ".\\PAI\\" : "./PAI/";
const pai_bot_folder = pai_root_folder + "Bot";
const pai_bot_settings = pai_root_folder + "Bot/settings";
check_pai_os_folders();

let pai_bot_settings_file=pai_bot_settings+'/pai-bot-settings.json';





const inquirer = require('inquirer');
inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));


function check_pai_os_folders() {

    console.log("Checking PAI folders ");

    //create PAI O/S Folder
    if (!fs.existsSync(pai_root_folder)) {
        console.log("Creating PAI O/S folder " + pai_root_folder);
        fs.mkdirSync(pai_root_folder);
    }


    if (!fs.existsSync(pai_bot_folder)) {
        console.log("Creating PAI-BOT folder " + pai_bot_folder);
        fs.mkdirSync(pai_bot_folder);
    }
    if (!fs.existsSync(pai_bot_settings)) {
        console.log("Creating PAI-BOT folder " + pai_bot_settings);
        fs.mkdirSync(pai_bot_settings);
    }
}



const questions = [
    {
        type: "input",
        name: "HTTP_PORT",
        message: "What port do you want to listen to ? ",
        default: 3141,
        validate: (val) => {
            const portIsValid = validatePort(val);

            if (!portIsValid) {
                PAILogger.error(`
                invalid port
                `);
            }


            return portIsValid;
        }
    },
    {
        type: "confirm",
        name: "_activate_ssl",
        message: "Do you want to activate SSL ? ",
        default: true
    },
    {
        type: "fuzzypath",
        name: "HTTPS_PRIVATE_KEY_PATH",
        message: "SSL Private Key file Path (.pem file)",
        suggestOnly: false,
        rootPath: 'ssl',
        validate: (val) => {
            return true;
        },
        when: (val) => {
            return val._activate_ssl;
        }
    },
    {
        type: "fuzzypath",
        name: "HTTPS_CERTIFICATE_PATH",
        message: "SSL Certificate file Path (.pem file)",
        suggestOnly: false,
        rootPath: 'ssl',
        when: (val) => {
            return val._activate_ssl;
        }
    },
    {
        type: "fuzzypath",
        name: "HTTPS_CHAIN_PATH",
        message: "SSL Chain file Path (.pem file)",
        suggestOnly: false,
        rootPath: 'ssl',
        when: (val) => {
            return val._activate_ssl;
        }
    },
    {
        type: "checkbox",
        name: "PAI_CONNECTORS",
        message: "Which Connectors To Use?",
        choices: [
            'HTTP',
            'FILES'
        ]
    },
    {
        type: "list",
        name: "DATA_SOURCE",
        message: "Choose Bot Data Source:",
        default: "FILES",
        choices: ["PAI-DDB", "MONGO"]
    },
    {
        type: "input",
        name: "DATA_SOURCE_MONGO_URL",
        message: "Mongo DB URL",
        validate: (val) => {

            // TODO: validate ip / url

            return true;
        },
        when: (val) => {
            return val.DATA_SOURCE === "MONGO";
        }
    },
    {
        type: "input",
        name: "DATA_SOURCE_MONGO_PORT",
        message: "Mongo DB Port",
        default: "27017",
        validate: (val) => {
            const portIsValid = validatePort(val);

            if (!portIsValid) {
                PAILogger.error(`
                invalid port
                `);
            }

            return portIsValid;
        },
        when: (val) => {
            return val.DATA_SOURCE === "MONGO";
        }
    },
    {
        type: "input",
        name: "DATA_SOURCE_MONGO_USER_NAME",
        message: "Mongo DB Username",
        when: (val) => {
            return val.DATA_SOURCE === "MONGO";
        }

    },
    {
        type: "password",
        name: "DATA_SOURCE_MONGO_PASSWORD",
        message: "Mongo DB password",
        when: (val) => {
            return val.DATA_SOURCE === "MONGO";
        }
    },
    {
        type: "input",
        name: "DATA_SOURCE_MONGO_DATABASE_NAME",
        message: "Mongo Data Base schema name",
        when: (val) => {
            return val.DATA_SOURCE === "MONGO";
        }
    }
];



function writeToSettings(data) {
    if(fs.existsSync(pai_bot_settings_file)){

    }
    fs.writeFileSync(pai_bot_settings_file, JSON.stringify(data));

}


function validatePort(val) {
    if (isNaN(val))
        return false;

    const numberPort = parseInt(val);

    return (numberPort < 65535 && numberPort > 0);
}


inquirer
    .prompt(questions)
    .then(answers => {
        for (const key in answers) {
            if (key.indexOf('_') === 0) {
                delete answers[key];
            }
        }

        if (answers.length === 0) {
            PAILogger.info('Nothing to update');
            return;
        }


        writeToSettings(answers);

        PAILogger.info('Configuration file created (pai-bot-settings.json)');

    }).catch(err => {
    PAILogger.error('error:' + err.message, err);
});
