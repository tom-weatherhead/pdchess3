// github:tom-weatherhead/pdchess3/src/move.ts

import { boardSize, columnLabels, rowLabels } from './board';
import {
	initialToPieceType,
	PieceType,
	pieceTypeToInitial
} from './piece-type';

export interface IMoveOptions {
	isKingsideCastlingMove?: boolean;
	isQueensideCastlingMove?: boolean;
	isCapturingMove?: boolean;
	isEnPassantCapturingMove?: boolean;
	isCheckMove?: boolean;
	isCheckmateMove?: boolean;
	isStalemateMove?: boolean;
	promotedTo?: PieceType;
}

export class Move {
	public static makeCastlingMove(kingside: boolean): Move {
		return new Move(
			PieceType.Null,
			boardSize + (kingside ? 0 : 1),
			0,
			0,
			0,
			{
				isKingsideCastlingMove: kingside,
				isQueensideCastlingMove: !kingside
			}
		);
	}

	public static parse(input: string): Move {
		// E.g. Move without capture: e2-e4 or e2 e4
		// E.g. Move with capture: e4xd5
		// E.g. Castling: O-O
		// E.g. Pawn promotion: a7-a8=Q
		// E.g. En passant pawn capture: e5xd6 EP

		if (input === 'O-O') {
			// Big letter O, not zero.
			return Move.makeCastlingMove(true);
		} else if (input === 'O-O-O') {
			return Move.makeCastlingMove(false);
		}

		const pawnPromotionRegex = /=([NBRQ])/;

		const matchPawnPromotionRegex = input
			// .substring(5)
			.match(pawnPromotionRegex);

		input = input.toLowerCase();

		// We append [a-ho] to the regex because we don't want
		// the first 'b' in b2-b3 to be misinterpreted as Bishop, e.g. Bc1-d2
		const pieceTypePrefixMatch = input.match(/^([nbrqk])[a-ho]/);

		// Does input.match(/^[nbrqk][a-ho]/) ?
		// If so, then the first character indicates the type of piece
		// that is moving.

		const movedPieceType =
			pieceTypePrefixMatch && pieceTypePrefixMatch.length === 2
				? initialToPieceType(pieceTypePrefixMatch[1])
				: PieceType.Pawn;

		if (pieceTypePrefixMatch) {
			input = input.substring(1);
		}

		const moveRegex = /^[a-h][1-8][\s \-x][a-h][1-8]/;
		// const moveRegex = /^([a-h])([1-8])[\s \-x]([a-h])([1-8])/;

		if (!input.match(moveRegex)) {
			// Try to match the first 5 chars
			throw new Error(`Move.parse() : Failed to parse '${input}'`);
		}

		const srcCol = columnLabels.indexOf(input[0]);
		const srcRow = rowLabels.indexOf(input[1]);
		const dstCol = columnLabels.indexOf(input[3]);
		const dstRow = rowLabels.indexOf(input[4]);
		let promotedTo = PieceType.Null;

		// const enPassantCaptureRegex = /^\s+EP$/;

		if (matchPawnPromotionRegex && matchPawnPromotionRegex.length === 2) {
			promotedTo = initialToPieceType(matchPawnPromotionRegex[1]);
		}

		return new Move(movedPieceType, srcRow, srcCol, dstRow, dstCol, {
			promotedTo: promotedTo
		});
	}

	// Move Table == an array of 7 list<CMove>
	public movedPieceType: PieceType;
	public readonly srcRow: number;
	public readonly srcCol: number;
	public readonly dstRow: number;
	public readonly dstCol: number;
	public readonly isKingsideCastlingMove: boolean;
	public readonly isQueensideCastlingMove: boolean;
	public readonly isCapturingMove: boolean;
	public readonly isEnPassantCapturingMove: boolean;
	public isCheckMove: boolean;
	public isCheckmateMove: boolean;
	public isStalemateMove: boolean;
	public readonly promotedTo: PieceType;
	public mateInNMoves: number;

	constructor(
		movedPieceType: PieceType,
		srcRow: number,
		srcCol: number,
		dstRow: number,
		dstCol: number,
		options: IMoveOptions = {}
	) {
		this.movedPieceType = movedPieceType;
		this.srcRow = srcRow;
		this.srcCol = srcCol;
		this.dstRow = dstRow;
		this.dstCol = dstCol;

		this.isKingsideCastlingMove = options.isKingsideCastlingMove || false;
		this.isQueensideCastlingMove = options.isQueensideCastlingMove || false;
		this.isCapturingMove = options.isCapturingMove || false;
		this.isEnPassantCapturingMove =
			options.isEnPassantCapturingMove || false;
		this.isCheckMove = options.isCheckMove || false;
		this.isCheckmateMove = options.isCheckmateMove || false;
		this.isStalemateMove = options.isStalemateMove || false;
		this.promotedTo = options.promotedTo || PieceType.Null;
		this.mateInNMoves = 0;
	}

	public isEqualTo(otherMove: Move): boolean {
		return (
			(this.isKingsideCastlingMove && otherMove.isKingsideCastlingMove) ||
			(this.isQueensideCastlingMove &&
				otherMove.isQueensideCastlingMove) ||
			(this.srcRow === otherMove.srcRow &&
				this.srcCol === otherMove.srcCol &&
				this.dstRow === otherMove.dstRow &&
				this.dstCol === otherMove.dstCol)
		);
	}

	public toString(options: IMoveOptions = {}): string {
		if (options.isKingsideCastlingMove || this.isCastlingKingside()) {
			return 'O-O';
		} else if (
			options.isQueensideCastlingMove ||
			this.isCastlingQueenside()
		) {
			return 'O-O-O';
		}

		const promotedToStr = pieceTypeToInitial(
			options.promotedTo || this.promotedTo
		);

		const initial = pieceTypeToInitial(this.movedPieceType);
		const srcCoordinates = `${columnLabels[this.srcCol]}${this.srcRow + 1}`;
		const separator =
			options.isCapturingMove || this.isCapturingMove ? 'x' : '-';
		const dstCoordinates = `${columnLabels[this.dstCol]}${this.dstRow + 1}`;
		const suffix1 =
			options.isEnPassantCapturingMove || this.isEnPassantCapturingMove
				? ' EP'
				: promotedToStr
				? `=${promotedToStr}`
				: '';
		const suffix2 =
			options.isCheckmateMove || this.isCheckmateMove
				? '#'
				: options.isCheckMove || this.isCheckMove
				? '+'
				: '';
		const suffix3 =
			this.mateInNMoves === 0
				? ''
				: this.mateInNMoves === 1
				? ' (Mate in 1 move)'
				: ` (Mate in ${this.mateInNMoves} moves)`;
		const suffix4 = // 2020-03-19 : Temporary
			options.isStalemateMove || this.isStalemateMove ? ' Stalemate' : '';

		return `${initial}${srcCoordinates}${separator}${dstCoordinates}${suffix1}${suffix2}${suffix3}${suffix4}`;
	}

	public isCastlingKingside(): boolean {
		return this.isKingsideCastlingMove || this.srcRow === boardSize;
	}

	public isCastlingQueenside(): boolean {
		return this.isQueensideCastlingMove || this.srcRow === boardSize + 1;
	}

	public isCastling(): boolean {
		return this.isCastlingKingside() || this.isCastlingQueenside();
	}
} // class Move
