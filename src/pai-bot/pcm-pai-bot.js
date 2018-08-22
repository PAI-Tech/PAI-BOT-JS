const { PAICodeModule,PAIModuleConfigParam,PAIModuleCommandSchema,PAIModuleCommandParamSchema } = require('@pai-tech/pai-code');

const CONFIG_BOT_MODULES = "bot_modules";



class PCM_PAI_BOT extends PAICodeModule
{	
    constructor()
    {
        
        let infoText = `
welcome to pai-bot:
        
functions:
    1. show-name
    2. learn(module-name)
        `;
        
        super(infoText);
        
        this.config.schema = [
            new PAIModuleConfigParam('Modules list',"This list specify the modules that the Bot has learned",CONFIG_BOT_MODULES,"[]")
        ];
        
        
    }
    
    /**
     * load basic module commands from super
     * and load all the functions for this module
     */
    async load()
    {
        await super.load(this);
        
        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "learn",
            func:"learn",
            params: {
                "2": new PAIModuleCommandParamSchema("2","PAI Module name to learn",true)
            }
        }));
        
        await this.loadExistingModules();
    }
    
    
    setModuleName() {
        return 'pai-bot';
    }
    
}


const learnExt = require('./src/module-ext/learn');

learnExt(PCM_PAI_BOT);

module.exports = PCM_PAI_BOT;