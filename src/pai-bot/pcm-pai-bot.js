const { PAICodeCommand, PAICodeModule } = require('@pai-tech/pai-code');
const npm = require('npm');

class PCM_PAI_BOT extends PAICodeModule
{	
    constructor()
    {
        
        let infoText = `
welcome to pai-bot:
        
functions:
    1. show-name
        `;
        
        super(infoText);
    }
    
    /**
     * load basic module commands from super
     * and load all the functions for this module
     */
    load()
    {
        super.load(this);
        this.load_method_with_command("show-name",'show_name');
        this.load_method_with_command("learn",'learn');
        
    }
    
    
    setModuleName() {
        return 'pai-bot';
    }
    
    /**
     *
     * @param {PAICodeCommand} cmd
     */
    show_name(cmd)
    {
        return new Promise( (resolve,reject) => {
            let name = 'temp name';
            resolve(name);
        });
    }
    
    /**
     *
     * @param {PAICodeCommand} cmd
     */
    learn(cmd) {
        return new Promise((resolve, reject) => {
            let rest = "";
            
            
            npm.load(null, function (er) {
                if (er) return handlError(er);
                npm.commands.install(['supports-color'], function (er, data) {
                    if (er) return commandFailed(er)
                    // command succeeded, and data might have some info
                });
                npm.registry.log.on('log', function (message) {
                    console.log(message);
                })
            });
            
            resolve(res);
        });
        
    }
   
    
}

module.exports = PCM_PAI_BOT;