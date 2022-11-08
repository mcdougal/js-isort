#!/usr/bin/env node
/* eslint-disable max-len */

const program = require(`commander`);
const fs = require(`fs`);

const isort = require(`./js-isort`);
const resolveAliases = require(`./resolveAliases`);

const collect = (val, memo) => {
  memo.push(val);
  return memo;
};

program
  .version(`3.2.0`, `-v, --version`)
  .usage(`[options] [file ...]`)
  .description(
    `By default, output is written to stdout.
Stdin is read if it is piped to js-isort and no files are given.`
  )
  .option(
    `--config [value]`,
    `Path to Babel, webpack or TypeScript configuration file containing path aliases`
  )
  .option(`--write`, `Edit files in-place`)
  .option(`--ignore [value]`, `Skip files matching the given path`, collect, [])
  .parse(process.argv);

const filePaths = program.args;
const configPath = program.config;
const writeToFile = program.write;
const ignore = program.ignore;

let stdIn;

try {
  stdIn = fs.readFileSync(process.stdin.fd, `utf-8`);
} catch (err) {
  stdIn = null;
}

const aliases = resolveAliases(configPath);

if (filePaths.length > 0) {
  filePaths.forEach((filePath) => {
    const skip =
      ignore.length > 0 &&
      ignore.some((pathSubstring) => {
        return filePath.includes(pathSubstring);
      });

    if (skip) {
      return;
    }

    fs.readFile(filePath, `utf8`, (readError, content) => {
      if (readError) {
        throw readError;
      }

      const sortedContent = isort(content, aliases);

      if (!writeToFile) {
        // eslint-disable-next-line no-console
        console.log(sortedContent);
      } else if (sortedContent !== content) {
        fs.writeFile(filePath, sortedContent, (writeError) => {
          if (writeError) {
            throw writeError;
          }
        });
      }
    });
  });
} else if (stdIn) {
  // eslint-disable-next-line no-console
  console.log(isort(stdIn, aliases));
} else {
  program.help();
}
