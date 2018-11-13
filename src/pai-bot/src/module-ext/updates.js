const { PAICode, PAICodeCommand,PAICodeCommandContext,PAILogger, PAIModuleConfig } = require('@pai-tech/pai-code');
const path = require('path');
const PAIModuleConfigStorageFiles = require('./../../../pai-module-config-storage-files/pai-module-config-storage-files')
const { KnowledgeBase } = require('@pai-tech/pai-net-sdk');




module.exports = (module) => {
    
    /**
     *
     * @param {PAICodeCommand} cmd
     * @return {Promise<any>}
     */
    module.prototype.update_bot = function(cmd) {
        return new Promise(async (resolve, reject) => {
    
            resolve('Updating...');
    
            let appDir = path.dirname(require.main.filename);
            
            // TODO: git pull
            let response = await PAICode.executeString(`pai-os run command:"cd ${appDir} && git pull"`,cmd.context);
            
            // TODO: npm install
            response = await PAICode.executeString(`pai-os run command:"cd ${appDir} && npm install"`,cmd.context);
            
            // TODO: restart
            // response = await PAICode.executeString(`pai-os run command:"cd ${appDir} && npm install"`,cmd.context);
    
            if(cmd.context.sender)
                await PAICode.executeString(`pai-net send-message to:"${cmd.context.sender}" content:"Finished :)"`,cmd.context);
            
        });
        
    };
    
    
    /**
     *
     * @param {PAICodeCommand} cmd
     * @return {Promise<any>}
     */
    module.prototype.update_modules = function(cmd) {
        return new Promise(async (resolve, reject) => {
            resolve('Updating...');
    
            let appDir = path.dirname(require.main.filename);
            
            let response = await PAICode.executeString(`pai-os run command:"cd ${appDir} && npm update --no-save"`,cmd.context);
    
            if(cmd.context.sender) {
                await PAICode.executeString(`pai-net send-message to:"${cmd.context.sender}" content:"Finished :)"`,cmd.context);
            }
        });
        
    };
    
};


