const { PAICode, PAICodeCommand, PAILogger } = require('@pai-tech/pai-code');
const path = require('path');


function updateBot(cmd) {
	return new Promise(async (resolve, reject) => {
		
		if(cmd.context.sender)
			await PAICode.executeString(`pai-net send-message to:"${cmd.context.sender}" content:"Updating..."`,cmd.context).catch(err => {
				PAILogger.error(err);
			});
		
		let rejected = false;
		
		let appDir = path.dirname(require.main.filename);
		
		await PAICode.executeString(`pai-os run command:"cd ${appDir} && git reset --hard && git pull"`,cmd.context).catch(err => {
			PAILogger.error(err);
			rejected = true;
			reject(err);
		});
		
		if(rejected)
			return;
		
		await PAICode.executeString(`pai-os run command:"cd ${appDir} && npm run install:clean"`,cmd.context).catch(err => {
			PAILogger.error(err);
			rejected = true;
			reject(err);
		});
		
		if(rejected)
			return;
		
		resolve('Finished - to apply changes please restart the Bot');
		
	});
	
}


function updateModules(cmd) {
	return new Promise(async (resolve, reject) => {
		if(cmd.context.sender) {
			await PAICode.executeString(`pai-net send-message to:"${cmd.context.sender}" content:"Updating..."`,cmd.context).catch(err => {
				PAILogger.error(err);
			});
		}
		
		let appDir = path.dirname(require.main.filename);
		
		await PAICode.executeString(`pai-os run command:"cd ${appDir} && npm update --no-save"`,cmd.context).catch(err => {
			PAILogger.error(err);
			reject(err);
		});
		
		resolve('Finished - to apply changes please restart the Bot');
	});
	
}


module.exports = (module) => {
    
    /**
     *
     * @param {PAICodeCommand} cmd
     * @return {Promise<any>}
     */
    module.prototype.updateBot = updateBot;
    
    /**
     *
     * @param {PAICodeCommand} cmd
     * @return {Promise<any>}
     */
    module.prototype.updateModules = updateModules;
    
};


