

function selectExistingBotQuestions(userBots) {
	
	const createBotQuestions = [
		{
			type: "list",
			name: "SELECTED_BOT",
			message: "Select Bot (Only offline bots are listed)",
			choices: userBots
		}
	];
	
	return createBotQuestions;
}


module.exports = selectExistingBotQuestions;