<div>
	<img src="assets/pdchess.128x128.icon.png" />
</div>

# pdchess3

pdchess3 : Portable Didactic Chess, incarnation number 3.

A rudimentary chess engine and command-line interface.
Written in TypeScript for Node.js and npm.

[![build status](https://secure.travis-ci.org/tom-weatherhead/pdchess3.svg)](https://travis-ci.org/tom-weatherhead/pdchess3)
[![npm version](https://img.shields.io/npm/v/pdchess3.svg)](https://www.npmjs.com/package/pdchess3)
[![npm total downloads](https://img.shields.io/npm/dt/pdchess3.svg)](https://www.npmjs.com/package/pdchess3)
[![known vulnerabilities](https://snyk.io/test/github/tom-weatherhead/pdchess3/badge.svg?targetFile=package.json&package-lock.json)](https://snyk.io/test/github/tom-weatherhead/pdchess3?targetFile=package.json&package-lock.json)
[![maintainability](https://api.codeclimate.com/v1/badges/2f473e151898df4d9f1f/maintainability)](https://codeclimate.com/github/tom-weatherhead/pdchess3/maintainability)
[![test coverage](https://api.codeclimate.com/v1/badges/2f473e151898df4d9f1f/test_coverage)](https://codeclimate.com/github/tom-weatherhead/pdchess3/test_coverage)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/tom-weatherhead/pdchess3/blob/master/LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftom-weatherhead%2Fpdchess3.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftom-weatherhead%2Fpdchess3?ref=badge_shield)

<!-- [![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest) -->

## Building `pdchess3`

To build `pdchess3` and install the command-line interface, do this:

```console
npm run all
npm link
```

## Launching `pdchess3`

After `npm link` has been run, `pdchess3` can be invoked from the command line using this syntax:

```console
pdchess3 [White player configuration] [Black player configuration]
```

... where each player's configuration is in one of two forms:

- h: Human. The player's moves will be entered via the standard input.
- c [max ply]: Computer. The player's moves will be calculated by `pdchess`'s game engine, using 'max ply' as the initial basic maximum lookahead depth.

For example, if you want to play White while the computer plays Black, you could do this:

```console
pdchess3 h c 5
```

If you want the computer to play a slow game against itself, you could do this:

```console
pdchess3 c 6 c 6
```

You can use `nice` to launch the `pdchess3` process with a lower priority; e.g.:

```console
nice -n 20 pdchess3 c 5 c 5
```

## Playing `pdchess3`

A fairly standard command syntax is used to specify moves; e.g.:

- e2-e4 : An initial pawn move by White
- Ng8-f6 : An initial knight move by Black
- Qa1xd8 : A capturing move by a queen
- O-O : Castle on the kingside
- O-O-O : Castle on the queenside

Type 'exit' at the move prompt to end the game and exit the app.

## Example

```
$ pdchess3 h c 5

8 rnbqkbnr
7 pppppppp
6  + + + +
5 + + + + 
4  + + + +
3 + + + + 
2 PPPPPPPP
1 RNBQKBNR

  abcdefgh

Move 1: White
> e2-e4

Matched the manual move 'e2-e4' in the opening book.
Elapsed time for this move: 2 milliseconds
White's move: e2-e4

8 rnbqkbnr
7 pppppppp
6  + + + +
5 + + + + 
4  + +P+ +
3 + + + + 
2 PPPP PPP
1 RNBQKBNR

  abcdefgh

Move 1: Black
Opening: Nimzovich Defence
Black: Automated: Using this move from the opening book: b8-c6
Elapsed time for this move: 1 millisecond
Black's move: b8-c6

8 r+bqkbnr
7 pppppppp
6  +n+ + +
5 + + + + 
4  + +P+ +
3 + + + + 
2 PPPP PPP
1 RNBQKBNR

  abcdefgh

Move 2: White
> exit
Exiting...

$
```

## History

- I witnessed the University of Waterloo host a tournament of Othello (Reversi)-playing programs in 1992; these programs played each other by sending game data over the Internet.
- After creating my own rudimentary Othello-playing program in C, I chose chess as the next problem domain to tackle. The result was [incarnation number 1](https://github.com/tom-weatherhead/pdchess1) of pdchess, which was written in C in 1993. I began the project during my university exams in April. This version had a console interface. I started developing it on the univerity's Unix computers, then e-mailed the source code to my e-mail address at Digital Equipment of Canada in Ottawa, where I worked during the summer of 1993. At Digital, I ported the code to compile and run on the VAX/VMS operating system, and I continued development. In August 1993, I e-mailed the source code back to Waterloo. Just before finishing my final term in April 1994, I copied the source code to a 3.5-inch floppy and took it with me.
- During the summer of 1994, I modified the code to work on my brand-new computer (an Intel 80486SX PC clone running Windows 3.1, with 640 KB + 3072 KB of RAM and a 360 MB hard drive, plus 3.5-inch and 5.25-inch floppy drives) via Borland Turbo C++ 3.1. I created a GUI for pdchess using Turbo C++'s OWL (Object Windows Library) framework. (OWL was analogous to Microsoft's MFC.)
- [Incarnation number 2](https://github.com/tom-weatherhead/pdchess2) of pdchess was written in C++ in 2002, after I had read Bjarne Stroustrup's book on the language.
- Incarnation number 3 of pdchess was written in Typescript in Beijing, China in February and March 2020, during the COVID-19 coronavirus pandemic.
- pdchess is also known to some as 'partly done chess'. :-)

## TODO

Jest will set `process.env.NODE_ENV` to `'test'` if it's not set to something else. You can use that in your configuration to conditionally setup only the compilation needed for Jest, e.g.

```javascript
// babel.config.js
module.exports = api => {
  const isTest = api.env('test');
  // You can use isTest to determine what presets and plugins to use.
  // If isTest then target es2015; else target es6 (to support Angular 10).

  return {
    // ...
  };
};
```

-> ? Use Webpack, then use Jest to test the Webpacked version of pdchess3?

## License
[MIT](https://choosealicense.com/licenses/mit/)


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftom-weatherhead%2Fpdchess3.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftom-weatherhead%2Fpdchess3?ref=badge_large)