const {PAILogger, PAIUtils} = require("@pai-tech/pai-code");
//BOTS 2.0
const os_utils = require("../pai-bot/src/utils/os-utils");
const pai_bot_settings = require("../pai-bot/src/utils/pai-bot-settings").get_instance();
const os = require("os");
const fs = require("fs");
const inquirer = require('inquirer');

run_bot_script().then((success) => {
    if (success) {
        PAILogger.info("Bot has bees configured");
    } else
        PAILogger.error("Bot failed to configure");
}).catch(e => {
    console.log("Bot failed to configure " + e); //in case no PAI-Logger
});


function validatePort(val) {
    if (isNaN(val))
        return false;

    const numberPort = parseInt(val);

    return (numberPort < 65535 && numberPort > 0);
}

async function run_bot_script() {

    await PAICode.on_ready();
    await os_utils.check_bot_folders();
    await ask_questions();
    return true;
}

async function ask_questions() {

    return new Promise((resolve, reject) => {

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
                default: "HTTP",
                choices: [
                    'HTTP',
                    'FILES',
                    'TCP'
                ]
            },
            {
                type: "input",
                name: "tcp-port",
                message: "please specify port for the bot TCP connector",
                default: 3000,
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
                    return val.connectors.includes("TCP");
                }
            },
            {
                type: "input",
                name: "tcp-password",
                message: "please specify password for the bot TCP connector",
                default: '1234',
                when: (val) => {
                    return val.connectors.includes("TCP");
                }
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
                    return val.connectors.includes("HTTP");
                }
            },
            {
                type: "confirm",
                name: "ssl",
                message: "Do you want to secure the bot HTTP interface with SSL (HTTPS)? ",
                default: false,
                when: (val) => {
                    return val.connectors.includes("HTTP");
                }
            },
            {
                type: "input",
                name: "ssl-pk-path",
                message: "SSL Private Key file Path (.pem file)",
                suggestOnly: false,
                rootPath: "/",
                validate: (val) => {
                    let v = fs.existsSync(val) && fs.statSync(val).isFile();
                    if (!v) {
                        PAILogger.error(`
                    file ${val} not found or not a file, please type again
                    `);
                    }
                    return v;
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
                validate: (val) => {
                    let v = fs.existsSync(val) && fs.statSync(val).isFile();
                    if (!v) {
                        PAILogger.error(`
                    file ${val} not found or not a file, please type again
                    `);
                    }
                    return v;
                },
                when: (val) => {
                    return val.ssl;
                }
            },
            {
                type: "input",
                name: "ssl-chain-path",
                message: "SSL Chain file Path (.pem file)",
                suggestOnly: false,
                validate: (val) => {
                    let v = fs.existsSync(val) && fs.statSync(val).isFile();
                    if (!v) {
                        PAILogger.error(`
                    file ${val} not found or not a file, please type again
                    `);
                    }
                    return v;
                },

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
                    return val["data-source"] === "MONGO";
                }
            },
            {
                type: "input",
                name: "mongo-user-name",
                message: "Mongo DB Username",
                when: (val) => {
                    return val["data-source"] === "MONGO";
                }

            },
            {
                type: "password",
                name: "mongo-pwd",
                message: "Mongo DB password",
                when: (val) => {
                    return val["data-source"] === "MONGO";
                }
            },
            {
                type: "input",
                name: "mongo-schema",
                message: "Mongo Data Base schema name",
                when: (val) => {
                    return val["data-source"] === "MONGO";
                }
            }
        ];
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
                    reject(false);
                }

                let pbs = {
                    "pai-bot-name": answers["bot-name"],
                    "pai-bot-id": PAIUtils.pai_guid(),
                    "connectors": [],
                    "data-source": {
                        "type": "PAI-DDB",
                        "db-data": {
                            "db-host-name": "",
                            "db-user-name": "",
                            "db-pwd": "",
                            "db-schema": ""
                        }
                    }
                };

                if (answers.hasOwnProperty("connectors")) {
                    answers.connectors.forEach(connector => {
                        if (connector === "HTTP") {
                            let con = {
                                "type": "HTTP",
                                "port": answers["http-port"]
                            };
                            if (answers.hasOwnProperty("ssl")) {
                                let ssl_con = {
                                    "pk-file": answers["ssl-pk-path"],
                                    "cert-file": answers["ssl-cert-path"],
                                    "chain-file": answers["ssl-chain-path"]
                                };
                                con.ssl = ssl_con;
                            }
                            pbs["connectors"].push(con);
                        } else if (connector === "FILES") {
                            let con = {
                                "name": "FILES",
                                "queue-folder": os_utils.get_bot_queue_folder(),
                                "incoming-file-name": "in.pai",
                                "outgoing-file-name": "out.pai",
                                "interval": 500
                            };
                            pbs["connectors"].push(con);
                        } else if (connector === "TCP") {
                            let con = {
                                "type": "TCP",
                                "port": answers["tcp-port"],
                                "password": answers["tcp-password"]
                            };
                            pbs["connectors"].push(con);
                        }
                    });
                }
                if (answers["data-source"] === "MONGO") {
                    pbs["data-source"].type = answers["data-source"];
                    pbs["data-source"]["db-data"] = {
                        "db-host-name": answers["mongo-url"],
                        "db-user-name": answers["mongo-user-name"],
                        "db-pwd": answers["mongo-pwd"],
                        "db-schema": answers["mongo-schema"]
                    };
                }


                pai_bot_settings.set_all(pbs);
                resolve(true);

            }).catch(err => {
            PAILogger.error('error:' + err.message, err);
            reject(false);
        });
    });

}

