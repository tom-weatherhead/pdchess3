// github:tom-weatherhead/pdchess3/src/game.ts

// import { finished, Readable, Writable } from 'stream';
import { Readable, Writable } from 'stream';
// import { promisify } from 'util';

// import { ifDefinedThenElse } from 'thaw-common-utilities.ts';

import { Board, IPieceSetupInfo } from './board';
import { Move } from './move';
import { Player } from './player';
import { PlayerColour } from './player-colour';

export interface IGameSetupOptions {
	instream?: Readable;
	outstream?: Writable;
	errstream?: Writable;
	// isWhitesMove?: boolean;
	whiteCanCastleKingside?: boolean;
	whiteCanCastleQueenside?: boolean;
	blackCanCastleKingside?: boolean;
	blackCanCastleQueenside?: boolean;
	movesHistory?: Move[];
	// moveHistory can make the next two or three fields unnecessary:
	rowOfEnPassantCapturablePawn?: number;
	columnOfEnPassantCapturablePawn?: number;
	// numIterationsSinceLastCapture?: number;
}

export interface IGameSetupInfo {
	pieceSetupInfo: IPieceSetupInfo[];
	options?: IGameSetupOptions;
}

// const finishedPromisified = promisify(finished);

// export const stringEncoding = 'utf8';

export class Game {
	// Allow the game to be configured with any I/O streams,
	// not necessarily process.stdin/out/err.

	// public static play(options = {
	// 	argv?: string[];
	// 	instream?: Readable;
	// 	outstream?: Writable;
	// 	errstream?: Writable;
	// } = {}) {
	// 	const argv = ifDefinedThenElse(options.argv, []);
	// 	// Or just?: const argv = options.argv || [];

	// 	// Then create the game object
	// 	const game = new Game(...);

	// 	// Then:
	// 	game.instream = ifDefinedThenElse(options.instream, process.stdin);
	// 	game.outstream = ifDefinedThenElse(options.outstream, process.stdout);
	// 	game.errstream = ifDefinedThenElse(options.errstream, process.stderr);

	// 	// Then set up the players based on argv
	// 	...

	// 	// ? Should we replace this local 'player' with Game.currentPlayer?
	// 	// Then the Game object can store the complete game state.
	// 	let player = game.whitePlayer;

	// 	// Loop: iterate once for each move:
	// 	...
	// }

	// Then calls to e.g. console.log(a, b, c); can be replaced with:

	// private writeToStream(stream: Writable, args: any[]): void {
	// 	stream.write(args.map(arg => arg.toString()).join('') + '\n');
	// }

	// public readFromInputStream() {
	// }

	// public writeToOutputStream(...args: any[]): void {
	// 	this.writeToStream(this.outstream, args);
	// }

	// public writeToErrorStream(...args: any[]): void {
	// 	this.writeToStream(this.errstream, args);
	// }

	public readonly board: Board;

	public readonly whitePlayer: Player;
	public readonly blackPlayer: Player;
	// public currentPlayer: Player;

	public readonly movesHistory: Move[] = [];

	public instream: Readable;
	public outstream: Writable;
	public errstream: Writable;

	constructor(gameSetupInfo?: IGameSetupInfo) {
		const isCustomGame = typeof gameSetupInfo !== 'undefined';

		this.whitePlayer = new Player(PlayerColour.White, this, isCustomGame);
		this.blackPlayer = new Player(PlayerColour.Black, this, isCustomGame);

		const options = (gameSetupInfo || {}).options || {};

		this.instream = options.instream || process.stdin;
		this.outstream = options.outstream || process.stdout;
		this.errstream = options.errstream || process.stderr;

		this.whitePlayer.opponent = this.blackPlayer;
		this.blackPlayer.opponent = this.whitePlayer;
		// this.currentPlayer = this.whitePlayer;

		this.board = new Board(this, gameSetupInfo);
	}

	public handleError(message: string, printBoard = false): never {
		console.error(message);

		if (printBoard) {
			this.board.printBoard();
		}

		throw new Error(message);
	}

	public printMovesHistory(): void {
		const fnPadStrTo16 = (str: string) => {
			while (str.length < 16) {
				str = str + ' ';
			}

			return str;
		};
		const fnMoveToStr = (i: number) => {
			return fnPadStrTo16(
				i < this.movesHistory.length
					? this.movesHistory[i].toString()
					: ''
			);
		};

		console.log('Moves played in the game:\n\n\t\t\tWhite\t\t\tBlack\n');

		for (let i = 0; 2 * i < this.movesHistory.length; i++) {
			const moveStr = `Move ${i + 1}`;

			console.log(
				`${fnPadStrTo16(moveStr)}\t${fnMoveToStr(2 * i)}\t${fnMoveToStr(
					2 * i + 1
				)}`
			);
		}

		console.log();
	}

	public haveTheSameMovesBeenRepeated3Times(): boolean {
		const numMoves = this.movesHistory.length;
		const indexOfLastMove = numMoves - 1;
		let interval = 4;
		const intervalIncrement = 2;

		while (3 * interval <= numMoves) {
			let areEqual = true;

			for (let i = 0; i < interval; i++) {
				if (
					!this.movesHistory[indexOfLastMove - i].isEqualTo(
						this.movesHistory[indexOfLastMove - interval - i]
					) ||
					!this.movesHistory[indexOfLastMove - i].isEqualTo(
						this.movesHistory[indexOfLastMove - 2 * interval - i]
					)
				) {
					areEqual = false;
					break;
				}
			}

			if (areEqual) {
				console.log(
					`Three-time repetition: Iterations (${
						numMoves - interval
					} ... ${indexOfLastMove}) match ${
						numMoves - 2 * interval
					} ... ${indexOfLastMove - interval} and ${
						numMoves - 3 * interval
					} ... ${indexOfLastMove - 2 * interval}.`
				);

				return true;
			}

			interval += intervalIncrement;
		}

		return false;
	}
} // class Game
