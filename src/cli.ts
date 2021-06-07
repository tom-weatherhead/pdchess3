#! /usr/bin/env node -r esm

// github:tom-weatherhead/pdchess3/src/cli.ts

'use strict';

import { getIntervalStringFromMilliseconds } from 'thaw-common-utilities.ts';

import { readEvaluatePrintLoop } from 'thaw-repl';

// TODO: import { ... } from '../..';

import { Game } from './game';
import { Move } from './move';
import { getOpeningBookInstance } from './opening-book';
import { PieceArchetype } from './piece-archetype';
import { IFindBestMoveResult, Player } from './player';
// import {
// 	Game,
// 	getOpeningBookInstance,
// 	IFindBestMoveResult,
// 	Move,
// 	PieceArchetype,
// 	Player
// } from '..';

const game = new Game();
let currentPlayer = game.whitePlayer;
const maxBestLineValue = PieceArchetype.king.value / 2;
let numIterations = 0;
let numIterationsSinceLastCapture = 0;
let done = false;
let resigned = false;
let winner = 'None (0.5 - 0.5)';
let numConsecutiveMovesBelowMoveGenThreshold = 0;

game.blackPlayer.isAutomated = true;

// ThAW 2020-03-07 : This parseCommandLineArgumentsForPlayer code sucks.
// It is Fugly. Rewrite it sometime.

function parseCommandLineArgumentsForPlayer(
	argv: string[],
	i: number,
	player: Player
): number {
	const minMaxPly = 3;
	const maxMaxPly = 10;
	let maxPly = 0;

	if (argv.length <= i) {
		return i;
	}

	const hc = argv[i++];

	switch (hc.toLowerCase()) {
		case 'c':
			player.isAutomated = true;

			if (argv.length <= i) {
				return i;
			}

			maxPly = Number.parseInt(argv[i++], 10);

			if (Number.isNaN(maxPly)) {
				return --i;
			} else if (maxPly >= minMaxPly && maxPly <= maxMaxPly) {
				player.maxPlyWhenAutomated = maxPly;
			}

			break;

		case 'h':
			player.isAutomated = false;
			break;

		default:
			break;
	}

	return i;
}

function parseCommandLineArguments(argv: string[], i: number): void {
	i = parseCommandLineArgumentsForPlayer(argv, i, game.whitePlayer);
	parseCommandLineArgumentsForPlayer(argv, i, game.blackPlayer);
}

parseCommandLineArguments(process.argv, 2);

// console.log('game.whitePlayer.isAutomated:', game.whitePlayer.isAutomated);
// console.log(
// 	'game.whitePlayer.maxPlyWhenAutomated:',
// 	game.whitePlayer.maxPlyWhenAutomated
// );
// console.log('game.blackPlayer.isAutomated:', game.blackPlayer.isAutomated);
// console.log(
// 	'game.blackPlayer.maxPlyWhenAutomated:',
// 	game.blackPlayer.maxPlyWhenAutomated,
// 	'\n'
// );

function onWin(bestLineValue: number): void {
	winner =
		bestLineValue > 0 ? currentPlayer.name : currentPlayer.opponent.name;
	winner =
		winner +
		' ' +
		(winner === game.whitePlayer.name ? '(1 - 0)' : '(0 - 1)');
}

function isDone(findBestMoveResult: IFindBestMoveResult): boolean {
	const {
		bestMove,
		bestLineValue,
		// isKingCaptured,
		movesToKingCapture
	} = findBestMoveResult;
	let result = false;

	if (typeof bestMove === 'undefined') {
		console.log(`${currentPlayer.name} cannot move. Stalemate.`);
		onWin(0);

		return true;
	} else if (Math.abs(bestLineValue) > maxBestLineValue) {
		// console.log('A king is captured in the best line; exiting.');

		if (bestLineValue < 0) {
			console.log(`${currentPlayer.name} resigns.`);
			resigned = true;
		}

		onWin(bestLineValue);

		result = true;
	}

	console.log(
		`The bestLineValue (${bestLineValue}) suggests that`,
		bestLineValue > 0
			? currentPlayer.name
			: bestLineValue < 0
			? currentPlayer.opponent.name
			: 'neither player',
		'is ahead.'
	);

	const playersMaterialAdvantage =
		currentPlayer.totalMaterialValue() -
		currentPlayer.opponent.totalMaterialValue();

	if (playersMaterialAdvantage === 0) {
		console.log('Material is balanced');
	} else {
		console.log(
			`${
				playersMaterialAdvantage > 0
					? currentPlayer.name
					: currentPlayer.opponent.name
			}'s material advantage:`,
			Math.abs(playersMaterialAdvantage)
		);

		if (
			playersMaterialAdvantage + bestLineValue <
			-currentPlayer.resignationThreshold
		) {
			console.log(
				`${currentPlayer.opponent.name}'s material advantage in ${currentPlayer.name}'s best line:`,
				Math.abs(playersMaterialAdvantage + bestLineValue)
			);
			console.log(
				`${currentPlayer.name}'s resignation threshold is ${currentPlayer.resignationThreshold}.`
			);
			console.log(`${currentPlayer.name} resigns.`);
			onWin(-1); // currentPlayer loses.
			resigned = true;
			result = true;
		}
	}

	if (bestMove.isCheckmateMove) {
		console.log('Checkmate!');
		result = true;
	}

	if (bestMove.isStalemateMove) {
		console.log('Stalemate.');
		result = true;
	}

	if (
		typeof bestMove !== 'undefined' &&
		typeof movesToKingCapture !== 'undefined' &&
		movesToKingCapture.length > 0
	) {
		// If movesToKingCapture.length < 3 then error; we should have
		// ended the game already due to checkmate.

		// const isCheckmate = movesToKingCapture.length === 3;

		console.log(
			'Moves to king capture:',
			movesToKingCapture.map((move) => move.toString())
		);

		// const mateInNMoves = Math.floor((movesToKingCapture.length - 3) / 2);
		const mateInNMoves = Math.ceil((movesToKingCapture.length - 3) / 2);

		if (mateInNMoves > 0) {
			// console.log(
			// 	`Mate in ${mateInNMoves}; ${
			// 		bestLineValue > 0
			// 			? currentPlayer.opponent.name
			// 			: currentPlayer.name
			// 	} resigns.`
			// );
			console.log(`Mate in ${mateInNMoves}.`);
			bestMove.mateInNMoves = mateInNMoves;
		}
	}

	return result;
}

function getManualMove(command: string): Move {
	const move = Move.parse(command);

	if (getOpeningBookInstance().isOpen) {
		if (getOpeningBookInstance().matchMove(move)) {
			console.log(
				`Matched the manual move '${move}' in the opening book.`
			);
		} else {
			console.log(
				`Did not match the manual move '${move}' in the opening book; closing the book.`
			);
		}
	}

	return move;
}

function getAutomatedMove(player: Player): Move | undefined {
	if (getOpeningBookInstance().isOpen) {
		const moveFromOpeningBook = getOpeningBookInstance().getMove();

		if (typeof moveFromOpeningBook !== 'undefined') {
			console.log(
				`${player.name}: Automated: Using this move from the opening book:`,
				moveFromOpeningBook.toString()
			);

			return moveFromOpeningBook;
		}

		console.log(
			`${player.name}: Automated: No move was obtained from the opening book; closing the book.`
		);
	}

	player.preFindBestMove();

	// const findBestMoveResult = player.findBestMove(
	// 	1,
	// 	player.maxPlyWhenAutomated,
	// 	player.maxPlyWhenAutomated + player.maxPlyExtensionWhenAutomated
	// );
	// I.e.:
	const findBestMoveResult = player.simpleFindBestMove();

	if (typeof findBestMoveResult.bestMove === 'undefined') {
		game.handleError(
			'CLI getAutomatedMove() : simpleFindBestMove returned no moves',
			true
		);
	}

	player.postFindBestMove();

	const totalMovesGeneratedThreshold = 500000;
	// const totalMovesGeneratedThreshold = 1000000;
	const numConsecutiveMovesNeeded = 6;
	const ultimateMaxPly = 15;
	const isCapturingMove =
		typeof findBestMoveResult !== 'undefined' &&
		typeof findBestMoveResult.bestMove !== 'undefined' &&
		findBestMoveResult.bestMove.isCapturingMove;

	if (
		isCapturingMove ||
		player.totalMovesGenerated >= totalMovesGeneratedThreshold
	) {
		numConsecutiveMovesBelowMoveGenThreshold = 0;
	} else if (
		++numConsecutiveMovesBelowMoveGenThreshold >=
			numConsecutiveMovesNeeded &&
		player.maxPlyWhenAutomated < ultimateMaxPly &&
		player.opponent.maxPlyWhenAutomated < ultimateMaxPly
	) {
		player.maxPlyWhenAutomated++;
		console.log(
			`${player.name}'s maxPly is now ${player.maxPlyWhenAutomated}`
		);
		player.opponent.maxPlyWhenAutomated++;
		numConsecutiveMovesBelowMoveGenThreshold = 0;
	}

	done = done || isDone(findBestMoveResult);

	return findBestMoveResult.bestMove;
}

function isExitCommand(command: string): boolean {
	return command === 'exit';
}

function displayInfoBeforeMove(player: Player): void {
	game.board.printBoard();
	console.log(`Move ${Math.floor(numIterations / 2) + 1}: ${player.name}`);
}

function evaluate(command: string): string {
	do {
		const startTimeInMilliseconds = new Date().valueOf();
		const move = currentPlayer.isAutomated
			? getAutomatedMove(currentPlayer)
			: getManualMove(command);

		console.log(
			'Elapsed time for this move:',
			getIntervalStringFromMilliseconds(
				new Date().valueOf() - startTimeInMilliseconds
			)
		);

		// if (typeof move === 'undefined') {
		// 	console.log(
		// 		`${currentPlayer.name} cannot move; the game ends in a stalemate.`
		// 	);
		// 	done = true;
		// } else if (!resigned) {
		if (typeof move !== 'undefined' && !resigned) {
			const oldIsInCheck = currentPlayer.isInCheck();

			currentPlayer.makeMove(move);

			const newIsInCheck = currentPlayer.isInCheck();

			if (!oldIsInCheck && newIsInCheck) {
				console.error(
					`Error: ${currentPlayer.name} moved into check. This should never happen.`
				);
				done = true;
			}

			move.isCheckMove =
				!move.isCheckmateMove && currentPlayer.isOpponentInCheck();

			if (!done && move.isCheckMove && !move.isCheckmateMove) {
				// console.log('Check!');
				console.log(
					'[Busta "Coronavirus" Rhymes]: Wu Han! I got cha all in check!'
				);
			}

			console.log(`${currentPlayer.name}'s move: ${move.toString()}`);
			game.movesHistory.push(move);

			if (move.isCapturingMove) {
				numIterationsSinceLastCapture = 0;
			} else if (++numIterationsSinceLastCapture >= 100) {
				console.log(
					'50 moves have been made since the last capture; the game is drawn.'
				);
				done = true;
			} else if (game.haveTheSameMovesBeenRepeated3Times()) {
				console.log(
					'The same moves have been repeated three times; the game is drawn.'
				);
				done = true;
			}
		}

		if (done) {
			console.log('Final board:\n');
			game.board.printBoard();
			game.printMovesHistory();
		} else {
			currentPlayer = currentPlayer.opponent;
			numIterations++;
			displayInfoBeforeMove(currentPlayer);
		}
	} while (currentPlayer.isAutomated && !done);

	return '';
}

// repl TODO:
// - Add an initialize() function
// repl.readEvaluatePrintLoop(options: {
// 	fnInitialize: () => void;
// 	fnIsExitCommand: (command: string) => boolean;
// 	fnEvaluate: (command: string) => string;
// 	verbose = false;
// } = {}): Promise<void>

displayInfoBeforeMove(currentPlayer);

if (game.whitePlayer.isAutomated && game.whitePlayer.isAutomated) {
	evaluate('');
	console.log('Winner:', winner);
} else {
	readEvaluatePrintLoop(isExitCommand, evaluate)
		.then(() => {
			// process.stdout.write('readEvaluatePrintLoop() resolved successfully.\n\n');
			console.log('readEvaluatePrintLoop() resolved successfully.\n');
			console.log('Winner:', winner);
		})
		.catch((error: unknown) => {
			// process.stderr.write(`Error in readEvaluatePrintLoop(): ${typeof error} ${error}\n`);
			console.error(
				'Error in readEvaluatePrintLoop():',
				typeof error,
				error
			);
		});
}
