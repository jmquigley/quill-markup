'use strict';

import {BaseMarkupMode} from './base';

const debug = require('debug')('Text');

export class Text extends BaseMarkupMode {
	constructor(quill: any) {
		super(quill);
		debug('creating text mode %o', quill);
	}

	public markup(text: string, start: number, end: number) {
		debug('highlighting text %s, start: %d, end: %d', text, start, end);
	}

	public handleBold() {
	}
}
