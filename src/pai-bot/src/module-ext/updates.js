const { PAICode, PAICodeCommand, PAILogger } = require('@pai-tech/pai-code');
const path = require('path');

module.exports = (module) => {
    
    /**
     *
     * @param {PAICodeCommand} cmd
     * @return {Promise<any>}
     */
    module.prototype.update_bot = function(cmd) {
        return new Promise(async (resolve, reject) => {
    
            if(cmd.context.sender)
                await PAICode.executeString(`pai-net send-message to:"${cmd.context.sender}" content:"Updating..."`,cmd.context).catch(err => {
                    PAILogger.error(err);
                });
            
            let rejected = false;
    
            let appDir = path.dirname(require.main.filename);
            
            let response = await PAICode.executeString(`pai-os run command:"cd ${appDir} && git reset --hard && git pull"`,cmd.context).catch(err => {
                PAILogger.error(err);
                rejected = true;
                reject(err);
            });
            
            if(rejected)
                return;
            
            response = await PAICode.executeString(`pai-os run command:"cd ${appDir} && npm install"`,cmd.context).catch(err => {
                PAILogger.error(err);
                rejected = true;
                reject(err);
            });
    
            if(rejected)
                return;
    
            // TODO: restart
            // response = await PAICode.executeString(`pai-os run command:"cd ${appDir} && npm install"`,cmd.context);
    
            resolve('Finished - to apply changes please restart the Bot');
            
        });
        
    };
    
    
    /**
     *
     * @param {PAICodeCommand} cmd
     * @return {Promise<any>}
     */
    module.prototype.update_modules = function(cmd) {
        return new Promise(async (resolve, reject) => {
            if(cmd.context.sender) {
                await PAICode.executeString(`pai-net send-message to:"${cmd.context.sender}" content:"Updating..."`,cmd.context).catch(err => {
                    PAILogger.error(err);
                });
            }
    
            let appDir = path.dirname(require.main.filename);
            
            let response = await PAICode.executeString(`pai-os run command:"cd ${appDir} && npm update --no-save"`,cmd.context).catch(err => {
                PAILogger.error(err);
                reject(err);
            });;
    
            resolve('Finished - to apply changes please restart the Bot');
        });
        
    };
    
};


