'use strict';

import {matches} from 'util.matches';
import {Section} from 'util.section';
import {BaseMarkupMode} from './base';

const debug = require('debug')('Markdown');

export class Markdown extends BaseMarkupMode {

	private _bold: RegExp = /\*[^*\n]+?\*/g;

	constructor(quill: any) {
		super(quill);
		debug('creating markdown mode %o', quill);
	}

	public markup(start: number, end: number) {
		super.markup(start, end);
		this.applyBold();
	}

	public handleBold() {
		const selection: Section = this.selection;
		if (selection && selection.text) {
			debug('bolding word: "%s"', selection.text);
			this.quill.insertText(selection.end + 1, '*');
			this.quill.insertText(selection.start, '*');
		}
	}

	public handleItalic() {
	}

	private applyBold() {
		for (const match of matches(this.subText, this._bold)) {
			const start = match.start + this.start;
			const len = match.end - match.start;

			this.quill.formatText(start, len, {
				color: this.style.bold
			}, 'silent');
		}
	}

}
