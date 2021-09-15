// github:tom-weatherhead/pdchess3/src/cli.ts

import { getIntervalStringFromMilliseconds } from 'thaw-common-utilities.ts';

import { readEvaluatePrintLoop } from 'thaw-repl';

import { Game } from './game';
import { Move } from './move';
import { getOpeningBookInstance } from './opening-book';
import { PieceArchetype } from './piece-archetype';
import { IFindBestMoveResult, Player } from './player';

const maxBestLineValue = PieceArchetype.king.value / 2;

class Cli {
	private readonly game: Game;
	private currentPlayer: Player;
	private numIterations = 0;
	private numIterationsSinceLastCapture = 0;
	private done = false;
	private resigned = false;
	private winner = 'None (0.5 - 0.5)';
	private numConsecutiveMovesBelowMoveGenThreshold = 0;
	// private readonly : ;
	// private readonly : ;
	// private readonly : ;

	constructor(private readonly argv: string[]) {
		this.game = new Game();
		this.currentPlayer = this.game.whitePlayer;
	}

	// ThAW 2020-03-07 : This parseCommandLineArgumentsForPlayer code sucks.
	// It is Fugly. Rewrite it sometime.

	private parseCommandLineArgumentsForPlayer(
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

	private parseCommandLineArguments(
		argv: string[],
		i: number,
		game: Game
	): void {
		i = this.parseCommandLineArgumentsForPlayer(argv, i, game.whitePlayer);
		this.parseCommandLineArgumentsForPlayer(argv, i, game.blackPlayer);
	}

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

	private onWin(bestLineValue: number): string {
		let winner =
			bestLineValue > 0
				? this.currentPlayer.name
				: this.currentPlayer.opponent.name;
		winner =
			winner +
			' ' +
			(winner === this.game.whitePlayer.name ? '(1 - 0)' : '(0 - 1)');

		this.winner = winner;

		return winner;
	}

	private isDone(findBestMoveResult: IFindBestMoveResult): boolean {
		const {
			bestMove,
			bestLineValue,
			// isKingCaptured,
			movesToKingCapture
		} = findBestMoveResult;
		let result = false;

		if (typeof bestMove === 'undefined') {
			console.log(`${this.currentPlayer.name} cannot move. Stalemate.`);
			this.onWin(0);

			return true;
		} else if (Math.abs(bestLineValue) > maxBestLineValue) {
			// console.log('A king is captured in the best line; exiting.');

			if (bestLineValue < 0) {
				console.log(`${this.currentPlayer.name} resigns.`);
				this.resigned = true;
			}

			this.onWin(bestLineValue);

			result = true;
		}

		console.log(
			`The bestLineValue (${bestLineValue}) suggests that`,
			bestLineValue > 0
				? this.currentPlayer.name
				: bestLineValue < 0
				? this.currentPlayer.opponent.name
				: 'neither player',
			'is ahead.'
		);

		const playersMaterialAdvantage =
			this.currentPlayer.totalMaterialValue() -
			this.currentPlayer.opponent.totalMaterialValue();

		if (playersMaterialAdvantage === 0) {
			console.log('Material is balanced');
		} else {
			console.log(
				`${
					playersMaterialAdvantage > 0
						? this.currentPlayer.name
						: this.currentPlayer.opponent.name
				}'s material advantage:`,
				Math.abs(playersMaterialAdvantage)
			);

			if (
				playersMaterialAdvantage + bestLineValue <
				-this.currentPlayer.resignationThreshold
			) {
				console.log(
					`${this.currentPlayer.opponent.name}'s material advantage in ${this.currentPlayer.name}'s best line:`,
					Math.abs(playersMaterialAdvantage + bestLineValue)
				);
				console.log(
					`${this.currentPlayer.name}'s resignation threshold is ${this.currentPlayer.resignationThreshold}.`
				);
				console.log(`${this.currentPlayer.name} resigns.`);
				this.onWin(-1); // currentPlayer loses.
				this.resigned = true;
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

	private getManualMove(command: string): Move {
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

	private getAutomatedMove(game: Game, player: Player): Move | undefined {
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
			this.numConsecutiveMovesBelowMoveGenThreshold = 0;
		} else if (
			++this.numConsecutiveMovesBelowMoveGenThreshold >=
				numConsecutiveMovesNeeded &&
			player.maxPlyWhenAutomated < ultimateMaxPly &&
			player.opponent.maxPlyWhenAutomated < ultimateMaxPly
		) {
			player.maxPlyWhenAutomated++;
			console.log(
				`${player.name}'s maxPly is now ${player.maxPlyWhenAutomated}`
			);
			player.opponent.maxPlyWhenAutomated++;
			this.numConsecutiveMovesBelowMoveGenThreshold = 0;
		}

		this.done = this.done || this.isDone(findBestMoveResult);

		return findBestMoveResult.bestMove;
	}

	private isExitCommand(command: string): boolean {
		return command === 'exit';
	}

	private displayInfoBeforeMove(game: Game, player: Player): void {
		game.board.printBoard();
		console.log(
			`Move ${Math.floor(this.numIterations / 2) + 1}: ${player.name}`
		);
	}

	private evaluate(command: string): string {
		do {
			const startTimeInMilliseconds = new Date().valueOf();
			const move = this.currentPlayer.isAutomated
				? this.getAutomatedMove(this.game, this.currentPlayer)
				: this.getManualMove(command);

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
			if (typeof move !== 'undefined' && !this.resigned) {
				const oldIsInCheck = this.currentPlayer.isInCheck();

				this.currentPlayer.makeMove(move);

				const newIsInCheck = this.currentPlayer.isInCheck();

				if (!oldIsInCheck && newIsInCheck) {
					console.error(
						`Error: ${this.currentPlayer.name} moved into check. This should never happen.`
					);
					this.done = true;
				}

				move.isCheckMove =
					!move.isCheckmateMove &&
					this.currentPlayer.isOpponentInCheck();

				if (!this.done && move.isCheckMove && !move.isCheckmateMove) {
					// console.log('Check!');
					console.log(
						'[Busta "Coronavirus" Rhymes]: Wu Han! I got cha all in check!'
					);
				}

				console.log(
					`${this.currentPlayer.name}'s move: ${move.toString()}`
				);
				this.game.movesHistory.push(move);

				if (move.isCapturingMove) {
					this.numIterationsSinceLastCapture = 0;
				} else if (++this.numIterationsSinceLastCapture >= 100) {
					console.log(
						'50 moves have been made since the last capture; the game is drawn.'
					);
					this.done = true;
				} else if (this.game.haveTheSameMovesBeenRepeated3Times()) {
					console.log(
						'The same moves have been repeated three times; the game is drawn.'
					);
					this.done = true;
				}
			}

			if (this.done) {
				console.log('Final board:\n');
				this.game.board.printBoard();
				this.game.printMovesHistory();
			} else {
				this.currentPlayer = this.currentPlayer.opponent;
				this.numIterations++;
				this.displayInfoBeforeMove(this.game, this.currentPlayer);
			}
		} while (this.currentPlayer.isAutomated && !this.done);

		return '';
	}

	public async driver(): Promise<void> {
		this.game.blackPlayer.isAutomated = true;

		// parseCommandLineArguments(process.argv, 2, game);
		this.parseCommandLineArguments(this.argv, 2, this.game);

		// repl TODO:
		// - Add an initialize() function
		// repl.readEvaluatePrintLoop(options: {
		// 	fnInitialize: () => void;
		// 	fnIsExitCommand: (command: string) => boolean;
		// 	fnEvaluate: (command: string) => string;
		// 	verbose = false;
		// } = {}): Promise<void>

		this.displayInfoBeforeMove(this.game, this.currentPlayer);

		if (
			this.game.whitePlayer.isAutomated &&
			this.game.whitePlayer.isAutomated
		) {
			this.evaluate('');
			console.log('Winner:', this.winner);
		} else {
			await readEvaluatePrintLoop(this.isExitCommand, (str: string) =>
				this.evaluate(str)
			);
			// .then(() => {
			// process.stdout.write('readEvaluatePrintLoop() resolved successfully.\n\n');
			console.log('readEvaluatePrintLoop() resolved successfully.\n');
			console.log('Winner:', this.winner);
			// })
			// .catch((error: unknown) => {
			// 	// process.stderr.write(`Error in readEvaluatePrintLoop(): ${typeof error} ${error}\n`);
			// 	console.error(
			// 		'Error in readEvaluatePrintLoop():',
			// 		typeof error,
			// 		error
			// 	);
			// });
		}
	}
} // class Cli

export async function cliDriver(argv: string[]): Promise<void> {
	await new Cli(argv).driver();
}
