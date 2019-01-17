
function createBotQuestions(organizations) {
	
	const createBotQuestions = [
		{
			type: "list",
			name: "RELOAD_EXISTING_BOT",
			message: "Do you want to register new bot or load an existing bot ? ",
			choices: ["CREATE NEW BOT", "LOAD EXISTING BOT"]
		},
		{
			type: "input",
			name: "BOT_NICKNAME",
			message: "Choose Bot nickname",
			when: (val) => {
				return val.RELOAD_EXISTING_BOT === "CREATE NEW BOT";
			}
		},
		{
			type: "list",
			name: "BOT_ORGANIZATION",
			message: "Select organization:",
			choices: organizations
		}
	];
	
	return createBotQuestions;
}

module.exports = createBotQuestions;
