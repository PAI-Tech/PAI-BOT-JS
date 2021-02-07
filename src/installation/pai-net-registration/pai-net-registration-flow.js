const {
    PAICode,
    PAILogger,
    PAICodeCommandContext
} = require("@pai-tech/pai-code");
const inquirer = require('inquirer');

const loginQuestions = require("./questions/login-questions");
const selectExistingBotQuestions = require("./questions/select-existing-bot-questions");
const createBotQuestions = require("./questions/create-bot-questions");

const context = new PAICodeCommandContext("sender", "gateway");


// flow variables
let userOrganizations = ["[-1] Personal"];
let userBots = [];
let verifiedUsername = "";
let verifiedPassword = "";


async function registerToPAINET() {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt(loginQuestions)
            .then(async answers => {

                if (answers.SHOULD_REGISTER_BOT) {
                    const paiNetURL = answers.PAI_NET_URL;
                    const username = answers.PAI_NET_USERNAME;
                    const password = answers.PAI_NET_PASSWORD;


                    const success = await loadUserWithCredentials(paiNetURL, username, password);

                    if (!success) {
                        // TODO: throw error and ask questions again
                    }


                    const Q = createBotQuestions(userOrganizations);
                    return inquirer.prompt(Q);
                }

            })
            .then(async answers => {

                if (!answers)
                    return;

                const organization = answers.BOT_ORGANIZATION;
                const organizationId = extractIDFromListAnswer(organization);

                if (answers.RELOAD_EXISTING_BOT === "LOAD EXISTING BOT") {
                    // select bots from list

                    let cmd = "";

                    if (organizationId && organizationId !== "-1") {
                        cmd = `pai-net get-organization-bots organization_id:"${organizationId}`;
                    } else {
                        cmd = `pai-net get-bots`;
                    }

                    const cmdArray = await PAICode.executeString(cmd, context);
                    const getBotsListCommand = cmdArray[0];

                    const allBots = getBotsListCommand.response.data.records;
                    const offlineBots = allBots.filter(bot => {

                        if (organizationId && organizationId !== "-1") {
                            if (!bot.organization)
                                return false;
                        }

                        return (!(bot.isMainBot || bot.isOnline));
                    });

                    const botsListForSelection = offlineBots.map(bot => {
                        return `[${bot._id}] ${bot.nickname}`;
                    });

                    const Q = selectExistingBotQuestions(botsListForSelection);
                    return inquirer.prompt(Q);
                } else {
                    const nickname = answers.BOT_NICKNAME;

                    const cmd = `pai-net create-bot nickname:"${nickname}" ` +
                        ((organizationId && organizationId !== "-1") ? `organization:"${organizationId}"` : "");

                    // // create bot
                    const cmdArray = await PAICode.executeString(cmd, context);
                    const createBotCommand = cmdArray[0];

                    const selectedBotId = createBotCommand.response.data._id;

                    const cmdLogin = `pai-net bot-login username:"${verifiedUsername}" password:"${verifiedPassword}" bot_id:"${selectedBotId}"`;
                    await PAICode.executeString(cmdLogin, context);


                    PAILogger.info("DONE !");
                }

            })
            .then(async answers => {

                if (!answers)
                    return;

                const selectedBot = answers.SELECTED_BOT;
                const selectedBotId = extractIDFromListAnswer(selectedBot);

                const cmd = `pai-net bot-login username:"${verifiedUsername}" password:"${verifiedPassword}" bot_id:"${selectedBotId}"`;
                await PAICode.executeString(cmd, context);
                let kbsArray = null;
                try {
                    kbsArray = await PAICode.executeString(`pai-net get-knowledge-base filters:"{}"`, context);
                    kbsArray = kbsArray[0].response.data.data.records.map((kb) => {
                        return kb.canonicalName;
                    });
                } catch (e) {
                    PAILogger.error("PAI-BOT (getPAIModuleFromKnowledgeBase):" + e);
                    reject(false);
                }


                resolve (true);
                // return await inquirer.prompt([
                //     {
                //         type: "confirm",
                //         name: "SHOULD_INSTALL_MODULE",
                //         message: "Would you like to install a module ? ",
                //         default: true,
                //     }
                //
                // ]).then(async (answers) => {
                //     if (answers.SHOULD_INSTALL_MODULE) {
                //         return await inquirer.prompt([
                //             {
                //                 type: "list",
                //                 name: "MODULE_TO_INSTALL",
                //                 message: "Choose Module",
                //                 choices: kbsArray,
                //             }
                //         ]).then(async (answers) => {
                //             let module = answers.MODULE_TO_INSTALL;
                //             PAILogger.info("Module chosen :" + module);
                //             PAILogger.info("Installing :" + module);
                //             try {
                //                 PAILogger.log(`pai-bot learn module:"${module}"`);
                //                 await PAICode.executeString(`pai-bot learn module:"${module}"`, context);
                //             } catch (e) {
                //                 PAILogger.error('error:' + e.message, e);
                //
                //             }
                //
                //             PAILogger.info("DONE !");
                //
                //
                //         }).catch((err) => {
                //             PAILogger.error('error:' + err.message, err);
                //         });
                //     } else {
                //         PAILogger.info("DONE !");
                //     }
                // })
                //     .catch((err) => {
                //         PAILogger.error('error:' + err.message, err);
                //     });


            })
            .catch(err => {
                PAILogger.error('error:' + err.message, err);
                reject(false)
            });
    });

}


function extractIDFromListAnswer(answer) {
    if (answer)
        return answer.substr(answer.trim().indexOf("[") + 1, answer.indexOf("]") - 1);
    return null;
}


async function loadUserWithCredentials(paiNetURL, username, password) {
    let cmdArray = await PAICode.executeString(`
					pai-net config param_name:"base_url" param_value:"${paiNetURL}"
					pai-net login username:"${username}" password:"${password}"
					pai-net get-user
					pai-net get-organizations
					pai-net get-bots
					`, context);

    const loginCommand = cmdArray[1];
    const userCommand = cmdArray[2];
    const organizationCommand = cmdArray[3];
    const botsCommand = cmdArray[4];

    if (loginCommand.response.success && loginCommand.response.data === true && userCommand.response.success && userCommand.response.data) {

        PAILogger.info("login success");

        userOrganizations = [
            ...userOrganizations,
            ...(organizationCommand.response.data.records.map(organization => {
                return `[${organization._id}] ${organization.name}`;
            }))
        ];


        userBots = botsCommand.response.data.records;

        verifiedUsername = username;
        verifiedPassword = password;

        return true;
    } else {
        PAILogger.error("login failed");
        return false;
    }

}


module.exports = registerToPAINET;