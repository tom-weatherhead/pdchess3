// github:tom-weatherhead/pdchess3/src/board.ts

import { boardSize, columnLabels, rowLabels } from './constants';
import { Game, IGameSetupInfo } from './game';
import { Piece } from './piece';
import { PieceArchetype } from './piece-archetype';
import { PieceType } from './piece-type';
import { Player } from './player';
import { PlayerColour } from './player-colour';

export interface IPieceSetupInfo {
	pieceType: PieceType;
	playerColour: PlayerColour;
	row: number;
	column: number;
}

export class Board {
	public readonly boardArea = boardSize * boardSize;
	private readonly board: (Piece | undefined)[] = [];

	constructor(game: Game, gameSetupInfo?: IGameSetupInfo) {
		this.clearBoard();

		if (typeof gameSetupInfo !== 'undefined') {
			this.setUpCustomGame(game, gameSetupInfo);
		} else {
			this.initializeBoard(game);
		}
	}

	public isCoordinateWithinBounds(row: number, col: number): boolean {
		return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
	}

	// TODO? : public primitiveReadBoard(row: number, col: number): Piece | null | undefined {
	// -> Return undefined if coords are not on the board;
	// -> Return null if the square contains no piece (?)
	public primitiveReadBoard(row: number, col: number): Piece | undefined {
		if (!this.isCoordinateWithinBounds(row, col)) {
			return undefined;
		}

		return this.board[row * boardSize + col]; // || null; ?
	}

	public primitivePlacePiece(
		piece: Piece | undefined,
		row: number,
		col: number
	): boolean {
		if (!this.isCoordinateWithinBounds(row, col)) {
			return false;
		}

		this.board[row * boardSize + col] = piece;

		if (typeof piece !== 'undefined') {
			piece.row = row;
			piece.col = col;
		}

		return true;
	}

	public primitiveMove(
		srcRow: number,
		srcCol: number,
		dstRow: number,
		dstCol: number
	): boolean {
		// Moves one piece only; this function alone cannot castle in one call.
		// No checking for captured pieces.

		if (!this.isCoordinateWithinBounds(srcRow, srcCol)) {
			console.error(
				`primitiveMove() : Coordinates (${srcRow}, ${srcCol}) are out of bounds`
			);

			return false;
		} else if (!this.isCoordinateWithinBounds(dstRow, dstCol)) {
			console.error(
				`primitiveMove() : Coordinates (${dstRow}, ${dstCol}) are out of bounds`
			);

			return false;
		}

		const piece = this.primitiveReadBoard(srcRow, srcCol);

		if (!piece) {
			console.error(
				`primitiveMove() : The source square (${srcRow}, ${srcCol}) is empty.`
			);

			return false;
		}

		if (!this.primitivePlacePiece(piece, dstRow, dstCol)) {
			console.error(
				`primitiveMove() : Failed to place piece at (${dstRow}, ${dstCol})`
			);
			console.error('  primitiveMove() : piece is', piece);

			return false;
		}

		if (!this.primitivePlacePiece(undefined, srcRow, srcCol)) {
			console.error(
				`primitiveMove() : Failed to place undefined at (${srcRow}, ${srcCol})`
			);

			return false;
		}

		return true;
	}

	public getPrintedBoardAsString(): string {
		let boardAsString = '';

		// Display row 7 first, row 0 last.

		for (let row = boardSize - 1; row >= 0; --row) {
			boardAsString = boardAsString + rowLabels[row] + ' ';

			for (let col = 0; col < boardSize; ++col) {
				let output = '?';
				const piece = this.primitiveReadBoard(row, col);

				if (typeof piece === 'undefined') {
					output = (row + col) % 2 === 0 ? '+' : ' ';
				} else {
					output = piece.archetype.printable;

					if (piece.owner === PlayerColour.Black) {
						output = output.toLowerCase();
					}
				}

				boardAsString = boardAsString + output;
			}

			boardAsString = boardAsString + '\n';
		}

		boardAsString = boardAsString + '\n  ' + columnLabels + '\n';

		return boardAsString;
	}

	public printBoard(): void {
		console.log(this.getPrintedBoardAsString());
	}

	private clearBoard(): void {
		for (let i = 0; i < this.boardArea; ++i) {
			this.board[i] = undefined; // null?
		}
	}

	private populateBoardWithPlayersPieces(player: Player): void {
		for (const piece of player.pieces) {
			this.board[piece.row * boardSize + piece.col] = piece;
		}
	}

	private initializeBoard(game: Game): void {
		this.populateBoardWithPlayersPieces(game.whitePlayer);
		this.populateBoardWithPlayersPieces(game.blackPlayer);
	}

	private setUpCustomGame(game: Game, gameSetupInfo: IGameSetupInfo): void {
		for (const p of gameSetupInfo.pieceSetupInfo) {
			const piece = new Piece(
				PieceArchetype.getArchetype(p.pieceType),
				p.playerColour,
				p.row,
				p.column
			);
			const player =
				p.playerColour === PlayerColour.White
					? game.whitePlayer
					: game.blackPlayer;

			player.pieces.push(piece);
			this.primitivePlacePiece(piece, piece.row, piece.col);
		}

		game.whitePlayer.findAndSetKing();
		game.blackPlayer.findAndSetKing();

		if (typeof gameSetupInfo.options !== 'undefined') {
			const options = gameSetupInfo.options;

			// Set up isWhitesMove ?

			game.whitePlayer.canCastleKingside =
				options.whiteCanCastleKingside || false;
			game.whitePlayer.canCastleQueenside =
				options.whiteCanCastleQueenside || false;
			game.blackPlayer.canCastleKingside =
				options.blackCanCastleKingside || false;
			game.blackPlayer.canCastleQueenside =
				options.blackCanCastleQueenside || false;

			if (typeof options.movesHistory !== 'undefined') {
				for (const move of options.movesHistory) {
					game.movesHistory.push(move);
				}
			}

			if (
				typeof options.rowOfEnPassantCapturablePawn !== 'undefined' &&
				typeof options.columnOfEnPassantCapturablePawn !== 'undefined'
			) {
				const pawn = this.primitiveReadBoard(
					options.rowOfEnPassantCapturablePawn,
					options.columnOfEnPassantCapturablePawn
				);

				if (
					typeof pawn !== 'undefined' &&
					pawn.archetype.pieceType === PieceType.Pawn
				) {
					if (pawn.owner === PlayerColour.White && pawn.row === 3) {
						game.whitePlayer.pawnCapturableViaEnPassant = pawn;
					} else if (
						pawn.owner === PlayerColour.Black &&
						pawn.row === 4
					) {
						game.blackPlayer.pawnCapturableViaEnPassant = pawn;
					}
				}
			}

			// Set up numIterationsSinceLastCapture ?
		}
	}
}
