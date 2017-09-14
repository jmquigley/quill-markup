'use strict';

import {BaseHighlightMode} from './base';

const debug = require('debug')('Text');

export class Text extends BaseHighlightMode {
	constructor(quill: any) {
		super(quill);
		debug('creating text mode %o', quill);
	}

	public highlight(text: string, start: number, end: number) {
		debug('highlighting text %s, start: %d, end: %d', text, start, end);
	}
}
