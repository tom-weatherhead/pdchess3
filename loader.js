#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('.').cliDriver(process.argv).then(() => {
	console.log('cliDriver() completed without error.');
}).catch((error) => {
	console.error('cliDriver() error:', typeof error, error);
}).finally(() => {
	console.log('cliDriver() finally done done done.');
});
