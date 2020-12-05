// github:tom-weatherhead/pdchess3/src/piece-archetype.ts

import { TwoDimensionalVector } from './2d-vector';
import { boardSize } from './board';
import { PieceType } from './piece-type';

// From https://github.com/lhartikk/simple-chess-ai/blob/master/script.js :

const pawnEval = [
	[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
	[5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
	[1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
	[0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
	[0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
	[0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
	[0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
	[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
];

const knightEval = [
	[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
	[-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
	[-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
	[-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
	[-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
	[-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
	[-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
	[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
];

const bishopEval = [
	[-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
	[-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
	[-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
	[-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
	[-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
	[-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
	[-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
	[-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

const rookEval = [
	[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
	[0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0]
];

const evalQueen = [
	[-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
	[-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
	[-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
	[-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
	[0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
	[-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
	[-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
	[-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

const kingEval = [
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
	[-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
	[2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
	[2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0]
];

// var getPieceValue = function (piece, x, y) {
//     if (piece === null) {
//         return 0;
//     }
//     var getAbsoluteValue = function (piece, isWhite, x ,y) {
//         if (piece.type === 'p') {
//             return 10 + ( isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x] );
//         } else if (piece.type === 'r') {
//             return 50 + ( isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x] );
//         } else if (piece.type === 'n') {
//             return 30 + knightEval[y][x];
//         } else if (piece.type === 'b') {
//             return 30 + ( isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x] );
//         } else if (piece.type === 'q') {
//             return 90 + evalQueen[y][x];
//         } else if (piece.type === 'k') {
//             return 900 + ( isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x] );
//         }
//         throw "Unknown piece type: " + piece.type;
//     };

//     var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x ,y);
//     return piece.color === 'w' ? absoluteValue : -absoluteValue;
// };

export class PieceArchetype {
	public static readonly king = new PieceArchetype(PieceType.King);
	public static readonly queen = new PieceArchetype(PieceType.Queen);
	public static readonly rook = new PieceArchetype(PieceType.Rook);
	public static readonly bishop = new PieceArchetype(PieceType.Bishop);
	public static readonly knight = new PieceArchetype(PieceType.Knight);
	public static readonly pawn = new PieceArchetype(PieceType.Pawn);

	public static get precedenceOfNull(): number {
		return 6;
	}

	public static getArchetype(pieceType: PieceType): PieceArchetype {
		switch (pieceType) {
			case PieceType.King:
				return PieceArchetype.king;

			case PieceType.Queen:
				return PieceArchetype.queen;

			case PieceType.Rook:
				return PieceArchetype.rook;

			case PieceType.Bishop:
				return PieceArchetype.bishop;

			case PieceType.Knight:
				return PieceArchetype.knight;

			case PieceType.Pawn:
				return PieceArchetype.pawn;

			default:
				throw new Error(
					`PieceArchetype.getArchetype() : Bad piece type '${PieceType[pieceType]}'`
				);
		}
	}

	public readonly pieceType: PieceType;
	public readonly printable: string; // Printable representation (upper case).
	public readonly value: number;
	public readonly precedence: number;
	public readonly unlimitedRange: boolean; // true for Bishop, Rook, Queen.
	public directions: TwoDimensionalVector[] = [];
	private readonly straightVector = new TwoDimensionalVector(1, 0);
	private readonly diagonalVector = new TwoDimensionalVector(1, 1);
	private readonly knightVector = new TwoDimensionalVector(2, 1);
	private readonly positionEvaluationMatrix: number[][];

	private constructor(pieceType: PieceType) {
		this.pieceType = pieceType;
		this.unlimitedRange =
			pieceType === PieceType.Bishop ||
			pieceType === PieceType.Rook ||
			pieceType === PieceType.Queen;

		switch (pieceType) {
			case PieceType.Pawn:
				this.printable = 'P';
				// this.value = 1;
				this.value = 10;
				this.precedence = 5;
				this.positionEvaluationMatrix = pawnEval;
				// Leave the directions vector blank.
				break;

			case PieceType.Knight:
				this.printable = 'N';
				// this.value = 3;
				this.value = 30;
				this.precedence = 4;
				this.positionEvaluationMatrix = knightEval;
				this.addAllOrientations(this.knightVector);
				break;

			case PieceType.Bishop:
				this.printable = 'B';
				// this.value = 3.125;
				this.value = 30;
				this.precedence = 3;
				this.positionEvaluationMatrix = bishopEval;
				this.addAllOrientations(this.diagonalVector);
				break;

			case PieceType.Rook:
				this.printable = 'R';
				// this.value = 5;
				this.value = 50;
				this.precedence = 2;
				this.positionEvaluationMatrix = rookEval;
				this.addAllOrientations(this.straightVector);
				break;

			case PieceType.Queen:
				this.printable = 'Q';
				// this.value = 9;
				this.value = 90;
				this.precedence = 1;
				this.positionEvaluationMatrix = evalQueen;
				this.addAllOrientations(this.straightVector);
				this.addAllOrientations(this.diagonalVector);
				break;

			case PieceType.King:
				this.printable = 'K';
				// this.value = 1000;
				this.value = 900;
				this.precedence = 0;
				this.positionEvaluationMatrix = kingEval;
				this.addAllOrientations(this.straightVector);
				this.addAllOrientations(this.diagonalVector);
				break;

			default:
				throw new Error(
					`PieceArchetype constructor: Invalid pieceType '${PieceType[pieceType]}' (${pieceType})`
				);
		}
	}

	private isMemberOfVector(
		dir: TwoDimensionalVector,
		dirs: TwoDimensionalVector[]
	): boolean {
		return (
			dirs.find(
				(dir2: TwoDimensionalVector) =>
					dir.nDX === dir2.nDX && dir.nDY === dir2.nDY
			) !== undefined
		);
	}

	private addAllOrientations(dir: TwoDimensionalVector): void {
		this.directions.push(dir);

		// 1) Reflect in the X axis.
		let newDirections: TwoDimensionalVector[] = [];

		this.directions
			.filter((dir2: TwoDimensionalVector) => dir2.nDY !== 0)
			.forEach((dir2: TwoDimensionalVector) => {
				const newDir = new TwoDimensionalVector(dir2.nDX, -dir2.nDY);

				if (!this.isMemberOfVector(newDir, this.directions)) {
					newDirections.push(newDir);
				}
			});

		this.directions = this.directions.concat(newDirections);

		// 2) Reflect in the Y axis.
		newDirections = [];

		this.directions
			.filter((dir2: TwoDimensionalVector) => dir2.nDX !== 0)
			.forEach((dir2: TwoDimensionalVector) => {
				const newDir = new TwoDimensionalVector(-dir2.nDX, dir2.nDY);

				if (!this.isMemberOfVector(newDir, this.directions)) {
					newDirections.push(newDir);
				}
			});

		this.directions = this.directions.concat(newDirections);

		// 3) Reflect in the line X == Y.
		newDirections = [];

		this.directions
			.filter((dir2: TwoDimensionalVector) => dir2.nDX !== dir2.nDY)
			.forEach((dir2: TwoDimensionalVector) => {
				const newDir = new TwoDimensionalVector(dir2.nDY, dir2.nDX);

				if (!this.isMemberOfVector(newDir, this.directions)) {
					newDirections.push(newDir);
				}
			});

		this.directions = this.directions.concat(newDirections);
	}

	public getAbsoluteValue(isWhite: boolean, x: number, y: number): number {
		const row = isWhite ? y : boardSize - 1 - y;

		return this.value + this.positionEvaluationMatrix[row][x];
	}
} // class PieceArchetype
