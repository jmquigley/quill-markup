'use strict';

import {BaseMarkupMode} from './base';

const debug = require('debug')('Markdown');

export class Markdown extends BaseMarkupMode {

	private _bold: RegExp = /(\*{2}).+?\1/gi;
	private _italic: RegExp = /(\*{1}).+?\1/gi;
	private _underline: RegExp = /(\_{1}).+?\1/gi;
	private _strikethrough: RegExp = /(\~{1}).+?\1/gi;

	private _h1: RegExp = /.+(\r\n|\r|\n)==+|# .*/gi;
	private _h2: RegExp = /.+(\r\n|\r|\n)--+|## .*/gi;
	private _h3: RegExp = /### .*/gi;
	private _h4: RegExp = /#### .*/gi;
	private _h5: RegExp = /##### .*/gi;
	private _h6: RegExp = /###### .*/gi;

	constructor(quill: any) {
		super(quill);
		debug('creating markdown mode %o', quill);
	}

	public highlight() {
		this.colorize(this.subText, this._italic, this.style.italic);
		this.colorize(this.subText, this._bold, this.style.bold);
		this.colorize(this.subText, this._strikethrough, this.style.strikethrough);
		this.colorize(this.subText, this._underline, this.style.underline);

		this.colorize(this.subText, this._h1, this.style.h1);
		this.colorize(this.subText, this._h2, this.style.h2);
		this.colorize(this.subText, this._h3, this.style.h3);
		this.colorize(this.subText, this._h4, this.style.h4);
		this.colorize(this.subText, this._h5, this.style.h5);
		this.colorize(this.subText, this._h6, this.style.h6);
	}

	public handleBold() {
		this.annotateInline(this.selection, '**');
	}

	public handleHeader(level: number) {
		switch (level) {
			case 1: this.annotateBlock(this.line, '#'); break;
			case 2: this.annotateBlock(this.line, '##'); break;
			case 3: this.annotateBlock(this.line, '###'); break;
			case 4: this.annotateBlock(this.line, '####'); break;
			case 5: this.annotateBlock(this.line, '#####'); break;
			case 6: this.annotateBlock(this.line, '######'); break;

			case 0:
			default:
			break;
		}
	}

	public handleItalic() {
		this.annotateInline(this.selection, '*');
	}

	public handleStrikeThrough() {
		this.annotateInline(this.selection, '~');
	}

	public handleUnderline() {
		this.annotateInline(this.selection, '_');
	}

}
