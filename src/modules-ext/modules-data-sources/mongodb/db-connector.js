const mongoose = require("mongoose");

function connect({ URL, port, userName, password, dbName}) {
	
	// Connection URL
	const connectionUrl = `mongodb://${URL}:${port}`;
	
	let config = {
		useNewUrlParser: true,
		dbName:dbName,
		user: userName,
		pass:password
	};
	
	return mongoose.connect(connectionUrl, config);
}

module.exports = {mongoose, connect };
