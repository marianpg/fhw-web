const clc = require('cli-color');
const green = clc.xterm(22);
const red = clc.xterm(160);

const evaluate = (name, determined, expected) => {
    if (determined === expected) {
        console.log(green(`Test '${name}': OK\n`));
    } else {
        console.log(red(`Test '${name}': Failed. Expected '${expected}' but got '${determined}'}\n`));
    }
};

module.exports = {
    evaluate
};