<div>
	<img src="assets/pdchess.128x128.icon.png" />
</div>

# pdchess3

pdchess3 : Portable Didactic Chess, incarnation number 3.

A rudimentary chess engine and command-line interface.
Written in TypeScript for Node.js and npm.

Obligatory BadgeFest:

[![codeclimate][codeclimate-badge-image]][codeclimate-url]
[![git][git-badge-image]][git-url]
[![github][github-badge-image]][github-url]
[![npm][npm-badge-image]][npm-url]
[![terminal][terminal-badge-image]][terminal-url]
[![travis][travis-badge-image]][travis-url]
[![typescript][typescript-badge-image]][typescript-url]

[![status][status-badge-image]][status-url]
[![build status][build-status-badge-image]][build-status-url]
[![npm version][npm-version-badge-image]][npm-version-url]
[![latest tag][latest-tag-badge-image]][latest-tag-url]
[![npm total downloads][npm-total-downloads-badge-image]][npm-total-downloads-url]
[![watchers][watchers-badge-image]][watchers-url]
[![stars][stars-badge-image]][stars-url]
[![issues][issues-badge-image]][issues-url]
[![forks][forks-badge-image]][forks-url]
[![contributors][contributors-badge-image]][contributors-url]
[![branches][branches-badge-image]][branches-url]
[![releases][releases-badge-image]][releases-url]
[![commits][commits-badge-image]][commits-url]
[![last commit][last-commit-badge-image]][last-commit-url]
[![types][types-badge-image]][types-url]
[![install size][install-size-badge-image]][install-size-url]
[![known vulnerabilities][known-vulnerabilities-badge-image]][known-vulnerabilities-url]
[![lines of code][lines-of-code-badge-image]][lines-of-code-url]
[![technical debt][technical-debt-badge-image]][technical-debt-url]
[![maintainability][maintainability-badge-image]][maintainability-url]
[![test coverage][test-coverage-badge-image]][test-coverage-url]
[![tested with jest][jest-badge-image]][jest-url]
[![code style: prettier][prettier-badge-image]][prettier-url]
[![license][license-badge-image]][license-url]
[![FOSSA Status][fossa-badge-image]][fossa-badge-url]

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

- Jest will set `process.env.NODE_ENV` to `'test'` if it's not set to something else. You can use that in your configuration to conditionally setup only the compilation needed for Jest, e.g.

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

- ? Use Webpack, then use Jest to test the Webpacked version of pdchess3?

## License
[MIT](https://choosealicense.com/licenses/mit/)

[codeclimate-badge-image]: https://badgen.net/badge/icon/codeclimate?icon=codeclimate&label
[codeclimate-url]: https://codeclimate.com
[git-badge-image]: https://badgen.net/badge/icon/git?icon=git&label
[git-url]: https://git-scm.com
[github-badge-image]: https://badgen.net/badge/icon/github?icon=github&label
[github-url]: https://github.com
[npm-badge-image]: https://badgen.net/badge/icon/npm?icon=npm&label
[npm-url]: https://npmjs.com
[terminal-badge-image]: https://badgen.net/badge/icon/terminal?icon=terminal&label
[terminal-url]: https://en.wikipedia.org/wiki/History_of_Unix
[travis-badge-image]: https://badgen.net/badge/icon/travis?icon=travis&label
[travis-url]: https://travis-ci.com
[typescript-badge-image]: https://badgen.net/badge/icon/typescript?icon=typescript&label
[typescript-url]: https://www.typescriptlang.org

[status-badge-image]: https://badgen.net/github/status/tom-weatherhead/pdchess3
[status-url]: https://badgen.net/github/status/tom-weatherhead/pdchess3
[build-status-badge-image]: https://secure.travis-ci.org/tom-weatherhead/pdchess3.svg
[build-status-url]: https://travis-ci.org/tom-weatherhead/pdchess3
[npm-version-badge-image]: https://img.shields.io/npm/v/pdchess3.svg
[npm-version-url]: https://www.npmjs.com/package/pdchess3
[latest-tag-badge-image]: https://badgen.net/github/tag/tom-weatherhead/pdchess3
[latest-tag-url]: https://github.com/tom-weatherhead/pdchess3/tags
[npm-total-downloads-badge-image]: https://img.shields.io/npm/dt/pdchess3.svg
[npm-total-downloads-url]: https://www.npmjs.com/package/pdchess3
[watchers-badge-image]: https://badgen.net/github/watchers/tom-weatherhead/pdchess3
[watchers-url]: https://github.com/tom-weatherhead/pdchess3/watchers
[stars-badge-image]: https://badgen.net/github/stars/tom-weatherhead/pdchess3
[stars-url]: https://github.com/tom-weatherhead/pdchess3/stargazers
[issues-badge-image]: https://badgen.net/github/issues/tom-weatherhead/pdchess3
[issues-url]: https://github.com/tom-weatherhead/pdchess3/issues
[forks-badge-image]: https://badgen.net/github/forks/tom-weatherhead/pdchess3
[forks-url]: https://github.com/tom-weatherhead/pdchess3/network/members
[contributors-badge-image]: https://badgen.net/github/contributors/tom-weatherhead/pdchess3
[contributors-url]: https://github.com/tom-weatherhead/pdchess3/graphs/contributors
[branches-badge-image]: https://badgen.net/github/branches/tom-weatherhead/pdchess3
[branches-url]: https://github.com/tom-weatherhead/pdchess3/branches
[releases-badge-image]: https://badgen.net/github/releases/tom-weatherhead/pdchess3
[releases-url]: https://github.com/tom-weatherhead/pdchess3/releases
[commits-badge-image]: https://badgen.net/github/commits/tom-weatherhead/pdchess3
[commits-url]: https://github.com/tom-weatherhead/pdchess3/commits/master
[last-commit-badge-image]: https://badgen.net/github/last-commit/tom-weatherhead/pdchess3
[last-commit-url]: https://github.com/tom-weatherhead/pdchess3
[types-badge-image]: https://badgen.net/npm/types/pdchess3
[types-url]: https://badgen.net/npm/types/pdchess3
[install-size-badge-image]: https://badgen.net/packagephobia/install/pdchess3
[install-size-url]: https://badgen.net/packagephobia/install/pdchess3
[known-vulnerabilities-badge-image]: https://snyk.io/test/github/tom-weatherhead/pdchess3/badge.svg?targetFile=package.json&package-lock.json
[known-vulnerabilities-url]: https://snyk.io/test/github/tom-weatherhead/pdchess3?targetFile=package.json&package-lock.json
[lines-of-code-badge-image]: https://badgen.net/codeclimate/loc/tom-weatherhead/pdchess3
[lines-of-code-url]: https://badgen.net/codeclimate/loc/tom-weatherhead/pdchess3
[technical-debt-badge-image]: https://badgen.net/codeclimate/tech-debt/tom-weatherhead/pdchess3
[technical-debt-url]: https://badgen.net/codeclimate/tech-debt/tom-weatherhead/pdchess3
[maintainability-badge-image]: https://api.codeclimate.com/v1/badges/2f473e151898df4d9f1f/maintainability
[maintainability-url]: https://codeclimate.com/github/tom-weatherhead/pdchess3/maintainability
[test-coverage-badge-image]: https://api.codeclimate.com/v1/badges/2f473e151898df4d9f1f/test_coverage
[test-coverage-url]: https://codeclimate.com/github/tom-weatherhead/pdchess3/test_coverage
[jest-badge-image]: https://img.shields.io/badge/tested_with-jest-99424f.svg
[jest-url]: https://github.com/facebook/jest
[prettier-badge-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[prettier-url]: https://github.com/prettier/prettier
[license-badge-image]: https://img.shields.io/github/license/mashape/apistatus.svg
[license-url]: https://github.com/tom-weatherhead/pdchess3/blob/master/LICENSE
[fossa-badge-image]: https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Ftom%2Dweatherhead%2Fpdchess3.svg?type=shield
[fossa-badge-url]: https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Ftom%2Dweatherhead%2Fpdchess3?ref=badge_shield
