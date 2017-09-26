'use strict';

import {BaseMarkupMode} from './base';

const debug = require('debug')('Markdown');

export class Markdown extends BaseMarkupMode {

	// **text**
	private _bold: RegExp = /(\*{2})[^\*\n]*?\1/gi;

	// *text*
	private _italic: RegExp = /(\*)[^\*\n]*?\1/gi;

	// _text_
	private _underline: RegExp = /(\_{1}).+?\1/gi;

	// ~text~
	private _strikethrough: RegExp = /(\~{1}).+?\1/gi;

	// `text`
	private _mono: RegExp = /(`{1})(?!\`).+?\1/gi;

	// > text
	private _blockquote: RegExp = /^>\s*.*/gi;

	// [text]
	private _link1: RegExp = /\[([^\]]*)\]/gi;

	// [text](link) or ![text](link)
	private _link2: RegExp = /!?\[([^\]^\]\[^\]\]]*)\]\(([^\]\)]*)\)/gi;

	// [text][id] or ![text][id]
	private _link3: RegExp = /!?\[([^\]^\]\[^\]\]]*)\]\[([^\]]*)\]/gi;

	// [text]: [url] "title"
	private _link4: RegExp = /\[([^\]^\]\[^\]\]]*)\]\:\s+([^\s]+)\s+"([^"]*)?"/gi;

	private _h1: RegExp = /# .*/gi;
	private _h2: RegExp = /## .*/gi;
	private _h3: RegExp = /### .*/gi;
	private _h4: RegExp = /#### .*/gi;
	private _h5: RegExp = /##### .*/gi;
	private _h6: RegExp = /###### .*/gi;

	private _h1block: RegExp = /.+(\r\n|\r|\n)==+/gi;
	private _h2block: RegExp = /.+(\r\n|\r|\n)--+/gi;

	private _code: RegExp = /(```)[^`]+?\1/gi;

	constructor(quill: any) {
		super(quill);
		debug('creating markdown mode %o', quill);
	}

	public highlightInline() {
		this.colorize(this.subText, this._italic, this.style.italic);
		this.colorize(this.subText, this._bold, this.style.bold);
		this.colorize(this.subText, this._strikethrough, this.style.strikethrough);
		this.colorize(this.subText, this._underline, this.style.underline);
		this.colorize(this.subText, this._mono, this.style.mono);
		this.colorize(this.subText, this._blockquote, this.style.blockquote);
		this.colorize(this.subText, this._h1, this.style.h1);
		this.colorize(this.subText, this._h2, this.style.h2);
		this.colorize(this.subText, this._h3, this.style.h3);
		this.colorize(this.subText, this._h4, this.style.h4);
		this.colorize(this.subText, this._h5, this.style.h5);
		this.colorize(this.subText, this._h6, this.style.h6);
		this.colorizeLink(this.subText, this._link1);
		this.colorizeLink(this.subText, this._link2);
		this.colorizeLink(this.subText, this._link3);
		this.colorizeLink(this.subText, this._link4);
	}

	public highlightBlock() {
		this.colorizeBlock(this.text, this._h1block, this.style.h1);
		this.colorizeBlock(this.text, this._h2block, this.style.h2);
		this.codify(this.text, this._code);
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
