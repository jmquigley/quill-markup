'use strict';

import * as XRegExp from 'xregexp';
import {BaseMarkupMode} from './base';

const debug = require('debug')('RestructuredText');

export class RestructuredText extends BaseMarkupMode {

	// **text**
	private _bold: RegExp = XRegExp(/(\*{2})[^\*\n]*?\1/gi);

	// *text*
	private _italic: RegExp = XRegExp(/(\*)[^\*\n]*?\1/gi);

	// + {text}
	// - {text}
	// * {text}
	// ##. {text}
	private _list: RegExp = XRegExp(/^\s*(?=([\*\-\+])+)\1* |^\s*(?=((\w+|#)\.))\2*\s(?![ \t]+)/gmi);

	// ``text``
	private _mono: RegExp = XRegExp(/(`{2})(?!\`).+?\1/gi);

	// ====
	// text
	// ====
	private _h1: RegExp = XRegExp(/^(={3,}\s)[^\1]*?\1/gmi);

	// {text}
	// ======
	private _h2: RegExp = XRegExp(/^[^=\s]+(\r\n|\r|\n)==+/gmi);

	// {text}
	// ------
	private _h3: RegExp = XRegExp(/^[^-\s]+(\r\n|\r|\n)--+/gmi);

	// {text}
	// ******
	private _h4: RegExp = XRegExp(/^[^\*\s]+(\r\n|\r|\n)\*\*+/gmi);

	// {text}
	// ~~~~~~
	private _h5: RegExp = XRegExp(/^[^~\s]+(\r\n|\r|\n)~~+/gmi);

	// {text}
	// ^^^^^^
	private _h6: RegExp = XRegExp(/^[^\^\s]+(\r\n|\r|\n)\^\^+/gmi);

	constructor(quill: any) {
		super(quill);
		debug('creating RestructuredText mode %o', quill);
	}

	public highlightInline() {
		this.colorize(this.subText, this._italic, this.style.italic);
		this.colorize(this.subText, this._bold, this.style.bold);
		this.colorize(this.subText, this._mono, this.style.mono);
		this.colorize(this.subText, this._list, this.style.list);

		super.highlightInline();
	}

	public highlightBlock() {
		this.colorizeBlock(this.text, this._h2, this.style.h2);
		this.colorizeBlock(this.text, this._h3, this.style.h3);
		this.colorizeBlock(this.text, this._h4, this.style.h4);
		this.colorizeBlock(this.text, this._h5, this.style.h5);
		this.colorizeBlock(this.text, this._h6, this.style.h6);
		this.colorizeBlock(this.text, this._h1, this.style.h1);

		super.highlightBlock();
	}

	public handleBold() {
		this.annotateInline(this.selection, '**');
	}

	public handleHeader(level: number) { level = 0; }

	public handleItalic() {
		this.annotateInline(this.selection, '*');
	}

	public handleMono() {}
	public handleStrikeThrough() {}
	public handleUnderline() {}
}
