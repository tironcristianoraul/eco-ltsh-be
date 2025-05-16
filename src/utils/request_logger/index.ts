import morgan from "morgan";
import chalk from "chalk";

const customLogger = () =>
  morgan((tokens, req, res) => {
    const status = Number(tokens.status(req, res));
    const resTime = Number(tokens["response-time"](req, res));

    const color =
      status >= 500
        ? "red"
        : status >= 400
        ? "yellow"
        : status >= 300
        ? "blue"
        : status >= 200
        ? "green"
        : "gray";

    const resColor =
      resTime <= 500
        ? "green"
        : resTime > 500 && resTime <= 1000
        ? "yellow"
        : "red";

    return [
      chalk.hex("#34ace0").bold(tokens.method(req, res)),
      chalk.gray(tokens["remote-addr"](req, res)),
      chalk[color](status),
      chalk.gray(tokens.url(req, res)),
      chalk[resColor].bold(resTime + " ms"),
      chalk.gray(tokens.date(req, res)),
    ].join(" ");
  });

export default customLogger;
