// github:tom-weatherhead/pdchess3/test/main.test.ts

'use strict'; // Is this of any use in Typescript?

// import { getIntervalStringFromMilliseconds } from 'thaw-common-utilities.ts';
// import { getIntervalStringFromMilliseconds } from '../node_modules/thaw-common-utilities.ts/lib/es2015/main';
// const commonUtilities = require('../node_modules/thaw-common-utilities.ts/lib/es2015/main');
// const getIntervalStringFromMilliseconds = commonUtilities.getIntervalStringFromMilliseconds;

import {
	columnLabels,
	Game,
	IFindBestMoveResult,
	IGameSetupInfo,
	IGameSetupOptions,
	initialToPieceType,
	IPieceSetupInfo,
	Move,
	PieceArchetype,
	PieceType,
	PlayerColour,
	rowLabels
} from '..';
// } from '../lib/main';

// const enableFoolsMate = true;
const enableFoolsMate = false;

function createPieceSetupInfoEx(str: string): IPieceSetupInfo {
	const match = str.match(/^([PNBRQKpnbrkq])([a-h])([1-8])$/);

	if (match) {
		// console.log(`createPieceSetupInfoEx('${str}') ; match is`, match);

		const token = match[1];
		const pieceType = initialToPieceType(token);
		const playerColour =
			token.toUpperCase() === token
				? PlayerColour.White
				: PlayerColour.Black;
		const column = columnLabels.indexOf(match[2]);
		const row = rowLabels.indexOf(match[3]);

		if (row >= 0 && column >= 0) {
			return {
				pieceType: pieceType,
				playerColour: playerColour,
				row: row,
				column: column
			};
		}
	}

	throw new Error(`createPieceSetupInfoEx('${str}') failed.`);
}

function createGameSetupInfo(
	astr: string[],
	options?: IGameSetupOptions
): IGameSetupInfo {
	return {
		pieceSetupInfo: astr.map((str) => createPieceSetupInfoEx(str)),
		options: options
	};
}

function isPlayerCheckmated(findBestMoveResult: IFindBestMoveResult): boolean {
	return findBestMoveResult.bestLineValue === -PieceArchetype.king.value;
}

function isPlayerStalemated(findBestMoveResult: IFindBestMoveResult): boolean {
	return Number.isNaN(findBestMoveResult.bestLineValue);
}

function printMovesToKingCapture(
	prefix: string,
	findBestMoveResult: IFindBestMoveResult
): void {
	if (typeof findBestMoveResult.movesToKingCapture !== 'undefined') {
		console.log(
			`${prefix}: findBestMoveResult.movesToKingCapture is`,
			findBestMoveResult.movesToKingCapture.map((move: Move) =>
				move.toString()
			)
		);
	}
}

test('Game object creation test', () => {
	// Arrange
	// Act
	const game = new Game();

	// Assert
	expect(game).toBeTruthy();
});

test('Board as string test', () => {
	// Arrange
	const expectedResult = [
		'8 rnbqkbnr',
		'7 pppppppp',
		'6  + + + +',
		'5 + + + + ',
		'4  + + + +',
		'3 + + + + ',
		'2 PPPPPPPP',
		'1 RNBQKBNR',
		'',
		'  abcdefgh',
		''
	].join('\n');
	const game = new Game();

	// Act
	const actualResult = game.board.getPrintedBoardAsString();

	// Assert
	expect(actualResult).toBe(expectedResult);
});

test('findBestMove() test', () => {
	// Arrange
	const game = new Game();
	const maxPly = 5; // 6;

	// game.whitePlayer.preFindBestMove();

	// Act
	const bestMove1White = game.whitePlayer.simpleFindBestMove(maxPly);

	// console.log('bestMove1White:', bestMove1White);

	// game.whitePlayer.postFindBestMove();

	// Assert
	expect(bestMove1White).toBeTruthy();
	// expect(bestMove1White.isKingCaptured).toBeFalsy();
});

test('Move.parse()', () => {
	// Arrange
	// Act
	const castleKingside = Move.parse('O-O');
	const castleQueenside = Move.parse('O-O-O');
	const e2e4v1 = Move.parse('e2 e4');
	const e2e4v2 = Move.parse('e2-e4');
	const d5xe6 = Move.parse('d5xe6');
	const a7a8Q = Move.parse('a7-a8=Q');
	const nb1c3 = Move.parse('Nb1-c3');
	const bc1f4 = Move.parse('Bc1-f4');
	const ra1a5 = Move.parse('Ra1-a5');
	const qd1h5 = Move.parse('Qd1-h5');
	const ke1d1 = Move.parse('Ke1-d1');

	// Assert
	expect(castleKingside).toBeTruthy();
	expect(castleKingside.movedPieceType).toBe(PieceType.Null);
	expect(castleKingside.promotedTo).toBe(PieceType.Null);
	expect(castleKingside.isCastling()).toBeTruthy();
	expect(castleKingside.isCastlingKingside()).toBeTruthy();
	expect(castleKingside.isCastlingQueenside()).toBeFalsy();

	expect(castleQueenside).toBeTruthy();
	expect(castleQueenside.movedPieceType).toBe(PieceType.Null);
	expect(castleQueenside.promotedTo).toBe(PieceType.Null);
	expect(castleQueenside.isCastling()).toBeTruthy();
	expect(castleQueenside.isCastlingKingside()).toBeFalsy();
	expect(castleQueenside.isCastlingQueenside()).toBeTruthy();

	expect(e2e4v1).toBeTruthy();
	expect(e2e4v1.srcRow).toBe(1);
	expect(e2e4v1.srcCol).toBe(4);
	expect(e2e4v1.dstRow).toBe(3);
	expect(e2e4v1.dstCol).toBe(4);
	expect(e2e4v1.movedPieceType).toBe(PieceType.Pawn);
	expect(e2e4v1.promotedTo).toBe(PieceType.Null);
	expect(e2e4v1.isCastling()).toBeFalsy();
	expect(e2e4v1.isCastlingKingside()).toBeFalsy();
	expect(e2e4v1.isCastlingQueenside()).toBeFalsy();

	expect(e2e4v2).toBeTruthy();
	expect(e2e4v2.srcRow).toBe(1);
	expect(e2e4v2.srcCol).toBe(4);
	expect(e2e4v2.dstRow).toBe(3);
	expect(e2e4v2.dstCol).toBe(4);
	expect(e2e4v2.movedPieceType).toBe(PieceType.Pawn);
	expect(e2e4v2.promotedTo).toBe(PieceType.Null);
	expect(e2e4v2.isCastling()).toBeFalsy();
	expect(e2e4v2.isCastlingKingside()).toBeFalsy();
	expect(e2e4v2.isCastlingQueenside()).toBeFalsy();

	expect(d5xe6).toBeTruthy();
	expect(d5xe6.srcRow).toBe(4);
	expect(d5xe6.srcCol).toBe(3);
	expect(d5xe6.dstRow).toBe(5);
	expect(d5xe6.dstCol).toBe(4);
	expect(d5xe6.movedPieceType).toBe(PieceType.Pawn);
	expect(d5xe6.promotedTo).toBe(PieceType.Null);
	expect(d5xe6.isCastling()).toBeFalsy();
	expect(d5xe6.isCastlingKingside()).toBeFalsy();
	expect(d5xe6.isCastlingQueenside()).toBeFalsy();

	expect(a7a8Q).toBeTruthy();
	expect(a7a8Q.srcRow).toBe(6);
	expect(a7a8Q.srcCol).toBe(0);
	expect(a7a8Q.dstRow).toBe(7);
	expect(a7a8Q.dstCol).toBe(0);
	expect(a7a8Q.movedPieceType).toBe(PieceType.Pawn);
	expect(a7a8Q.promotedTo).toBe(PieceType.Queen);
	expect(a7a8Q.isCastling()).toBeFalsy();
	expect(a7a8Q.isCastlingKingside()).toBeFalsy();
	expect(a7a8Q.isCastlingQueenside()).toBeFalsy();

	expect(nb1c3).toBeTruthy();
	expect(nb1c3.srcRow).toBe(0);
	expect(nb1c3.srcCol).toBe(1);
	expect(nb1c3.dstRow).toBe(2);
	expect(nb1c3.dstCol).toBe(2);
	expect(nb1c3.movedPieceType).toBe(PieceType.Knight);
	expect(nb1c3.promotedTo).toBe(PieceType.Null);
	expect(nb1c3.isCastling()).toBeFalsy();
	expect(nb1c3.isCastlingKingside()).toBeFalsy();
	expect(nb1c3.isCastlingQueenside()).toBeFalsy();

	expect(bc1f4).toBeTruthy();
	expect(bc1f4.srcRow).toBe(0);
	expect(bc1f4.srcCol).toBe(2);
	expect(bc1f4.dstRow).toBe(3);
	expect(bc1f4.dstCol).toBe(5);
	expect(bc1f4.movedPieceType).toBe(PieceType.Bishop);
	expect(bc1f4.promotedTo).toBe(PieceType.Null);
	expect(bc1f4.isCastling()).toBeFalsy();
	expect(bc1f4.isCastlingKingside()).toBeFalsy();
	expect(bc1f4.isCastlingQueenside()).toBeFalsy();

	expect(ra1a5).toBeTruthy();
	expect(ra1a5.srcRow).toBe(0);
	expect(ra1a5.srcCol).toBe(0);
	expect(ra1a5.dstRow).toBe(4);
	expect(ra1a5.dstCol).toBe(0);
	expect(ra1a5.movedPieceType).toBe(PieceType.Rook);
	expect(ra1a5.promotedTo).toBe(PieceType.Null);
	expect(ra1a5.isCastling()).toBeFalsy();
	expect(ra1a5.isCastlingKingside()).toBeFalsy();
	expect(ra1a5.isCastlingQueenside()).toBeFalsy();

	expect(qd1h5).toBeTruthy();
	expect(qd1h5.srcRow).toBe(0);
	expect(qd1h5.srcCol).toBe(3);
	expect(qd1h5.dstRow).toBe(4);
	expect(qd1h5.dstCol).toBe(7);
	expect(qd1h5.movedPieceType).toBe(PieceType.Queen);
	expect(qd1h5.promotedTo).toBe(PieceType.Null);
	expect(qd1h5.isCastling()).toBeFalsy();
	expect(qd1h5.isCastlingKingside()).toBeFalsy();
	expect(qd1h5.isCastlingQueenside()).toBeFalsy();

	expect(ke1d1).toBeTruthy();
	expect(ke1d1.srcRow).toBe(0);
	expect(ke1d1.srcCol).toBe(4);
	expect(ke1d1.dstRow).toBe(0);
	expect(ke1d1.dstCol).toBe(3);
	expect(ke1d1.movedPieceType).toBe(PieceType.King);
	expect(ke1d1.promotedTo).toBe(PieceType.Null);
	expect(ke1d1.isCastling()).toBeFalsy();
	expect(ke1d1.isCastlingKingside()).toBeFalsy();
	expect(ke1d1.isCastlingQueenside()).toBeFalsy();
});

test('Pawn capture via custom game', () => {
	// 8  + +k+ +
	// 7 + + + +
	// 6  + + + +
	// 5 + +p+ +
	// 4  + +P+ +
	// 3 + + + +
	// 2  + + + +
	// 1 + + K +
	//
	//   abcdefgh

	// Arrange
	// const game = new Game({
	// 	pieceSetupInfo: [
	// 		// createPieceSetupInfo(PieceType.King, PlayerColour.White, 0, 4),
	// 		// createPieceSetupInfo(PieceType.King, PlayerColour.Black, 7, 4),
	// 		// createPieceSetupInfo(PieceType.Pawn, PlayerColour.White, 3, 4),
	// 		// createPieceSetupInfo(PieceType.Pawn, PlayerColour.Black, 4, 3)
	// 		createPieceSetupInfoEx('Ke1'),
	// 		createPieceSetupInfoEx('ke8'),
	// 		createPieceSetupInfoEx('Pe4'),
	// 		createPieceSetupInfoEx('pd5')
	// 	]
	// });
	const piecePositions = ['Ke1', 'ke8', 'Pe4', 'pd5'];
	const game = new Game(createGameSetupInfo(piecePositions));

	expect(game).toBeTruthy();

	// Act
	const findBestMoveResult = game.whitePlayer.simpleFindBestMove(1);

	// Assert
	expect(findBestMoveResult.bestMove).toBeDefined();

	const bestMove = findBestMoveResult.bestMove as Move;

	expect(bestMove.srcRow).toBe(3);
	expect(bestMove.srcCol).toBe(4);
	expect(bestMove.dstRow).toBe(4);
	expect(bestMove.dstCol).toBe(3);
	// expect(findBestMoveResult.bestLineValue).toBe(1);
});

test('En passant pawn capture via custom game', () => {
	// 8  + +k+ +
	// 7 + + + +
	// 6  + + + +
	// 5 + + + +
	// 4  + pP+ +
	// 3 + + + +
	// 2  + + + +
	// 1 + + K +
	//
	//   abcdefgh

	// Arrange
	// const game = new Game({
	// 	pieceSetupInfo: [
	// 		// createPieceSetupInfo(PieceType.King, PlayerColour.White, 0, 4),
	// 		// createPieceSetupInfo(PieceType.King, PlayerColour.Black, 7, 4),
	// 		// createPieceSetupInfo(PieceType.Pawn, PlayerColour.White, 3, 4),
	// 		// createPieceSetupInfo(PieceType.Pawn, PlayerColour.Black, 3, 3)
	// 		createPieceSetupInfoEx('Ke1'),
	// 		createPieceSetupInfoEx('ke8'),
	// 		createPieceSetupInfoEx('Pe4'),
	// 		createPieceSetupInfoEx('pd4')
	// 	],
	// 	options: {
	// 		rowOfEnPassantCapturablePawn: 3,
	// 		columnOfEnPassantCapturablePawn: 4
	// 	}
	// });
	const piecePositions = ['Ke1', 'ke8', 'Pe4', 'pd4'];
	const game = new Game(
		createGameSetupInfo(piecePositions, {
			rowOfEnPassantCapturablePawn: 3,
			columnOfEnPassantCapturablePawn: 4
		})
	);

	expect(game).toBeTruthy();

	// Act
	const findBestMoveResult = game.blackPlayer.simpleFindBestMove(1);

	// Assert
	expect(findBestMoveResult.bestMove).toBeDefined();

	const bestMove = findBestMoveResult.bestMove as Move;

	expect(bestMove.srcRow).toBe(3);
	expect(bestMove.srcCol).toBe(3);
	expect(bestMove.dstRow).toBe(2);
	expect(bestMove.dstCol).toBe(4);
	// expect(findBestMoveResult.bestLineValue).toBe(1);
});

test('Smothered mate via pawn promotion to knight', () => {
	// 8  + + +nb
	// 7 + + +Pnk
	// 6  + + +pp
	// 5 + + + +
	// 4  + + + +
	// 3 + + + +
	// 2  + + + +
	// 1 + + K +
	//
	//   abcdefgh

	// Arrange
	// const game = new Game({
	// 	pieceSetupInfo: [
	// 		// createPieceSetupInfo(PieceType.Knight, PlayerColour.Black, 7, 6),
	// 		// createPieceSetupInfo(PieceType.Bishop, PlayerColour.Black, 7, 7),
	// 		// createPieceSetupInfo(PieceType.Knight, PlayerColour.Black, 6, 6),
	// 		// createPieceSetupInfo(PieceType.King, PlayerColour.Black, 6, 7),
	// 		// createPieceSetupInfo(PieceType.Pawn, PlayerColour.Black, 5, 6),
	// 		// createPieceSetupInfo(PieceType.Pawn, PlayerColour.Black, 5, 7),
	// 		// createPieceSetupInfo(PieceType.King, PlayerColour.White, 0, 4),
	// 		// createPieceSetupInfo(PieceType.Pawn, PlayerColour.White, 6, 5)
	// 		createPieceSetupInfoEx('ng8'),
	// 		createPieceSetupInfoEx('bh8'),
	// 		createPieceSetupInfoEx('ng7'),
	// 		createPieceSetupInfoEx('kh7'),
	// 		createPieceSetupInfoEx('pg6'),
	// 		createPieceSetupInfoEx('ph6'),
	// 		createPieceSetupInfoEx('Ke1'),
	// 		createPieceSetupInfoEx('Pf7')
	// 	]
	// });
	const piecePositions = [
		'ng8',
		'bh8',
		'ng7',
		'kh7',
		'pg6',
		'ph6',
		'Ke1',
		'Pf7'
	];
	const game = new Game(createGameSetupInfo(piecePositions));

	expect(game).toBeTruthy();

	// Act
	const findBestMoveResult = game.whitePlayer.simpleFindBestMove(3);

	// Assert
	expect(findBestMoveResult.bestMove).toBeDefined();

	const bestMove = findBestMoveResult.bestMove as Move;

	expect(bestMove.toString()).toBe('f7-f8=N#');
	expect(findBestMoveResult.bestLineValue).toBe(PieceArchetype.king.value);
});

test('Checkmate test 1', () => {
	// Black is to move:

	// 8  + + + k
	// 7 R + + +
	// 6  + + + +
	// 5 + + + +
	// 4  + + + +
	// 3 + + + +
	// 2  + + + +
	// 1 B + K R
	//
	//   abcdefgh

	// Arrange
	const piecePositions = ['Ke1', 'Ba1', 'Rg1', 'Ra7', 'kh8'];
	const game = new Game(createGameSetupInfo(piecePositions));

	expect(game).toBeTruthy();

	const findBestMoveResult = game.blackPlayer.simpleFindBestMove(1);

	// Act
	const blackIsCheckmated = isPlayerCheckmated(findBestMoveResult);
	const blackIsStalemated = isPlayerStalemated(findBestMoveResult);

	// Assert
	expect(blackIsCheckmated).toBeTruthy();
	expect(blackIsStalemated).toBeFalsy();
});

test('Stalemate test 1', () => {
	// 8  + + + k
	// 7 R + + +
	// 6  + + + +
	// 5 + + + +
	// 4  + + + +
	// 3 + + + +
	// 2  + + + +
	// 1 + + K R
	//
	//   abcdefgh

	// Arrange
	const piecePositions = ['Ke1', 'Rg1', 'Ra7', 'kh8'];
	const game = new Game(createGameSetupInfo(piecePositions));

	expect(game).toBeTruthy();

	const findBestMoveResult = game.blackPlayer.simpleFindBestMove(1);

	// Act
	const blackIsCheckmated = isPlayerCheckmated(findBestMoveResult);
	const blackIsStalemated = isPlayerStalemated(findBestMoveResult);

	// Assert
	expect(blackIsCheckmated).toBeFalsy();
	expect(blackIsStalemated).toBeTruthy();
});

// ****

// 2020-03-19 :
// Move 10: White
// Has White checkmated (or stalemated?) Black? : result.mustMyKingBeCapturedInNextMove = false but isCheckmateOrStalemateMove = true; result.canOpponentsKingBeCapturedImmediately = false; mustMyKingBeCapturedInNextMove = false; canOpponentsKingBeCapturedImmediately = false; move is Qd6xd8; ply = 3; maxPly = 5.

// Board after white moves Qd6xd8:

// 8 r+bQkb r
// 7 + + pp+p
// 6 pn + np+
// 5 +N+ + +
// 4  + +p+ +
// 3 + N BP+
// 2 PPP+ +PP
// 1 R + KB+R

//   abcdefgh

// TODO: Undo the move Qd6xd8, then let white find its best move.
// It should be flagged as a checkmating move.

// let x = [
// 	'Ra1', 'Ke1', 'Bf1', 'Rh1', 'Pa2', 'Pb2', 'Pc2', 'Pg2', 'Ph2', 'Nc3', 'Be3', 'Pf3', 'Nb5', 'Qd6', // White
// 	'pe4', 'pa6', 'nb6', 'nf6', 'pg6', 'pe7', 'pf7', 'ph7', 'ra8', 'bc8', 'ke8', 'bf8', 'rh8' // Black
// ];

test('Checkmate test 2', () => {
	// 8 r+b+kb r
	// 7 + + pp+p
	// 6 pn Q np+
	// 5 +N+ + +
	// 4  + +p+ +
	// 3 + N BP+
	// 2 PPP+ +PP
	// 1 R + KB+R

	//   abcdefgh

	// Arrange
	const piecePositions = [
		'Ra1',
		'Ke1',
		'Bf1',
		'Rh1',
		'Pa2',
		'Pb2',
		'Pc2',
		'Pg2',
		'Ph2',
		'Nc3',
		'Be3',
		'Pf3',
		'Nb5',
		'Qd6', // White
		'pe4',
		'pa6',
		'nb6',
		'nf6',
		'pg6',
		'pe7',
		'pf7',
		'ph7',
		'ra8',
		'bc8',
		'ke8',
		'bf8',
		'rh8' // Black
	];
	// const game = new Game({
	// 	pieceSetupInfo: piecePositions.map(str => createPieceSetupInfoEx(str))
	// });
	const game = new Game(createGameSetupInfo(piecePositions));

	expect(game).toBeTruthy();

	// Act
	// game.whitePlayer.debugFlag = true;
	// game.blackPlayer.debugFlag = true;

	// 2020-03-20 : Using extended maxPly seems to fsck things up.
	// const findBestMoveResult = game.whitePlayer.simpleFindBestMove(3, 5);

	const findBestMoveResult = game.whitePlayer.simpleFindBestMove(3);

	// Assert
	expect(findBestMoveResult.bestMove).toBeDefined();

	const bestMove = findBestMoveResult.bestMove as Move;

	// console.log('Checkmate test 2: bestMove is', bestMove.toString());

	// if (typeof findBestMoveResult.movesToKingCapture !== 'undefined') {
	// 	console.log(
	// 		'findBestMoveResult.movesToKingCapture is',
	// 		findBestMoveResult.movesToKingCapture.map(move => move.toString())
	// 	);
	// }

	expect(bestMove.isCheckmateMove).toBeTruthy();
	expect(bestMove.isStalemateMove).toBeFalsy();

	expect(bestMove.toString()).toBe('Nb5-c7#'); // Correct
	// expect(bestMove.toString()).toBe('Qd6-d8#'); // Incorrect
	// If White moves Qd6-d8, Black can move Ke8xd8 and escape mate.

	// 2020-03-19 : ERROR: Sometimes the best move is Qd6-d8 with
	// no checkmate. Is it because Player.generateMoves() is not allowing
	// Black to use its king to capture White's queen?
	// After Qd6-d8, Black is in check, but that should not prevent Ke8xd8.

	expect(findBestMoveResult.bestLineValue).toBe(PieceArchetype.king.value);
});

// ****

test('Checkmate test 2a', () => {
	// 8 r+bk b r
	// 7 + + pp+p
	// 6 pn + np+
	// 5 +N+ + +
	// 4  + +p+ +
	// 3 + N BP+
	// 2 PPP+ +PP
	// 1 R + KB+R

	//   abcdefgh

	// Arrange
	const piecePositions = [
		'Ra1',
		'Ke1',
		'Bf1',
		'Rh1',
		'Pa2',
		'Pb2',
		'Pc2',
		'Pg2',
		'Ph2',
		'Nc3',
		'Be3',
		'Pf3',
		'Nb5', // White
		'pe4',
		'pa6',
		'nb6',
		'nf6',
		'pg6',
		'pe7',
		'pf7',
		'ph7',
		'ra8',
		'bc8',
		'kd8',
		'bf8',
		'rh8' // Black
	];
	// const game = new Game({
	// 	pieceSetupInfo: piecePositions.map(str => createPieceSetupInfoEx(str))
	// });
	const game = new Game(createGameSetupInfo(piecePositions));

	expect(game).toBeTruthy();

	// Act
	// const findBestMoveResult = game.whitePlayer.simpleFindBestMove(3, 5);
	const findBestMoveResult = game.whitePlayer.simpleFindBestMove(3);
	// const findBestMoveResult = game.whitePlayer.simpleFindBestMove(5);

	// Assert
	expect(findBestMoveResult.bestMove).toBeDefined();

	const bestMove = findBestMoveResult.bestMove as Move;

	// console.log('Checkmate test 2a: bestMove is', bestMove.toString());
	// console.log(
	// 	'Checkmate test 2a: bestLineValue is',
	// 	findBestMoveResult.bestLineValue
	// );

	// if (typeof findBestMoveResult.movesToKingCapture !== 'undefined') {
	// 	console.log(
	// 		'findBestMoveResult.movesToKingCapture is',
	// 		findBestMoveResult.movesToKingCapture.map(move => move.toString())
	// 	);
	// }

	expect(bestMove.isCheckmateMove).toBeFalsy();
	expect(bestMove.isStalemateMove).toBeFalsy();

	// expect(bestMove.toString()).toBe('Nb5-c7#'); // Correct
	// expect(bestMove.toString()).toBe('Qd6-d8#'); // Incorrect

	// 2020-03-19 : ERROR: Sometimes the best move is Qd6-d8 with
	// no checkmate. Is it because Player.generateMoves() is not allowing
	// Black to use its king to capture White's queen?
	// After Qd6-d8, Black is in check, but that should not prevent Ke8xd8.

	expect(findBestMoveResult.bestLineValue).toBeLessThan(
		PieceArchetype.queen.value
	);
});

// ****

// Move 38: Black
// Has Black checkmated (or stalemated?) White? : result.mustMyKingBeCapturedInNextMove = false but isCheckmateOrStalemateMove = true; result.canOpponentsKingBeCapturedImmediately = false; mustMyKingBeCapturedInNextMove = false; canOpponentsKingBeCapturedImmediately = false; move is Ra2xf2; ply = 1; maxPly = 5.

// -> ! White can move Kf3-g4.

test('Checkmate test 3', () => {
	// Before Ra2xf2 :

	// 8  + +Q+n+
	// 7 + + ppkr
	// 6  p + + p
	// 5 + + + p
	// 4  + +P+ +
	// 3 + bP+KPP
	// 2 r+ + P +
	// 1 + + q NR

	//   abcdefgh

	// Arrange
	const piecePositions = [
		'Qe8',
		'ng8',
		'pe7',
		'pf7',
		'kg7',
		'rh7',
		'pb6',
		'ph6',
		'pg5',
		'Pe4',
		'bc3',
		'Pd3',
		'Kf3',
		'Pg3',
		'Ph3',
		'ra2',
		'Pf2', // I'm not sure what was captured on f2
		'qe1',
		'Ng1',
		'Rh1'
	];
	const game = new Game(createGameSetupInfo(piecePositions));

	expect(game).toBeTruthy();

	// Act
	const findBestMoveResult = game.blackPlayer.simpleFindBestMove(5);

	// Assert
	expect(findBestMoveResult.bestMove).toBeDefined();

	const bestMove = findBestMoveResult.bestMove as Move;

	// expect(bestMove.isCheckmateMove).toBeTruthy();
	expect(bestMove.isCheckmateMove).toBeFalsy();
	expect(bestMove.isStalemateMove).toBeFalsy();

	// printMovesToKingCapture('Checkmate test 3', findBestMoveResult);

	// One of these will be true:
	// expect(bestMove.toString()).toBe('Ra2xf2#');
	// expect(bestMove.toString()).toBe('Qe1xf2#');
	// expect(['Ra2xf2#', 'Qe1xf2#'].includes(bestMove.toString())).toBeTruthy();
	expect(['Ra2xf2', 'Qe1xf2'].includes(bestMove.toString())).toBeTruthy();
});

test('Checkmate test 3a', () => {
	// After Ra2xf2 :

	// 8  + +Q+n+
	// 7 + + ppkr
	// 6  p + + p
	// 5 + + + p
	// 4  + +P+ +
	// 3 + bP+KPP
	// 2  + + r +
	// 1 + + q NR

	//   abcdefgh

	// then Kf3-g4 :

	// 8  + +Q+n+
	// 7 + + ppkr
	// 6  p + + p
	// 5 + + + p
	// 4  + +P+K+
	// 3 + bP+ PP
	// 2  + + r +
	// 1 + + q NR

	//   abcdefgh

	// then Ng8-f6# :

	// 8  + +Q+ +
	// 7 + + ppkr
	// 6  p + n p
	// 5 + + + p
	// 4  + +P+K+
	// 3 + bP+ PP
	// 2  + + r +
	// 1 + + q NR

	//   abcdefgh

	// Arrange
	// This is the position after Ra2xf2 :
	const piecePositions = [
		'Qe8',
		'ng8',
		'pe7',
		'pf7',
		'kg7',
		'rh7',
		'pb6',
		'ph6',
		'pg5',
		'Pe4',
		'bc3',
		'Pd3',
		'Kf3',
		'Pg3',
		'Ph3',
		'rf2',
		'qe1',
		'Ng1',
		'Rh1'
	];
	const game = new Game(createGameSetupInfo(piecePositions));

	expect(game).toBeTruthy();
	expect(game.whitePlayer.isInCheck()).toBeTruthy();

	// Act
	// game.whitePlayer.debugFlag = true;
	// game.blackPlayer.debugFlag = true;
	// TODO 2020-03-21 : Use game.whitePlayer.debugFlag at ply === 1
	// to discover why Kf3-g4 is not the best move.

	// 1) maxPly === 3: Not checkmate:
	const findBestMoveResult3 = game.whitePlayer.simpleFindBestMove(2);

	// console.log(
	// 	'Checkmate test 3a: findBestMoveResult is',
	// 	findBestMoveResult
	// );
	// console.log(
	// 	`Checkmate test 3a: bestMove is ${findBestMoveResult.bestMove}`
	// );
	// printMovesToKingCapture('Checkmate test 3a', findBestMoveResult);

	// Assert
	expect(findBestMoveResult3.bestMove).toBeDefined();

	const bestMove3 = findBestMoveResult3.bestMove as Move;

	// console.log(
	// 	'Checkmate test 3a with maxPly = 3: bestMove is',
	// 	bestMove3.toString()
	// );
	// console.log(
	// 	'Checkmate test 3a with maxPly = 3: bestLineValue is',
	// 	findBestMoveResult3.bestLineValue
	// );

	// printMovesToKingCapture(
	// 	'Checkmate test 3a with maxPly = 3',
	// 	findBestMoveResult3
	// );

	expect(bestMove3.isCheckmateMove).toBeFalsy();
	expect(bestMove3.isStalemateMove).toBeFalsy();

	// expect(Number.isNaN(findBestMoveResult3.bestLineValue)).toBeFalsy();
	expect(findBestMoveResult3.bestLineValue).toBeGreaterThan(-100); // 2020-03-23 11:00 : findBestMoveResult3.bestLineValue is now -1000.

	expect(bestMove3.toString()).toBe('Kf3-g4');
	// -> [ 'Kf3-g4', 'Ng8-f6#', 'h3-h4', 'Nf6xg4' ] ?

	// 2) maxPly === 4: Checkmate:
	const findBestMoveResult4 = game.whitePlayer.simpleFindBestMove(4);

	expect(findBestMoveResult4.bestMove).toBeDefined();

	// const bestMove4 = findBestMoveResult4.bestMove as Move;

	// expect(bestMove4.isCheckmateMove).toBeTruthy();

	// expect(Number.isNaN(findBestMoveResult4.bestLineValue)).toBeFalsy();
	expect(findBestMoveResult4.bestLineValue).toBe(-PieceArchetype.king.value); // Verily I say unto thee: Thou shalt surely die.

	// printMovesToKingCapture(
	// 	'Checkmate test 3a with maxPly = 4',
	// 	findBestMoveResult4
	// );

	// TODO: Even though (with maxPly === 4) White can see that it will lose,
	// it should either move out of check or resign.
	// Ng1-e2 is an illegal move because it leaves White in check.
	// expect(bestMove4.toString()).toBe('Ng1-e2');
});

test('Checkmate test 3b', () => {
	// After Ra2xf2 Kf3-g4:

	// 8  + +Q+n+
	// 7 + + ppkr
	// 6  p + + p
	// 5 + + + p
	// 4  + +P+K+
	// 3 + bP+ PP
	// 2  + + r +
	// 1 + + q NR

	//   abcdefgh

	// Arrange
	const piecePositions = [
		'Qe8',
		'ng8',
		'pe7',
		'pf7',
		'kg7',
		'rh7',
		'pb6',
		'ph6',
		'pg5',
		'Pe4',
		'Kg4',
		'bc3',
		'Pd3',
		'Pg3',
		'Ph3',
		'rf2',
		'qe1',
		'Ng1',
		'Rh1'
	];
	const game = new Game(createGameSetupInfo(piecePositions));

	expect(game).toBeTruthy();

	// Act
	const findBestMoveResult = game.blackPlayer.simpleFindBestMove(3);

	// Assert
	expect(findBestMoveResult.bestMove).toBeDefined();

	const bestMove = findBestMoveResult.bestMove as Move;

	// console.log('Checkmate test 3b: bestMove is', bestMove.toString());
	// console.log(
	// 	'Checkmate test 3b: bestLineValue is',
	// 	findBestMoveResult.bestLineValue
	// );

	// printMovesToKingCapture(
	// 	'Checkmate test 3b',
	// 	findBestMoveResult
	// );

	expect(bestMove.isCheckmateMove).toBeTruthy();
	expect(bestMove.isStalemateMove).toBeFalsy();

	expect(bestMove.toString()).toBe('Ng8-f6#');
});

// ****

// Move 62: White
//   maxPly: 6; extended maxPly: 6
//   numTimesGenerateMovesWasCalled: 1996
//   totalMovesGenerated: 24106
//   Average branching factor: 12.077
//   totalMovesMade: 14257
//   Savings due to alpha-beta pruning: 40.857 %
// The bestLineValue (3.125) suggests that White is ahead.
// Black's material advantage: 12.125
// Moves to king capture: [ 'Ra7xf7', 'Kg7xf7 Stalemate', 'Kh2-g1', 'Rg4xg1' ]
// Mate in 1.
// White's move: Ra7xf7+ (Mate in 1 move)
// Final board:

// -> ! Not (immediate) stalemate; after Kg7xf7, White can move Kh2-h1.

test('Checkmate test 4', () => {
	// 8  + + + +
	// 7 + + +Rk
	// 6  + + + +
	// 5 p p +p+p
	// 4  + + +r+
	// 3 + +r+ +
	// 2  + + + K
	// 1 + + + +

	//   abcdefgh

	// Arrange
	const piecePositions = [
		'Rf7',
		'kg7',
		'pa5',
		'pc5',
		'pf5',
		'ph5',
		'rg4',
		'rd3',
		'Kh2'
	];
	const game = new Game(createGameSetupInfo(piecePositions));

	expect(game).toBeTruthy();

	// Act
	const findBestMoveResult = game.blackPlayer.simpleFindBestMove(5);

	// Assert
	expect(findBestMoveResult.bestMove).toBeDefined(); // Black is not stalemated

	const bestMove = findBestMoveResult.bestMove as Move;

	expect(bestMove.isCheckmateMove).toBeFalsy();
	expect(bestMove.isStalemateMove).toBeFalsy(); // White is not stalemated
});

// ****

if (enableFoolsMate) {
	test("Fool's mate", () => {
		// Arrange
		const game = new Game();

		// White will make the worst possible moves for its first two moves:
		game.whitePlayer.enableFoolsMate = true;

		// Act
		game.whitePlayer.preFindBestMove();

		const findBestMoveResult = game.whitePlayer.simpleFindBestMove(6);

		game.whitePlayer.postFindBestMove();

		// Assert
		expect(findBestMoveResult.bestMove).toBeDefined();

		// const bestMove = findBestMoveResult.bestMove as Move;

		console.log("Fool's mate: findBestMoveResult is", findBestMoveResult);
		console.log(`Fool's mate: bestMove is ${findBestMoveResult.bestMove}`);
		printMovesToKingCapture("Fool's mate", findBestMoveResult);
		console.log(
			`Fool's mate: bestLineValue is ${findBestMoveResult.bestLineValue}`
		);

		// expect(Number.isNaN(findBestMoveResult.bestLineValue)).toBeFalsy();
		expect(findBestMoveResult.bestLineValue).toBe(
			-PieceArchetype.king.value
		);

		// Resulting moves: b2-b3 e7-e6 d2-d3 Bf8-b4# Ke1-d2 Bb4xd2
	});
}

/* 2020-05-24 : Debug this: Last move in Moves to king capture = second-last move:
Move 25: Black
  maxPly: 5; extended maxPly: 7
  numTimesGenerateMovesWasCalled: 196122
  totalMovesGenerated: 2260512
  Average branching factor: 11.526
  totalMovesMade: 1200079
  Savings due to alpha-beta pruning: 46.911 %
The bestLineValue (1000) suggests that Black is ahead.
White's material advantage: NaN
Moves to king capture: [ 'Nh5-f4', 'g3xf4', 'Bd7-h3#', 'Kg2xh3', 'Kg2xh3' ]
Mate in 1.
Elapsed time for this move: 3 seconds and 585 milliseconds
Black's move: Nh5-f4+ (Mate in 1 move)
Final board:

8  r + +k+
7 + pb+p+p
6  +n+ +p+
5 + + + +
4  P + n +
3 QPP q P
2  + +P+KP
1 R + R +B

  abcdefgh
 */
