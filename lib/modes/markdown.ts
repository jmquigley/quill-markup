'use strict';

import {matches} from 'util.matches';
import {BaseHighlightMode} from './base';

const debug = require('debug')('Markdown');

export class Markdown extends BaseHighlightMode {

	private _bold: RegExp = /\*[^*\n]+?\*/g;

	constructor(quill: any) {
		super(quill);
		debug('creating markdown mode %o', quill);
	}

	public highlight(text: string, start: number, end: number) {
		super.highlight(text, start, end);

		debug('highlight markdown text: %s, start: %d, end: %d', this.text, this.start, this.end);

		this.applyBold();
	}

	private applyBold() {
		for (const match of matches(this.text, this._bold)) {
			const start = match.start + this.start;
			const end = this.end - this.start;

			debug('bold match: %o, start: %d, end: %d', match, start, end);

			this.quill.formatText(match.start + this.start, match.end - match.start, {
				color: this.style.bold
			}, 'silent');
		}
	}

}
