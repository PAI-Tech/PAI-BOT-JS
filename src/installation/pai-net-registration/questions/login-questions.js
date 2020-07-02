
const loginQuestions = [
	{
		type: "confirm",
		name: "SHOULD_REGISTER_BOT",
		message: "Your Bot is not connected to PAI-NET. Would you like to register your bot to PAI-NET ? ",
		default: true,
	},
	{
		type: "input",
		name: "PAI_NET_URL",
		message: "Please enter PAI-NET url: ",
		default: "https://developers.pai-net.org",
		when: (val) => {
			return val.SHOULD_REGISTER_BOT;
		}
	},
	{
		type: "input",
		name: "PAI_NET_USERNAME",
		message: "Please enter your PAI-NET username (email): ",
		when: (val) => {
			return val.SHOULD_REGISTER_BOT;
		}
	},
	{
		type: "password",
		name: "PAI_NET_PASSWORD",
		message: "Password: ",
		when: (val) => {
			return val.SHOULD_REGISTER_BOT;
		}
	}
];



module.exports = loginQuestions;