
let args = [];

process.argv.forEach(function (val, index, array) {
    if(index >= 2)
        args.push(val);
});

console.log(args);


let a = process.env.PAI_HOME;

process.exit(0);
