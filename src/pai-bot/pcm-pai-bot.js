const { PAICodeCommand, PAICodeModule } = require('pai-code');

class PCM_PAI_STORAGE extends PAICodeModule
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
        
    }
    
    /**
     *
     * @param {PAICodeCommand} cmd
     */
    show_name(cmd)
    {
        return new Promise( (resolve,reject) => {
            let name = 'temp name';
            console.log(name);
            resolve(name);
        });
    }
    
   
    
}

module.exports = PCM_PAI_STORAGE;