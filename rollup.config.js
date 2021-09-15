// rollup.config.js

/**
 * Copyright (c) Tom Weatherhead. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
	input: './dist/types/main.js',
	output: [
		{
			file: 'dist/pdchess3.cjs.js',
			format: 'cjs',
			exports: 'named'
		},
		{
			file: 'dist/pdchess3.esm.js',
			format: 'es',
			compact: true,
			plugins: [terser()]
		},
		{
			file: 'dist/pdchess3.js',
			name: 'pdchess3',
			format: 'umd',
			compact: true,
			plugins: [terser()]
		}
	],
	// context: 'this',
	plugins: [nodeResolve()]
};
