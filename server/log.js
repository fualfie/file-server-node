console.Color = {
    Reset: "\x1b[0m", Bright: "\x1b[1m", Dim: "\x1b[2m", Underscore: "\x1b[4m", Blink: "\x1b[5m", Reverse: "\x1b[7m", Hidden: "\x1b[8m",
    Text: { Black: "\x1b[30m", Red: "\x1b[31m", Green: "\x1b[32m", Yellow: "\x1b[33m", Blue: "\x1b[34m", Magenta: "\x1b[35m", Cyan: "\x1b[36m", White: "\x1b[37m", Crimson: "\x1b[38m" },
    Background: { Black: "\x1b[40m", Red: "\x1b[41m", Green: "\x1b[42m", Yellow: "\x1b[43m", Blue: "\x1b[44m", Magenta: "\x1b[45m", Cyan: "\x1b[46m", White: "\x1b[47m", Crimson: "\x1b[48m" }
};

['log', 'error'].forEach((method) => {
    console[method] = (function () {
        let orig = console[method];
        let tmp = process.stdout;
        process.stdout = process.stderr;
        return function () {
            try {
                let mainArguments = Array.prototype.slice.call(arguments);
                mainArguments.unshift(`${console.Color.Text.Cyan}[${new Date().toLocaleString('zh', { hour12: false })}]${method == 'error' ? console.Color.Text.Red : console.Color.Text.White}`);
                mainArguments.push(`${console.Color.Reset}`);
                orig.apply(console, mainArguments);
            } finally {
                process.stdout = tmp;
            }
        };
    })();
});
module.exports = console;