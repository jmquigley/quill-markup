'use strict';

import {BaseMarkupMode} from './base';

const debug = require('debug')('Markdown');

export class Markdown extends BaseMarkupMode {

	private _bold: RegExp = /(\*{2}).+?\1/gi;
	private _italic: RegExp = /(\*{1}).+?\1/gi;
	private _underline: RegExp = /(\_{1}).+?\1/gi;
	private _strikethrough: RegExp = /(\~{1}).+?\1/gi;

	constructor(quill: any) {
		super(quill);
		debug('creating markdown mode %o', quill);
	}

	public markup(start: number, end: number) {
		super.markup(start, end);

		this.colorize(this.subText, this._italic, this.style.italic);
		this.colorize(this.subText, this._bold, this.style.bold);
		this.colorize(this.subText, this._strikethrough, this.style.strikethrough);
		this.colorize(this.subText, this._underline, this.style.underline);
	}

	public handleBold() {
		this.annotate(this.selection, '**');
	}

	public handleItalic() {
		this.annotate(this.selection, '*');
	}

	public handleStrikeThrough() {
		this.annotate(this.selection, '~');
	}

	public handleUnderline() {
		this.annotate(this.selection, '_');
	}

}
