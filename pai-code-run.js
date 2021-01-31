const inquirer = require('inquirer');
const fs = require('fs');


inquirer.prompt([
    {
        type: 'input',
        name: 'PAI_CODE',
        message: 'Insert pai-code to run'
    }
]).then((ans) => {
    fs.writeFileSync('/var/PAI/Bot/queue/in.pai', ans.PAI_CODE, 'utf8');
    console.log('Done');


}).catch((e) => {
    console.log(e);
});