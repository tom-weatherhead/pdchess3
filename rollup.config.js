// rollup.config.js

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { terser } = require('rollup-plugin-terser');

export default [
	{
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
		]
	}
];
