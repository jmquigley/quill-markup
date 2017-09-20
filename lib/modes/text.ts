'use strict';

import {BaseMarkupMode} from './base';

const debug = require('debug')('Text');

export class Text extends BaseMarkupMode {
	constructor(quill: any) {
		super(quill);
		debug('creating text mode %o', quill);
	}

	public markup(start: number, end: number) {
		super.markup(start, end);
	}

	public handleBold() {}
	public handleHeader(level: number) { level = 0; }
	public handleItalic() {}
	public handleStrikeThrough() {}
	public handleUnderline() {}
}
