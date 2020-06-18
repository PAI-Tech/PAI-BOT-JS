const {PAILogger} = require("@pai-tech/pai-code");
const fs = require('fs');
const path = require('path');
const os = require("os");

const CONFIG_FILE_PATH = "./config.env";

try{
	fs.readFileSync(CONFIG_FILE_PATH);
}
catch (e) {
	fs.writeFileSync(CONFIG_FILE_PATH,'');
	PAILogger.info('config file created -> config.env');
}


const configRes = require('./env-loader');

if (configRes.error) {
	throw configRes.error;
}

const config = configRes.parsed;

const inquirer = require('inquirer');
inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));

function check_pai_os_folders()
{

	let pai_root_folder = (os.platform == "win32") ? "C:\\PAI\\" : "/var/PAI/";
	const pai_bot_folder = pai_root_folder + "Bot";

    console.log("Checking PAI folders ");

	//create PAI O/S Folder
	if (!fs.existsSync(pai_root_folder)) {
		console.log("Creating PAI O/S folder " + pai_root_folder );
		fs.mkdirSync(pai_root_folder);
	}


	if (!fs.existsSync(  pai_bot_folder)) {
        console.log("Creating PAI-BOT folder " +   pai_bot_folder );
		fs.mkdirSync(  pai_bot_folder);
	}
}

check_pai_os_folders();

const questions = [
	{
		type: "input",
		name: "HTTP_PORT",
		message: "What port do you want to listen to ? ",
		default: 3141,
		validate: (val) => {
			const portIsValid = validatePort(val);

			if(!portIsValid)
			{
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
		default: true,
		when: (val) => {
			return !(config.hasOwnProperty('HTTPS_PRIVATE_KEY_PATH') &&
				config.hasOwnProperty('HTTPS_CERTIFICATE_PATH') &&
				config.hasOwnProperty('HTTPS_CHAIN_PATH'));
		}
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
		type: "list",
		name: "DATA_SOURCE",
		message: "Choose Bot Data Source:",
		default: "FILES",
		choices: [ "FILES" , "MONGO" ]
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

			if(!portIsValid)
			{
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

// clear filled params
const filteredQuestions = questions.filter(q => {
	if(q.name.indexOf('_') === 0) // check if is private
	{
		return true;
	}
	else
		return !config.hasOwnProperty(q.name);
});



function writeToConfig(key,value) {
	fs.appendFileSync('./config.env',
		`
${key}='${value}'
`);
}


function validatePort(val) {
	if(isNaN(val))
		return false;

	const numberPort = parseInt(val);

	return (numberPort < 65535 && numberPort > 0);
}





inquirer
	.prompt(filteredQuestions)
	.then(answers => {

		for (const key in answers) {
			if (key.indexOf('_') === 0) {
				delete answers[key];
			}
		}

		if(answers.length === 0)
		{
			PAILogger.info('Nothing to update');
			return;
		}


		for (const key in answers) {

			if (answers.hasOwnProperty(key)) {
				const value = answers[key];
				writeToConfig(key,value);
			}
		}

		PAILogger.info('Configuration file created (config.env)');

	}).catch(err => {
		PAILogger.error('error:' + err.message, err);
	});
