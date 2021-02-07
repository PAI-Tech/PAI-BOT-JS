const {PAILogger,PAIUtils} = require("@pai-tech/pai-code");
//BOTS 2.0
const os_utils = require("../pai-bot/src/utils/bot-os-utils");
const pai_bot_settings = require("../pai-bot/src/utils/pai-bot-settings").get_instance();
const os = require("os");
const inquirer = require('inquirer');

run_bot_script();


function run_bot_script() {

    //inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));

    os_utils.check_bot_folders();


    const questions = [
        {
            type: "input",
            name: "pai-bot-name",
            message: "How do you like to call the bot ? ",
            default: "PB1",
        },
        {
            type: "checkbox",
            name: "connectors",
            message: "Which Connectors To Use?",
            choices: [
                'HTTP',
                'FILES'
            ]
        },
        {
            type: "input",
            name: "http-port",
            message: "please specify http port for the bot HTTP connector",
            default: 3141,
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
                return val.connectors =="HTTP" ;
            }
        },
        {
            type: "confirm",
            name: "ssl",
            message: "Do you want to secure the bot HTTP interface with SSL (HTTPS)? ",
            default: false,
            when: (val) => {
                return val.connectors =="HTTP";
            }
        },
        {
            type: "input",
            name: "ssl-pk-path",
            message: "SSL Private Key file Path (.pem file)",
            suggestOnly: false,
            rootPath: "/",
            validate: (val) => {
                return true;
            },
            when: (val) => {
                return val.ssl;
            }
        },
        {
            type: "input",
            name: "ssl-cert-path",
            message: "SSL Certificate file Path (.pem file)",
            suggestOnly: false,
            rootPath: 'ssl',
            when: (val) => {
                return val.ssl;
            }
        },
        {
            type: "input",
            name: "ssl-chain-path",
            message: "SSL Chain file Path (.pem file)",
            suggestOnly: false,
            rootPath: 'ssl',
            when: (val) => {
                return val.ssl;
            }
        },

        {
            type: "list",
            name: "data-source",
            message: "Choose Bot Data Source:",
            default: "FILES",
            choices: ["PAI-DDB", "MONGO"]
        },
        {
            type: "input",
            name: "mongo-url",
            message: "Mongo DB URL",
            validate: (val) => {

                // TODO: validate ip / url

                return true;
            },
            when: (val) => {
                return val["data-source"] === "MONGO";
            }
        },
        {
            type: "input",
            name: "mongo-port",
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
                return val["data-source"]  === "MONGO";
            }
        },
        {
            type: "input",
            name: "mongo-user-name",
            message: "Mongo DB Username",
            when: (val) => {
                return val["data-source"]  === "MONGO";
            }

        },
        {
            type: "password",
            name: "mongo-pwd",
            message: "Mongo DB password",
            when: (val) => {
                return val["data-source"]  === "MONGO";
            }
        },
        {
            type: "input",
            name: "mongo-schema",
            message: "Mongo Data Base schema name",
            when: (val) => {
                return val["data-source"]  === "MONGO";
            }
        }
    ];


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

            let pbs = {
                "pai-bot-name":answers["bot-name"],
                "pai-bot-id" : PAIUtils.pai_guid(),
                "connectors" : [],
                "data-source": {
                    "type":"PAI-DDB",
                    "db-data": {
                        "db-host-name" : "",
                        "db-user-name": "",
                        "db-pwd" : "",
                        "db-schema" : ""
                    }
                }
            }

            if(answers.hasOwnProperty("connectors")) {
                answers.connectors.forEach( connector => {
                    if(connector === "HTTP") {
                        let con = {
                            "type" : "HTTP",
                            "port" : answers["http-port"]
                        }
                        if(answers.hasOwnProperty("ssl")) {
                            let ssl_con = {
                                "pk-file" : answers["ssl-pk-path"],
                                "cert-file": answers["ssl-cert-path"],
                                "chain-file": answers["ssl-chain-path"]
                            }
                            con.ssl = ssl_con;
                        }
                        pbs["connectors"].push(con);
                    }
                    else if(connector === "FILES") {
                        let con = {
                            "name":"FILES",
                            "queue-folder": "./PAI/Bot/queue/",
                            "incoming-file-name": "in.pai",
                            "outgoing-file-name": "out.pai",
                            "interval" : 500
                        }
                        pbs["connectors"].push(con);
                    }
                })
            }
            if(answers["data-source"] === "MONGO") {
                pbs["data-source"].type = answers["data-source"];
                pbs["data-source"]["db-data"] = {
                    "db-host-name" : answers["mongo-url"],
                    "db-user-name": answers["mongo-user-name"],
                    "db-pwd" : answers["mongo-pwd"],
                    "db-schema" : answers["mongo-schema"]
                };
            }



            pai_bot_settings.set_all(pbs);


        }).catch(err => {
        PAILogger.error('error:' + err.message, err);
    });
}

