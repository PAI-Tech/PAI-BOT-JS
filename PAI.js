const {
    PAICode,
    PAILogger,
    PAICodeEvent,
    PAICodeCommand,
    PAICodeCommandContext,
    PAICodeModule
} = require('pai-code');


const PAIBotManager = require('./src/pai-bot/src/pai-bot-manager');


let paiCode = PAICode;


/**
 *
 * Load startup script
 *
 **/
// paiCode.start();


let manager = new PAIBotManager();
manager.createNewBot('Alpha');


if (0)
{
    
    let context = new PAICodeCommandContext('host','hardCoded');
    
    paiCode.executeString(`

pai-code info

`,context)
        .then((cmdArray)=>{
            return paiCode.executeString(`

        pai-code show version
        pai-code show face

    `);
        
        }).then((cmdArray) => {
        console.log('finished');
    })
        .catch(error => {
            logger.error(error);
        });
    
    //
    //
    // paiCode.executeString("pai-os run ls").then(results => {
    //     console.log(results[0].response.data);
    // });
    
    
}


