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
            op: "version",
            func:"version"
        }));
        
        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "learn",
            func:"learn",
            params: {
                "module": new PAIModuleCommandParamSchema("module","PAI Knowledge Base canonicalName to learn",true, "Module Canonical Name")
            }
        }));
    
        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "update-bot",
            func:"update_bot"
        }));
    
        this.loadCommandWithSchema(new PAIModuleCommandSchema({
            op: "update-modules",
            func:"update_modules"
        }));
    
        
        await this.loadExistingModules();
    }
    
    
    setModuleName() {
        return 'pai-bot';
    }
    
    
    version(){
        return require('./../../package').version;
    }
}


const learnExt = require('./src/module-ext/learn');
const updatesExt = require('./src/module-ext/updates');

learnExt(PCM_PAI_BOT);
updatesExt(PCM_PAI_BOT);

module.exports = PCM_PAI_BOT;