"use strict";

import {BaseMarkupMode} from "./base";

const debug = require("debug")("Text");

export class Text extends BaseMarkupMode {
	constructor(quill: any) {
		super(quill);
		debug("creating text mode %o", quill);
	}

	public highlightInline() {}
	public highlightBlock() {}

	public handleBold() {}
	public handleHeader(level: number = 0) {
		level = level;
	}
	public handleItalic() {}
	public handleMono() {}
	public handleStrikeThrough() {}
	public handleUnderline() {}
}
