#!/usr/bin/env node

/*
// Set options as a parameter, environment variable, or rc file.
// eslint-disable-next-line @typescript-eslint/no-var-requires
require = require('esm')(module/*, options* /)
// module.exports = require("./main.js")
require('./dist/types/cli.js');
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require('process');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const engine = require('.');

engine.cliDriver(process.argv).then(() => {
	console.log('cliDriver() completed without error.');
}).catch((error) => {
	console.error('cliDriver() error:', typeof error, error);
}).finally(() => {
	console.log('cliDriver() finally done done done.');
});
