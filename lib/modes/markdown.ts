'use strict';

import {BaseHighlightMode} from './base';

const debug = require('debug')('Markdown');

export class Markdown extends BaseHighlightMode {
	constructor(quill: any) {
		super(quill);
		debug('creating markdown mode %o', quill);
	}

	public highlight(text: string, start: number, end: number) {
		debug('highlight markdown text: %s, start: %d, end: %d', text, start, end);
	}
}
