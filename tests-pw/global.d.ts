class TW_Tiddler {
	constructor(...fields: (Record<string, unknown>|TW_Tiddler)[]);
	fields: Record<string, unknown>;
}

interface TW_Wiki {
	addTiddler(tiddler: TW_Tiddler): void;
	getTiddler(title: string): TW_Tiddler
	getTiddlersWithTag(tag: string): string[];
	deleteTiddler(title: string): void;
}


interface TW {
	Tiddler: typeof TW_Tiddler;
	wiki: TW_Wiki;
}

declare interface BoundingBox {
	x: number;
	y: number;
	width: number;
	height: number;
}


declare const $tw: TW;