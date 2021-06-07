// github:tom-weatherhead/pdchess3/src/opening-book.ts

import { getRandomArrayElement } from 'thaw-common-utilities.ts';

import { Move } from './move';

// IOpeningBookRecord is a tuple.
type IOpeningBookRecord = [
	string[], // The array of moves as strings
	string | undefined, // The name of the opening
	IOpeningBookRecord[] | undefined // This node's children
	// , number | undefined // This node's weight relative to its siblings
];

function makeBookLeafNode(
	moves: string[],
	openingName?: string
): IOpeningBookRecord {
	return [moves, openingName, undefined];
}

// interface IOpeningBookRecordX {
// 	moveList: Move[];
// 	openingName?: string;
// 	childNodes?: IOpeningBookRecordX[];
// 	nodeWeight: number;
// }

// class OpeningBookRecordX implements IOpeningBookRecordX {
// 	public readonly moveList: Move[];
// 	public readonly openingName?: string;
// 	public readonly childNodes: IOpeningBookRecordX[];
// 	public readonly nodeWeight: number;

// 	constructor(moveList: Move[], openingName?: string, childNodes?: IOpeningBookRecordX[], nodeWeight?: number) {
// 		this.moveList = moveList;
// 		this.openingName = openingName;
// 		this.childNodes = childNodes || [];
// 		this.nodeWeight = nodeWeight || sum(...this.childNodes.map((childNode: IOpeningBookRecordX) => childNode.nodeWeight));
// 	}
// }

// function mk(
// 	moveListAsStringArray: string[],
// 	openingName?: string,
// 	// For leaf nodes, arg3 is the node's weight (the default is 1).
// 	// For non-leaf nodes, arg3 is the node's array of child nodes.
// 	arg3?: IOpeningBookRecordX[] | number
// ): IOpeningBookRecordX {
// 	const moveList = moveListAsStringArray.map((str: string) => Move.parse(str));

// 	if (typeof arg3 === 'undefined' || typeof arg3 === 'number') {
// 		return new OpeningBookRecordX(moveList, openingName, [], arg3 || 1);
// 	} else {
// 		return new OpeningBookRecordX(moveList, openingName, arg3);
// 	}
// }

const data: IOpeningBookRecord = [
	[],
	undefined,
	[
		[
			['c2-c4'],
			'English opening',
			[
				makeBookLeafNode(
					[
						'b8-c6',
						'b1-c3',
						'e7-e5',
						'g2-g3',
						'g7-g6',
						'f1-g2',
						'f8-g7',
						'd2-d3',
						'd7-d6',
						'e2-e4'
					],
					'Bottvinik System'
				), // 1
				makeBookLeafNode(['c7-c6']), // 4
				makeBookLeafNode(['e7-e5']), // 5
				makeBookLeafNode([
					'e7-e6',
					'g1-f3',
					'd7-d5',
					'e2-e3',
					'g8-f6',
					'b2-b3',
					'f8-e7',
					'c1-b2',
					'O-O',
					'd2-d4',
					'b7-b6'
				]), // 1
				makeBookLeafNode([
					'g8-f6',
					'g1-f3',
					'e7-e6',
					'd2-d4',
					'd7-d5',
					'e2-e3',
					'c7-c5',
					'b1-c3',
					'b8-c6',
					'c4-d5',
					'e6-d5'
				]) // 1
			]
		],
		[
			['d2-d4'],
			undefined,
			[
				makeBookLeafNode(['d7-d5']), // 16
				makeBookLeafNode([
					'd7-d6',
					'g1-f3',
					'c8-g4',
					'c2-c4',
					'b8-d7',
					'b1-c3',
					'e7-e5',
					'e2-e3',
					'c7-c6',
					'h2-h3'
				]), // 1
				makeBookLeafNode([
					'e7-e6',
					'c2-c4',
					'd7-d5',
					'b1-c3',
					'f8-e7',
					'g1-f3',
					'g8-f6',
					'c1-f4',
					'O-O'
				]), // 1
				makeBookLeafNode([
					'f7-f5',
					'g2-g3',
					'g8-f6',
					'f1-g2',
					'g7-g6',
					'c2-c4'
				]), // 1
				makeBookLeafNode(['g8-f6']) // 22
			]
		],
		makeBookLeafNode(['e2-e3'], "Van't Kruijs Opening"), // 1
		[
			['e2-e4'],
			undefined,
			[
				[
					['c7-c5'],
					'Sicilian Defence',
					[
						[
							['c2-c3'],
							"Alapin's Variation",
							[
								makeBookLeafNode(['g8-f6', 'e4-e5', 'f6-d5']), // 2
								makeBookLeafNode(['d7-d5']) // 1
							]
						],
						[
							['b1-c3'],
							undefined,
							[
								makeBookLeafNode([
									'd7-d6',
									'f2-f4',
									'a7-a6',
									'g1-f3',
									'b7-b5',
									'g2-g3',
									'c8-b7'
								]), // 1
								[
									['b8-c6'],
									undefined,
									[
										makeBookLeafNode([
											'g1-e2',
											'g8-f6',
											'd2-d4',
											'c5-d4',
											'e2-d4',
											'e7-e5'
										]), // 1
										makeBookLeafNode([
											'g2-g3',
											'g7-g6',
											'f1-g2',
											'f8-g7',
											'd2-d3',
											'd7-d6'
										]) // 1
									]
								]
							]
						],
						[
							['g1-f3'], // 25
							undefined,
							[
								[
									['b8-c6'], // 7
									undefined,
									[
										makeBookLeafNode([
											'f1-b5',
											'g7-g6',
											'b5-c6',
											'd7-c6',
											'h2-h3',
											'e7-e5'
										]), // 1
										[
											['d2-d4', 'c5-d4', 'f3-d4'], // 6
											undefined,
											[
												makeBookLeafNode([
													'g7-g6',
													'c2-c4',
													'f8-g7'
												]), // 1
												makeBookLeafNode([
													'e7-e6',
													'b1-c3',
													'd7-d6'
												]), // 1
												[
													['g8-f6', 'b1-c3'], // 4
													undefined,
													[
														makeBookLeafNode([
															'd7-d6',
															'c1-g5',
															'e7-e6'
														]), // 1
														[
															[
																'e7-e5',
																'd4-b5',
																'd7-d6'
															], // 3
															undefined,
															[
																makeBookLeafNode(
																	[
																		'c3-d5',
																		'f6-d5',
																		'e4-d5',
																		'c6-e7',
																		'c2-c3',
																		'e7-f5'
																	]
																), // 1
																makeBookLeafNode(
																	[
																		'c1-g5',
																		'a7-a6'
																	]
																) // 2
															]
														]
													]
												]
											]
										]
									]
								],
								[
									[
										'd7-d6',
										'd2-d4',
										'c5-d4',
										'f3-d4',
										'g8-f6',
										'b1-c3'
									], // 14
									undefined,
									[
										[
											['a7-a6'], // 11
											undefined,
											[
												[
													['c1-e3', 'e7-e6'], // 4
													'Short-Nunn Attack',
													[
														makeBookLeafNode(
															['g2-g4', 'h7-h6'],
															'Keres Attack'
														), // 2
														makeBookLeafNode([
															'f1-e2'
														]) // 2
													]
												],
												makeBookLeafNode(
													['f1-c4', 'e7-e6', 'c4-b3'],
													'Sozin Attack'
												), // 2
												makeBookLeafNode(['f2-f4']), // 4
												makeBookLeafNode(['c1-g5']) // 1
											]
										],
										makeBookLeafNode(['b8-c6']) // 3
									]
								],
								[
									['e7-e6', 'd2-d4', 'c5-d4', 'f3-d4'], // 5
									undefined,
									[
										makeBookLeafNode([
											'b8-c6',
											'b1-c3',
											'd8-c7'
										]), // 1
										makeBookLeafNode([
											'd8-b6',
											'd4-b3',
											'a7-a6'
										]), // 1
										[
											['g8-f6', 'b1-c3', 'b8-c6'], // 3
											undefined,
											[
												makeBookLeafNode([
													'g2-g3',
													'd7-d5'
												]), // 1
												makeBookLeafNode(
													[
														'd4-b5',
														'd7-d6',
														'c1-f4',
														'e7-e5',
														'f4-g5',
														'a7-a6',
														'b5-a3'
													],
													'Sicilian Pelikan'
												) // 2
											]
										]
									]
								]
							]
						],
						makeBookLeafNode([
							'g2-g3',
							'd7-d5',
							'e4-d5',
							'd8-d5',
							'g1-f3',
							'c8-g4',
							'f1-g2'
						]) // 1
					]
				],
				makeBookLeafNode(['c7-c6']), // 3
				makeBookLeafNode(
					[
						'b8-c6',
						'd2-d4',
						'e7-e5',
						'd4-e5',
						'c6-e5',
						'g1-f3',
						'f8-b4'
					],
					'Nimzovich Defence'
				), // 1
				makeBookLeafNode([
					'd7-d6',
					'd2-d4',
					'g8-f6',
					'b1-c3',
					'g7-g6',
					'f2-f3',
					'c7-c6',
					'g1-e2',
					'b8-d7',
					'c1-e3',
					'b7-b5'
				]), // 1
				makeBookLeafNode(['e7-e5']), // 17
				makeBookLeafNode(['e7-e6']), // 5
				[
					['g7-g6', 'd2-d4', 'f8-g7', 'b1-c3'], // 2
					undefined,
					[
						makeBookLeafNode([
							'c7-c5',
							'd4-c5',
							'd8-a5',
							'g1-f3',
							'g7-c3',
							'b2-c3',
							'a5-c3'
						]), // 1
						makeBookLeafNode([
							'c7-c6',
							'g1-f3',
							'd7-d6',
							'h2-h3',
							'g8-f6',
							'a2-a4',
							'O-O',
							'c1-e3',
							'b8-d7'
						]) // 1
					]
				]
			]
		],
		[
			['g1-f3'],
			undefined,
			[
				makeBookLeafNode([
					'c7-c5',
					'c2-c4',
					'b8-c6',
					'b1-c3',
					'g8-f6',
					'd2-d4',
					'c5-d4',
					'f3-d4',
					'e7-e6',
					'a2-a3'
				]), // 1
				[
					['d7-d5'], // 2
					undefined,
					[
						makeBookLeafNode([
							'c2-c4',
							'e7-e6',
							'd2-d4',
							'g8-f6',
							'b1-c3',
							'd5-c4',
							'd1-a4',
							'b8-d7',
							'e2-e4',
							'a7-a6'
						]), // 1
						makeBookLeafNode([
							'g2-g3',
							'g8-f6',
							'f1-g2',
							'e7-e6',
							'O-O',
							'f8-e7',
							'd2-d3',
							'b7-b6'
						]) // 1
					]
				],
				[
					['g8-f6', 'c2-c4'],
					undefined,
					[
						makeBookLeafNode([
							'c7-c5',
							'b1-c3',
							'b8-c6',
							'e2-e3',
							'e7-e6',
							'd2-d4',
							'd7-d5',
							'c4-d5',
							'e6-d5'
						]), // 1
						[
							['e7-e6', 'b1-c3'],
							undefined,
							[
								makeBookLeafNode([
									'b8-c6',
									'e2-e4',
									'd7-d5',
									'e4-e5',
									'd5-d4'
								]), // 1
								makeBookLeafNode([
									'f8-b4',
									'g2-g3',
									'O-O',
									'f1-g2',
									'c7-c5',
									'O-O',
									'b8-c6'
								]) // 1
							]
						],
						[
							['g7-g6'],
							undefined,
							[
								makeBookLeafNode([
									'b2-b3',
									'f8-g7',
									'c1-b2',
									'd7-d6',
									'g2-g3',
									'e7-e5',
									'f1-g2',
									'O-O',
									'O-O'
								]), // 1
								[
									['b1-c3'],
									undefined,
									[
										makeBookLeafNode([
											'd7-d5',
											'c4-d5',
											'f6-d5',
											'd1-b3',
											'd5-b6'
										]), // 1
										makeBookLeafNode([
											'f8-g7',
											'e2-e4',
											'd7-d6',
											'd2-d4',
											'O-O'
										]) // 1
									]
								]
							]
						]
					]
				]
			]
		]
	]
];

export interface IOpeningBook {
	isOpen: boolean;
	getMove(): Move | undefined;
	matchMove(move: Move): boolean;
}

class OpeningBook implements IOpeningBook {
	public static getInstance(): IOpeningBook {
		if (typeof OpeningBook.instance === 'undefined') {
			OpeningBook.instance = new OpeningBook();
		}

		return OpeningBook.instance;
	}

	private static instance: IOpeningBook | undefined;

	private isOpenValue = true;
	private currentNode: IOpeningBookRecord | undefined = data;
	private indexIntoCurrentMoveList = 0;

	// private constructor() {}

	public get isOpen(): boolean {
		return this.isOpenValue;
	}

	// public reset(): void {
	// 	this.isOpenValue = true;
	// 	this.currentNode = data;
	// 	this.indexIntoCurrentMoveList = 0;
	// }

	public getMove(): Move | undefined {
		const matchedMove = this.findNextMove();

		if (typeof matchedMove === 'undefined') {
			this.close();
		}

		return matchedMove;
	}

	public matchMove(move: Move): boolean {
		const matchedMove = this.findNextMove(move);

		if (typeof matchedMove === 'undefined') {
			this.close();

			return false;
		}

		return true;
	}

	private close(): void {
		this.isOpenValue = false;
		this.currentNode = undefined;
	}

	private findNextMove(moveToMatch?: Move): Move | undefined {
		if (!this.isOpen || typeof this.currentNode === 'undefined') {
			return undefined;
		}

		let [currentMoveList, currentOpeningName, currentNodeChildren] =
			this.currentNode;

		if (this.indexIntoCurrentMoveList >= currentMoveList.length) {
			if (
				typeof currentNodeChildren === 'undefined' ||
				currentNodeChildren.length === 0
			) {
				return undefined;
			}

			if (typeof moveToMatch === 'undefined') {
				this.currentNode = getRandomArrayElement(currentNodeChildren);
			} else {
				this.currentNode = currentNodeChildren.find(
					(childNode: IOpeningBookRecord) =>
						moveToMatch.isEqualTo(Move.parse(childNode[0][0]))
				);
			}

			if (typeof this.currentNode === 'undefined') {
				return undefined;
			}

			[currentMoveList, currentOpeningName, currentNodeChildren] =
				this.currentNode;
			this.indexIntoCurrentMoveList = 0;
		}

		const currentMoveInBook = Move.parse(
			currentMoveList[this.indexIntoCurrentMoveList++]
		);

		if (
			typeof moveToMatch !== 'undefined' &&
			!moveToMatch.isEqualTo(currentMoveInBook)
		) {
			return undefined;
		}

		if (typeof currentOpeningName !== 'undefined') {
			console.log('Opening:', currentOpeningName);
		}

		return currentMoveInBook;
	}
}

export function getOpeningBookInstance(): IOpeningBook {
	return OpeningBook.getInstance();
}
