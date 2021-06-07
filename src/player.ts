// github:tom-weatherhead/pdchess3/src/player.ts

import {
	getRandomNonNegativeInteger,
	ifDefinedThenElse,
	ifDefinedThenMapElse,
	// max,
	sum
} from 'thaw-common-utilities.ts';

import { boardSize } from './board';
import { Game } from './game';
import { Move } from './move';
import { Piece } from './piece';
import { PieceArchetype } from './piece-archetype';
import { PieceType } from './piece-type';
import { PlayerColour } from './player-colour';

// Do not confuse Piece (a class) and PieceType (an enum).

// **** BEGIN Optimizations ****

const enableAlwaysDetermineBestMove = true;
// const enableAlwaysDetermineBestMove = false;

const enableEarlyKingCaptureDetector = true; // Do not change this.
// const enableEarlyKingCaptureDetector = false;

const enableLineValueFading = true;
// const enableLineValueFading = false;

const enableNewCheckmateDetector = true; // Do not change this.
// const enableNewCheckmateDetector = false; // If this is false, then enableAlwaysDetermineBestMove needs to be true.

const preferBestMovesThatCheckmate = true;
// const preferBestMovesThatCheckmate = false;

// **** END Optimizations ****

// **** BEGIN Testing ****

const enableTests = true;
// const enableTests = false;

// const enableLogging = true;
// const enableLogging = false;

// **** END Testing ****

const castleKingSrcCol = 4;
const castleQueensideRookSrcCol = 0;
const castleKingsideRookSrcCol = 7;
const castleQueensideKingDstCol = 2;
const castleKingsideKingDstCol = 6;
const castleQueensideRookDstCol = 3;
const castleKingsideRookDstCol = 5;

export interface IFindBestMoveResult {
	bestMove?: Move;
	// bestMoves: Move[]; ?
	bestLineValue: number;
	canOpponentsKingBeCapturedImmediately: boolean;
	elapsedMilliseconds?: number;
	movesToKingCapture?: Move[];
	mustMyKingBeCapturedInNextMove: boolean;
}

interface IMakeMoveResult {
	capturedPiece: Piece | undefined;
	movedPiece: Piece | undefined;
}

export class Player {
	public debugFlag = false; // Temporary. For testing only.
	public enableFoolsMate = false;

	public readonly selfId: PlayerColour; // 0 for White, 1 for Black.
	public isAutomated: boolean;
	public maxPlyWhenAutomated: number;
	public readonly maxPlyExtensionWhenAutomated: number; // When the previous move was a capturing move
	public resignationThreshold: number;
	public readonly game: Game;
	public opponent: Player;
	public king: Piece;
	public pawnCapturableViaEnPassant: Piece | undefined;
	public canCastleKingside: boolean;
	public canCastleQueenside: boolean;
	public readonly pieces: Piece[];
	public numTimesGenerateMovesWasCalled: number;
	public totalMovesGenerated: number;
	public totalMovesMade: number;
	private readonly backRow: number;
	private readonly pawnStartRow: number;
	private readonly pawnPromotionRow: number;

	constructor(selfId: PlayerColour, game: Game, isCustomGame = false) {
		this.selfId = selfId;

		if (this.selfId === PlayerColour.White) {
			this.backRow = 0;
			this.pawnStartRow = 1;
			this.pawnPromotionRow = boardSize - 1;
		} else {
			this.backRow = boardSize - 1;
			this.pawnStartRow = boardSize - 2;
			this.pawnPromotionRow = 0;
		}

		this.isAutomated = false;
		this.maxPlyWhenAutomated = 5;

		this.maxPlyExtensionWhenAutomated = 2;

		// The resignationThreshold can be lowered if and when
		// we get maxPlyExtension working to reduce the horizon effect.
		// this.resignationThreshold = 15; // 5 is more realistic.
		this.resignationThreshold = 3 * PieceArchetype.rook.value; // 1 * is more realistic.

		this.game = game;
		this.opponent = this; // Temporary value; the Game constructor will reassign it
		this.king = new Piece(
			PieceArchetype.king,
			this.selfId,
			this.backRow,
			4
		);
		this.canCastleKingside = !isCustomGame;
		this.canCastleQueenside = !isCustomGame;
		this.pieces = [];
		this.numTimesGenerateMovesWasCalled = 0;
		this.totalMovesGenerated = 0;
		this.totalMovesMade = 0;

		if (!isCustomGame) {
			this.createPieces();
		}
	}

	public get isWhite(): boolean {
		return this.selfId === PlayerColour.White;
	}

	public get name(): string {
		switch (this.selfId) {
			case PlayerColour.White:
			case PlayerColour.Black:
				return PlayerColour[this.selfId];

			default:
				return '(error)';
		}
	}

	public findAndSetKing(): void {
		const kings = this.pieces.filter((piece: Piece) => piece.isKing);

		if (kings.length !== 1) {
			this.handleError(
				`player.findAndSetKing() : Player ${
					PlayerColour[this.selfId]
				} has ${kings.length} kings.`
			);
		}

		this.king = kings[0];
	}

	public totalMaterialValue(): number {
		return sum(
			...this.pieces
				.filter((piece: Piece) => !piece.captured)
				// .map((piece: Piece) => piece.archetype.value)
				.map((piece: Piece) => piece.value)
		);
	}

	public getMaterialAdvantage(): number {
		return this.totalMaterialValue() - this.opponent.totalMaterialValue();
	}

	public makeMove(move: Move): IMakeMoveResult {
		let movedPiece: Piece | undefined;
		let capturedPiece: Piece | undefined;
		let isEnPassantCapturingMove = false;

		this.pawnCapturableViaEnPassant = undefined;

		if (move.isCastling()) {
			const srcCol = castleKingSrcCol;
			let dstCol;
			let srcCol2;
			let dstCol2;

			if (move.isCastlingKingside()) {
				// Castle on the kingside.
				dstCol = castleKingsideKingDstCol;
				srcCol2 = castleKingsideRookSrcCol;
				dstCol2 = castleKingsideRookDstCol;
			} else {
				// Castle on the queenside.
				dstCol = castleQueensideKingDstCol;
				srcCol2 = castleQueensideRookSrcCol;
				dstCol2 = castleQueensideRookDstCol;
			}

			// No capturing can occur here, so we don't need to track any captured pieces.

			if (
				!this.game.board.primitiveMove(
					this.backRow,
					srcCol,
					this.backRow,
					dstCol
				)
			) {
				this.handleError('Castling error: Failed to move the king');
			}

			if (
				!this.game.board.primitiveMove(
					this.backRow,
					srcCol2,
					this.backRow,
					dstCol2
				)
			) {
				this.handleError('Castling error: Failed to move the rook');
			}

			// A player can only castle once.
			this.canCastleKingside = false;
			this.canCastleQueenside = false;
		} else {
			// A non-castling one-piece move.
			movedPiece = this.game.board.primitiveReadBoard(
				move.srcRow,
				move.srcCol
			);

			const dstSquare = this.game.board.primitiveReadBoard(
				move.dstRow,
				move.dstCol
			);

			if (typeof movedPiece === 'undefined') {
				this.handleError(
					'Non-castling one-piece move error: The piece is not in the correct starting position',
					true
				);
			}

			// Handle en passant captures, where the captured piece isn't on the dest. square.
			let capturedRow = -1;
			const capturedCol = move.dstCol;

			if (
				movedPiece.archetype.pieceType === PieceType.Pawn &&
				move.dstCol !== move.srcCol && // The pawn is capturing something.
				!dstSquare
			) {
				// The dest. square is vacant.
				// En passant capture.
				capturedRow = move.srcRow;
				isEnPassantCapturingMove = true;
			} else {
				capturedRow = move.dstRow;
			}

			capturedPiece = this.game.board.primitiveReadBoard(
				capturedRow,
				capturedCol
			);

			if (typeof capturedPiece !== 'undefined') {
				// Assert that the captured piece is an opposing piece, not your own.

				if (capturedPiece.owner === this.selfId) {
					this.handleError(
						'Error: Player captured his own piece',
						true
					);
				}

				if (isEnPassantCapturingMove) {
					this.game.board.primitivePlacePiece(
						undefined,
						capturedRow,
						capturedCol
					);
				}

				if (
					capturedPiece.archetype.pieceType === PieceType.Rook &&
					capturedRow === this.opponent.backRow
				) {
					// if the opponent's rook is captured on its original square, then the opponent can no longer castle on that side.

					if (capturedCol === boardSize - 1) {
						this.opponent.canCastleKingside = false;
					} else if (capturedCol === 0) {
						this.opponent.canCastleQueenside = false;
					}
				}

				// Mark the captured piece as captured.
				capturedPiece.captured = true;
			}

			// Update the castling flags, if necessary.
			// If the king moves, both castling flags are set to false.
			// If a rook moves from its original position, that side's castling flag is set to false.

			if (movedPiece.archetype.pieceType === PieceType.King) {
				this.canCastleKingside = false;
				this.canCastleQueenside = false;
			} else if (
				movedPiece.archetype.pieceType === PieceType.Rook &&
				move.srcRow === this.backRow
			) {
				if (move.srcCol === boardSize - 1) {
					this.canCastleKingside = false;
				} else if (move.srcCol === 0) {
					this.canCastleQueenside = false;
				}
			}

			// Set this player's pawnCapturableViaEnPassant if we have moved a pawn forward 2 squares.
			this.pawnCapturableViaEnPassant =
				movedPiece.archetype.pieceType === PieceType.Pawn &&
				Math.abs(move.srcRow - move.dstRow) === 2
					? movedPiece
					: undefined;

			// Update the board to reflect the move.
			this.game.board.primitiveMove(
				move.srcRow,
				move.srcCol,
				move.dstRow,
				move.dstCol
			);

			// Handle pawn promotion, if any.

			if (move.promotedTo !== PieceType.Null) {
				movedPiece.changePieceTypeTo(move.promotedTo);
			}
		}

		return {
			capturedPiece: capturedPiece,
			movedPiece: movedPiece
		};
	}

	public preFindBestMove(): void {
		this.numTimesGenerateMovesWasCalled = 0;
		this.totalMovesGenerated = 0;
		this.totalMovesMade = 0;
	}

	public postFindBestMove(): void {
		if (!this.numTimesGenerateMovesWasCalled) {
			console.log('generateMoves() was not called from findBestMove()');
		} else {
			console.log(
				`  maxPly: ${this.maxPlyWhenAutomated}; extended maxPly: ${
					this.maxPlyWhenAutomated + this.maxPlyExtensionWhenAutomated
				}`
			);
			console.log(
				'  numTimesGenerateMovesWasCalled:',
				this.numTimesGenerateMovesWasCalled
			);
			console.log('  totalMovesGenerated:', this.totalMovesGenerated);
			console.log(
				'  Average branching factor:',
				Math.round(
					(1000 * this.totalMovesGenerated) /
						this.numTimesGenerateMovesWasCalled
				) / 1000
			);
			console.log('  totalMovesMade:', this.totalMovesMade);
		}

		if (this.totalMovesGenerated) {
			console.log(
				'  Savings due to alpha-beta pruning:',
				Math.round(
					100000 *
						(1 - this.totalMovesMade / this.totalMovesGenerated)
				) / 1000,
				'%'
			);
		}
	}

	public findBestMove(
		ply: number,
		maxPly: number,
		maxPlyPlusExtension: number,
		parentMoveValue = NaN,
		bestUncleLineValue = NaN
	): IFindBestMoveResult {
		let startTimeInMilliseconds;

		if (ply === 1) {
			startTimeInMilliseconds = new Date().valueOf();
		}

		// Generate all moves (including non-attacking moves if ply <= maxPly).
		const generatedMoves = this.generateMoves({
			generateKingCapturingMoves: ply <= maxPly + 1,
			generateNonCapturingMoves: ply <= maxPly
		});

		this.numTimesGenerateMovesWasCalled++;
		this.totalMovesGenerated += generatedMoves.length;

		if (generatedMoves.length === 0) {
			// If the player has no possible legal moves,
			// then the game ends in a draw.

			if (ply > maxPly) {
				// No attacking moves were generated.
				// Not necessarily stalemate.
				return {
					bestLineValue: 0,
					canOpponentsKingBeCapturedImmediately: false,
					mustMyKingBeCapturedInNextMove: false
				};
			} else {
				this.handleError(
					`${this.name} : generatedMoves.length === 0`,
					true
				);
			}
		} else if (
			enableEarlyKingCaptureDetector &&
			this.doGeneratedMovesIndicateOpponentIsInCheck(generatedMoves)
		) {
			// At least one of the generated moves captures the opponent's king.

			return {
				bestLineValue: PieceArchetype.king.value,
				bestMove: generatedMoves[0],
				canOpponentsKingBeCapturedImmediately: true,
				movesToKingCapture: [generatedMoves[0]],
				mustMyKingBeCapturedInNextMove: false
			};
		}

		const fnIsBetter = (val: number, bestVal: number) => {
			if (Number.isNaN(bestVal)) {
				return true;
			} else if (this.enableFoolsMate && (ply === 1 || ply === 3)) {
				return val < bestVal;
			} else {
				return val > bestVal;
			}
		};

		const fnDoPruning = (bestVal: number) => {
			if (this.enableFoolsMate) {
				return parentMoveValue - bestVal > bestUncleLineValue;
			} else {
				return parentMoveValue - bestVal < bestUncleLineValue;
			}
		};

		const isTopLevelCall = ply === 1;
		const determineBestMove =
			enableAlwaysDetermineBestMove || isTopLevelCall;
		const doAlphaBetaPruning =
			!isTopLevelCall &&
			!Number.isNaN(parentMoveValue) &&
			!Number.isNaN(bestUncleLineValue);
		const isPlayerInCheckBeforeMove = this.isInCheck();

		// Try each move in bestMoves until Alpha-Beta pruning terminates the search.
		let bestMoves: [Move, Move[] | undefined][] = [];
		// ... i.e. Array of [move, longestSequenceOfMovesToKingCapture]
		let bestLineValue = NaN;
		let mustMyKingBeCapturedInNextMove = ply < maxPly;

		const oldCanCastleKingside = this.canCastleKingside;
		const oldCanCastleQueenside = this.canCastleQueenside;
		const oldOpponentCanCastleKingside = this.opponent.canCastleKingside;
		const oldOpponentCanCastleQueenside = this.opponent.canCastleQueenside;
		const oldPawnCapturableViaEnPassant = this.pawnCapturableViaEnPassant;

		// If the player is in check, the player must move out of check, if possible.

		for (const move of generatedMoves) {
			// Make the given move, but be able to undo it.
			const { movedPiece, capturedPiece } = this.makeMove(move);
			const isPlayerInCheckAfterMove = this.isInCheck();
			const isMoveLegal = !isPlayerInCheckAfterMove;

			if (enableTests && !move.isCastling()) {
				if (typeof movedPiece === 'undefined') {
					this.handleError(
						'makeMove() returned an undefined movedPiece'
					);
				} else if (
					movedPiece.row !== move.dstRow ||
					movedPiece.col !== move.dstCol
				) {
					this.handleError(
						`movedPiece is at [${movedPiece.row}, ${movedPiece.col}] instead of at [${move.dstRow}, ${move.dstCol}]`
					);
				}
			}

			let lineValue = ifDefinedThenMapElse(
				capturedPiece,
				// (cp: Piece) => cp.archetype.value,
				(cp: Piece) => cp.value,
				0
			);
			let movesToKingCapture: Move[] | undefined;

			// BEGIN ThAW 2020-12-06 : TODO:

			// if (!isMoveLegal) {
			// 	fscked;
			// } else if (recurse) {
			//	// Negamax:
			// 	lineValue = -this.opponent.findBestMove(...);
			// } else {
			//	// Call getMaterialAdvantage() at the leaves of the tree.
			// 	lineValue = this.getMaterialAdvantage();
			// }

			// END ThAW 2020-12-06 : TODO.

			// Recurse if we're not too deep, and if the game isn't already over.

			const recurse =
				ply < maxPly ||
				(move.isCapturingMove && ply < maxPlyPlusExtension);

			if (recurse && isMoveLegal) {
				const result = this.opponent.findBestMove(
					ply + 1,
					maxPly,
					maxPlyPlusExtension,
					lineValue,
					bestLineValue
				);

				if (Number.isNaN(result.bestLineValue)) {
					move.isStalemateMove = true;
					lineValue = 0;

					// If your opponent is stalemated, he can't capture your king:
					mustMyKingBeCapturedInNextMove = false;
				} else {
					if (enableLineValueFading) {
						// Encourage automated players to capture earlier
						// rather than later.
						lineValue -= (result.bestLineValue * 255) / 256;
					} else {
						lineValue -= result.bestLineValue;
					}

					mustMyKingBeCapturedInNextMove =
						mustMyKingBeCapturedInNextMove &&
						result.canOpponentsKingBeCapturedImmediately;

					if (
						typeof result.movesToKingCapture !== 'undefined' &&
						result.movesToKingCapture.length > 0
					) {
						// If this move is a Checkmate then result.movesToKingCapture should be defined, and should have a length of 2.

						movesToKingCapture = [move].concat(
							result.movesToKingCapture
						);
					}

					if (
						enableNewCheckmateDetector &&
						result.mustMyKingBeCapturedInNextMove
					) {
						move.isCheckmateMove = true;

						if (this.opponent.enableFoolsMate) {
							console.log(
								`${this.name} wins via Fool's Mate at ply = ${ply}:`
							); // ply should equal 4
							this.game.board.printBoard();
						}
					}
				}
			} // end if (we should call findBestMove() recursively)

			// **** BEGIN : Undo the current move ****

			// 1) Restore the castling flags.
			this.canCastleKingside = oldCanCastleKingside;
			this.canCastleQueenside = oldCanCastleQueenside;
			this.opponent.canCastleKingside = oldOpponentCanCastleKingside;
			this.opponent.canCastleQueenside = oldOpponentCanCastleQueenside;

			// 2) Restore the pawn-capturable-by-en-passant board index.
			this.pawnCapturableViaEnPassant = oldPawnCapturableViaEnPassant;

			// 3) Undo pawn promotion, if any.

			if (move.promotedTo !== PieceType.Null) {
				const dstSquare = this.game.board.primitiveReadBoard(
					move.dstRow,
					move.dstCol
				);

				if (typeof dstSquare === 'undefined') {
					this.handleError(
						`Undoing pawn promotion at [${move.dstRow}, ${move.dstCol}] failed: The square is empty.`
					);
				}

				dstSquare.changePieceTypeTo(PieceType.Pawn);

				if (
					enableTests &&
					dstSquare.archetype.pieceType !== PieceType.Pawn
				) {
					this.handleError(
						`Undoing pawn promotion at [${move.dstRow}, ${move.dstCol}] failed: 2`
					);
				}
			}

			// 4) Restore the moved piece(s) to its/their previous position(s).

			if (move.isCastling()) {
				const isCastlingKingside = move.isCastlingKingside();
				const kingSrcCol = castleKingSrcCol;
				const kingDstCol = isCastlingKingside
					? castleKingsideKingDstCol
					: castleQueensideKingDstCol;
				const rookSrcCol = isCastlingKingside
					? castleKingsideRookSrcCol
					: castleQueensideRookSrcCol;
				const rookDstCol = isCastlingKingside
					? castleKingsideRookDstCol
					: castleQueensideRookDstCol;

				if (
					enableTests &&
					!this.game.board.primitiveMove(
						this.backRow,
						kingDstCol,
						this.backRow,
						kingSrcCol
					)
				) {
					this.handleError(
						'Castling error: Failed to unmove the king'
					);
				} else if (
					enableTests &&
					!this.game.board.primitiveMove(
						this.backRow,
						rookDstCol,
						this.backRow,
						rookSrcCol
					)
				) {
					this.handleError(
						'Castling error: Failed to unmove the rook'
					);
				}
			} else if (
				enableTests &&
				!this.game.board.primitiveMove(
					move.dstRow,
					move.dstCol,
					move.srcRow,
					move.srcCol
				)
			) {
				this.handleError(
					'Failed to unmove the (first) moved piece',
					true
				);
			}

			// 5) Restore the captured piece, if any.

			if (typeof capturedPiece !== 'undefined') {
				this.game.board.primitivePlacePiece(
					capturedPiece,
					capturedPiece.row,
					capturedPiece.col
				);
				capturedPiece.captured = false;
			}

			// **** END : Undo the current move ****

			// Update statistics:
			this.totalMovesMade++;

			if (!isMoveLegal) {
				continue;
			}

			// Determine whether or not we can end the loop early
			// via the minimax algorithm (alpha-beta pruning):

			// ?: If one of the generated moves leads to king capture,
			// we want bestMoves to ultimately contain all generated moves
			// that lead to king capture, even if some of those moves have
			// higher lineValues than others. (A king is captured, regardless
			// of whether it is a little captured or a lot captured.
			// Either way, the game is over.)

			if (2 * Math.abs(lineValue) >= PieceArchetype.king.value) {
				// If lineValue > 0 then movesToKingCapture.length should be odd;
				// if lineValue < 0 then movesToKingCapture.length should be even.
				lineValue =
					lineValue > 0
						? PieceArchetype.king.value
						: -PieceArchetype.king.value;
				// Or: lineValue = getSign(lineValue) * this.game.kingArchetype.value;
			}

			const isNewBestLine = fnIsBetter(lineValue, bestLineValue);

			if (isNewBestLine) {
				bestMoves = [];
				bestLineValue = lineValue; // Now bestLineValue is not NaN.
			}

			if (lineValue === bestLineValue) {
				bestMoves.push([move, movesToKingCapture]);
			}

			// Do any pruning.

			if (
				doAlphaBetaPruning &&
				isNewBestLine &&
				fnDoPruning(bestLineValue)
			) {
				break;
			}
		} // End of 'for each move' loop

		// Number.isNaN(bestLineValue) iff bestMoves.length === 0

		if (Number.isNaN(bestLineValue) !== (bestMoves.length === 0)) {
			this.handleError(
				'Fsck: Number.isNaN(bestLineValue) !== (bestMoves.length === 0)',
				true
			);
		}

		let bestMove: Move | undefined;
		let movesToKingCaptureInBestLine: Move[] | undefined;

		if (determineBestMove && bestMoves.length > 0) {
			if (preferBestMovesThatCheckmate) {
				const filteredBestMoves = bestMoves.filter(
					// ([move, x]: [Move, Move[] | undefined]) =>
					// 	move.isCheckmateMove
					(bestMove: [Move, Move[] | undefined]) =>
						bestMove[0].isCheckmateMove
				);

				if (filteredBestMoves.length > 0) {
					bestMoves = filteredBestMoves;
				}
			}

			const index = getRandomNonNegativeInteger(bestMoves.length);

			[bestMove, movesToKingCaptureInBestLine] = bestMoves[index];
		}

		let elapsedMilliseconds;

		if (typeof startTimeInMilliseconds !== 'undefined') {
			elapsedMilliseconds =
				new Date().valueOf() - startTimeInMilliseconds;
		}

		if (generatedMoves.length > 0 && Number.isNaN(bestLineValue)) {
			// All of the generated moves resulted in the king moving into
			// (or remaining in) check.

			if (isPlayerInCheckBeforeMove) {
				// This player has been checkmated.
				bestLineValue = -PieceArchetype.king.value;
				bestMove = generatedMoves[0]; // Choose arbitrarily
				// Above, we could remember what movesToKingCapture is for
				// then move generatedMoves[0], then use it here.
				movesToKingCaptureInBestLine = [bestMove, bestMove]; // Wrong.
				mustMyKingBeCapturedInNextMove = true;
			} else {
				// This player has been stalemated.
				bestLineValue = NaN;
				bestMove = undefined;
				movesToKingCaptureInBestLine = undefined;
				mustMyKingBeCapturedInNextMove = false; // or true; ?
			}
		}

		return {
			bestLineValue: bestLineValue, // if NaN then no legal moves.
			bestMove: bestMove, // if undefined then no legal moves.
			canOpponentsKingBeCapturedImmediately: false,
			elapsedMilliseconds: elapsedMilliseconds,
			movesToKingCapture: movesToKingCaptureInBestLine,
			mustMyKingBeCapturedInNextMove: mustMyKingBeCapturedInNextMove
		};
	}

	public simpleFindBestMove(
		maxPly?: number,
		maxPlyPlusExtension?: number
	): IFindBestMoveResult {
		const maxPlyEx: number = maxPly || this.maxPlyWhenAutomated;
		// const maxPlyPlusExtensionEx: number = maxPlyPlusExtension || maxPlyEx;
		const maxPlyPlusExtensionEx: number =
			maxPlyPlusExtension ||
			this.maxPlyWhenAutomated + this.maxPlyExtensionWhenAutomated;

		return this.findBestMove(1, maxPlyEx, maxPlyPlusExtensionEx);
	}

	public isOpponentInCheck(): boolean {
		// Used here and in cli.ts
		const generatedMoves = this.generateMoves({
			generateNonCapturingMoves: false
		});

		return this.doGeneratedMovesIndicateOpponentIsInCheck(generatedMoves);
	}

	public isInCheck(): boolean {
		// Used here and in cli.ts
		return this.opponent.isOpponentInCheck();
	}

	private handleError(message: string, printBoard = false): never {
		this.game.handleError(message, printBoard);
	}

	private squareToPieceTypeIndex(square: Piece | undefined): number {
		return ifDefinedThenMapElse(
			square,
			(sq: Piece) => sq.archetype.precedence,
			PieceArchetype.precedenceOfNull
		);
	}

	private isAttackingSquare(
		moves: Move[],
		row: number,
		col: number
	): boolean {
		return moves.some(
			(move: Move) => move.dstRow === row && move.dstCol === col
		);
	} // isAttackingSquare()

	private createPieces(): void {
		this.pieces.push(this.king);
		this.pieces.push(
			new Piece(PieceArchetype.queen, this.selfId, this.backRow, 3)
		);
		this.pieces.push(
			new Piece(PieceArchetype.rook, this.selfId, this.backRow, 0)
		);
		this.pieces.push(
			new Piece(PieceArchetype.rook, this.selfId, this.backRow, 7)
		);
		this.pieces.push(
			new Piece(PieceArchetype.bishop, this.selfId, this.backRow, 2)
		);
		this.pieces.push(
			new Piece(PieceArchetype.bishop, this.selfId, this.backRow, 5)
		);
		this.pieces.push(
			new Piece(PieceArchetype.knight, this.selfId, this.backRow, 1)
		);
		this.pieces.push(
			new Piece(PieceArchetype.knight, this.selfId, this.backRow, 6)
		);

		for (let i = 0; i < boardSize; ++i) {
			this.pieces.push(
				new Piece(
					PieceArchetype.pawn,
					this.selfId,
					this.pawnStartRow,
					i
				)
			);
		}
	}

	// Does the provided list of generated moves indicate that
	// the opponent is already in check?

	private doGeneratedMovesIndicateOpponentIsInCheck(
		generatedMoves: Move[]
	): boolean {
		if (generatedMoves.length === 0) {
			return false;
		}

		const firstMove = generatedMoves[0];
		const dstSquare = this.game.board.primitiveReadBoard(
			firstMove.dstRow,
			firstMove.dstCol
		);

		return (
			typeof dstSquare !== 'undefined' &&
			dstSquare.row === this.opponent.king.row &&
			dstSquare.col === this.opponent.king.col
		);
	}

	// From Borland Turbo C++ 3.1's OWL Chess's SEARCH.CPP lines 772-784 :
	/*
	 *  Generate the next move to be analysed.
	 *   Controls the order of the movegeneration.
	 *      The moves are generated in the order:
	 *      Main variation
	 *      Captures of last moved piece
	 *      Killing moves
	 *      Other captures
	 *      Pawnpromovtions
	 *      Castling
	 *      Normal moves
	 *      E.p. captures
	 */

	private generateMoves(
		options: {
			enableAttackedSquareCheck?: boolean;
			generateKingCapturingMoves?: boolean;
			generateNonCapturingMoves?: boolean;
		} = {}
	): Move[] {
		const enableAttackedSquareCheck = ifDefinedThenElse(
			options.enableAttackedSquareCheck,
			true
		);
		const generateKingCapturingMoves = ifDefinedThenElse(
			options.generateKingCapturingMoves,
			true
		);
		const generateNonCapturingMoves = ifDefinedThenElse(
			options.generateNonCapturingMoves,
			true
		);

		// Generate the vector of all possible legal moves, including castling.
		// The moves are sorted by the value of the captured piece, if any;
		// King captures come first, since they end the game.
		const generatedMovesAList: Move[][] = [[], [], [], [], [], [], []];
		const pawnRowVector = this.selfId === PlayerColour.White ? 1 : -1;

		for (const piece of this.pieces) {
			if (piece.captured) {
				continue;
			}

			if (piece.archetype.pieceType === PieceType.Pawn) {
				// Generate all possible legal pawn moves.
				const srcRow = piece.row;
				const srcCol = piece.col;

				// For pawns, be aware of:
				// 1) 1- or 2-square initial move ahead;
				// 2) Move forward, capture diagonally;
				// 3) Capturing en passant;
				// 4) Pawn promotion to knight, bishop, rook, or queen.

				if (generateNonCapturingMoves) {
					// Try to move the pawn ahead one square.
					const dstRow = srcRow + pawnRowVector;
					const dstCol = srcCol;

					if (
						this.game.board.isCoordinateWithinBounds(dstRow, dstCol)
					) {
						const dstSquare = this.game.board.primitiveReadBoard(
							dstRow,
							dstCol
						);

						if (typeof dstSquare === 'undefined') {
							// Move the pawn ahead one square.

							if (dstRow === this.pawnPromotionRow) {
								// Promote the pawn (without capture).
								const promotionMoves = [
									PieceType.Queen,
									PieceType.Rook,
									PieceType.Bishop,
									PieceType.Knight
								].map(
									(pieceType: PieceType) =>
										new Move(
											PieceType.Pawn,
											srcRow,
											srcCol,
											dstRow,
											dstCol,
											{
												promotedTo: pieceType
											}
										)
								);

								generatedMovesAList[6] =
									generatedMovesAList[6].concat(
										promotionMoves
									);
							} else {
								generatedMovesAList[6].push(
									new Move(
										PieceType.Pawn,
										srcRow,
										srcCol,
										dstRow,
										dstCol
									)
								);
							}

							// Try to move the pawn ahead two squares if it's the pawn's first move.
							const dstRow2 = srcRow + pawnRowVector;

							if (
								srcRow === this.pawnStartRow &&
								typeof this.game.board.primitiveReadBoard(
									dstRow2,
									dstCol
								) === 'undefined'
							) {
								// Move the pawn ahead two squares.
								// Pawn promotion is impossible here.
								generatedMovesAList[6].push(
									new Move(
										PieceType.Pawn,
										srcRow,
										srcCol,
										dstRow2,
										dstCol
									)
								);
							}
						}
					}
				}

				// Try to attack diagonally.
				const kanDX: number[] = [-1, 1];

				for (let j = 0; j < 2; ++j) {
					const dstRow = srcRow + pawnRowVector;
					const dstCol = srcCol + kanDX[j];

					if (
						this.game.board.isCoordinateWithinBounds(dstRow, dstCol)
					) {
						const dstSquare = this.game.board.primitiveReadBoard(
							dstRow,
							dstCol
						);

						if (
							typeof dstSquare !== 'undefined' &&
							dstSquare.owner !== this.selfId
						) {
							// Attack diagonally and capture the piece on the destination square.
							const capturedPieceTypeIndex =
								this.squareToPieceTypeIndex(dstSquare);
							// const capturedPieceType =
							// 	dstSquare.archetype.pieceType;

							if (dstRow === this.pawnPromotionRow) {
								// Promote the pawn (with capture).
								const promotionMoves = [
									PieceType.Queen,
									PieceType.Rook,
									PieceType.Bishop,
									PieceType.Knight
								].map(
									(pieceType: PieceType) =>
										new Move(
											PieceType.Pawn,
											srcRow,
											srcCol,
											dstRow,
											dstCol,
											{
												isCapturingMove: true,
												promotedTo: pieceType
											}
										)
								);

								generatedMovesAList[capturedPieceTypeIndex] =
									generatedMovesAList[
										capturedPieceTypeIndex
									].concat(promotionMoves);
							} else {
								generatedMovesAList[
									capturedPieceTypeIndex
								].push(
									new Move(
										PieceType.Pawn,
										srcRow,
										srcCol,
										dstRow,
										dstCol,
										{
											isCapturingMove: true
										}
									)
								);
							}
						}
					}
				}

				// Try to capture en passant.

				if (this.opponent.pawnCapturableViaEnPassant) {
					const capturablePawn =
						this.opponent.pawnCapturableViaEnPassant;

					if (
						capturablePawn.row === srcRow &&
						Math.abs(capturablePawn.col - srcCol) === 1
					) {
						const dstRow = srcRow + pawnRowVector;
						const dstCol = capturablePawn.col;

						// Index 5: A pawn is capturing another pawn.  No promotion because dstRow cannot be the back row.
						generatedMovesAList[5].push(
							new Move(
								PieceType.Pawn,
								srcRow,
								srcCol,
								dstRow,
								dstCol,
								{
									isCapturingMove: true,
									isEnPassantCapturingMove: true
								}
							)
						);
					}
				}
			} else {
				for (const direction of piece.archetype.directions) {
					let dstRow = piece.row;
					let dstCol = piece.col;

					do {
						dstRow += direction.nDY;
						dstCol += direction.nDX;

						if (
							!this.game.board.isCoordinateWithinBounds(
								dstRow,
								dstCol
							)
						) {
							// We have moved off the board.
							break;
						}

						const dstSquare = this.game.board.primitiveReadBoard(
							dstRow,
							dstCol
						);

						if (
							typeof dstSquare !== 'undefined' &&
							dstSquare.owner === this.selfId
						) {
							// We have bumped into another one of our own pieces.
							break;
						}

						const isDstSquareOccupied =
							typeof dstSquare !== 'undefined';

						if (isDstSquareOccupied || generateNonCapturingMoves) {
							// We have a legal move!  Add it to the table.
							const move = new Move(
								piece.archetype.pieceType,
								piece.row,
								piece.col,
								dstRow,
								dstCol,
								{
									isCapturingMove: isDstSquareOccupied
								}
							);

							generatedMovesAList[
								this.squareToPieceTypeIndex(dstSquare)
							].push(move);
						}

						if (isDstSquareOccupied) {
							// The move we just generated was a capture; we can go no further.
							break;
						}
					} while (piece.archetype.unlimitedRange);
				}
			}
		}

		// Elsewhere in the code, we must ensure that a king that is not
		// already in check does not move into check.

		const canCastle = this.canCastleKingside || this.canCastleQueenside;

		if (
			canCastle &&
			enableAttackedSquareCheck &&
			generateNonCapturingMoves /* NO: &&
			!this.opponent.isAttackingSquare(
				opponentMoves,
				this.backRow,
				4
			) // e1/e8 is not under attack (ie. the king is not in check).
			NO: Then remove the two copies of this call below.
			-> opponentMoves has not been created yet. */
		) {
			const opponentMoves = this.opponent.generateMoves({
				enableAttackedSquareCheck: false // If true then unbounded recursion is possible.
			});
			const isKingInCheck = this.opponent.isAttackingSquare(
				opponentMoves,
				this.backRow,
				4
			);

			// In order to legally castle:
			// 1) The king and the rook must not have been moved yet;
			// 2) The squares between the king and the rook must be empty;
			// 3) The squares that the king moves through and to must not be under attack;
			// 4) The king must not be in check (you can't castle to escape check).

			if (
				this.canCastleKingside && // King and kingside rook not moved yet.
				!this.game.board.primitiveReadBoard(this.backRow, 5) && // f1 is vacant.
				!this.game.board.primitiveReadBoard(this.backRow, 6) && // g1 is vacant.
				// !this.opponent.isAttackingSquare(
				// 	opponentMoves,
				// 	this.backRow,
				// 	4
				// ) && // e1 is not under attack (ie. the king is not in check).
				!isKingInCheck &&
				!this.opponent.isAttackingSquare(
					opponentMoves,
					this.backRow,
					5
				) && // f1 is not under attack.
				!this.opponent.isAttackingSquare(opponentMoves, this.backRow, 6) // g1 is not under attack.
			) {
				generatedMovesAList[6].push(Move.makeCastlingMove(true));
			}

			if (
				this.canCastleQueenside && // King and queenside rook not moved yet.
				!this.game.board.primitiveReadBoard(this.backRow, 1) && // b1 is vacant.
				!this.game.board.primitiveReadBoard(this.backRow, 2) && // c1 is vacant.
				!this.game.board.primitiveReadBoard(this.backRow, 3) && // d1 is vacant.
				!this.opponent.isAttackingSquare(
					opponentMoves,
					this.backRow,
					2
				) && // c1 is not under attack.
				!this.opponent.isAttackingSquare(
					opponentMoves,
					this.backRow,
					3
				) && // d1 is not under attack.
				// !this.opponent.isAttackingSquare(
				// 	opponentMoves,
				// 	this.backRow,
				// 	4
				// ) // e1 is not under attack (ie. the king is not in check).
				!isKingInCheck
			) {
				generatedMovesAList[6].push(Move.makeCastlingMove(false));
			}
		}

		if (!generateKingCapturingMoves) {
			generatedMovesAList[0] = [];
		}

		// If we still have any king-capturing moves, return just those.

		if (generatedMovesAList[0].length > 0) {
			return generatedMovesAList[0];
		}

		// Collate all generated moves into a single vector,
		// sorted by captured piece value (in decreasing order).

		// generatedMovesAList[6] (i.e. moves that do not capture)
		// is sorted by the value of the moved piece (in decreasing order).

		return generatedMovesAList.reduce(
			(previousValue: Move[], currentValue: Move[]): Move[] =>
				previousValue.concat(currentValue),
			[]
		);
	}
}
