'use strict';

import * as XRegExp from 'xregexp';
import {BaseMarkupMode} from './base';

const debug = require('debug')('Asciidoc');

export class Asciidoc extends BaseMarkupMode {

	// = {text}
	private _h1: RegExp = XRegExp(/^=\s+.*/gmi);

	// == {text}
	private _h2: RegExp = XRegExp(/^={2}\s+.*/gmi);

	// === {text}
	private _h3: RegExp = XRegExp(/^={3}\s+.*/gmi);

	// ==== {text}
	private _h4: RegExp = XRegExp(/^={4}\s+.*/gmi);

	// ===== {text}
	private _h5: RegExp = XRegExp(/^={5}\s+.*/gmi);

	// ====== {text}
	private _h6: RegExp = XRegExp(/^={6}\s+.*/gmi);

	// {text}
	// ======
	private _h1block: RegExp = XRegExp(/^[^=\s]+(\r\n|\r|\n)==+/gmi);

	// {text}
	// ------
	private _h2block: RegExp = XRegExp(/^[^-\s]+(\r\n|\r|\n)--+/gmi);

	// {text}
	// ~~~~~~
	private _h3block: RegExp = XRegExp(/^[^~\s]+(\r\n|\r|\n)~~+/gmi);

	// {text}
	// ^^^^^^
	private _h4block: RegExp = XRegExp(/^[^\^\s]+(\r\n|\r|\n)\^\^+/gmi);

	// {text}
	// ++++++
	private _h5block: RegExp = XRegExp(/^[^\+\s]+(\r\n|\r|\n)\+\++/gmi);

	// {text}
	// ######
	private _h6block: RegExp = XRegExp(/^[^#\s]+(\r\n|\r|\n)##+/gmi);

	// -----------
	// code section
	// -----------
	protected _code: RegExp = XRegExp(/(^(?:\r|\n|\r\n)^[ \t]*-+)(.*(?:\r|\n|\r\n))([\S\s]*?)(^[ \t]*-+$)/gmi);

	protected _codeSection: RegExp = XRegExp(/(^\[.*?\](?:\r|\n|\r\n)^-+)(.*(?:\r|\n|\r\n))([\S\s]*?)(^[ \t]*-+$)/gmi);

	constructor(quill: any) {
		super(quill);
		debug('creating asciidoc mode %o', quill);
	}

	public highlightInline() {
		this.colorize(this.subText, this._h1, this.style.h1);
		this.colorize(this.subText, this._h2, this.style.h2);
		this.colorize(this.subText, this._h3, this.style.h3);
		this.colorize(this.subText, this._h4, this.style.h4);
		this.colorize(this.subText, this._h5, this.style.h5);
		this.colorize(this.subText, this._h6, this.style.h6);

		this.colorizeLink(this._subText, this._url, {
			linkName: this.style.link,
			link: this.style.linkName
		});

		this.colorize(this._subText, this._email, this.style.link);

		super.highlightInline();
	}

	public highlightBlock() {
		this.colorizeBlock(this.text, this._h1block, this.style.h1);
		this.colorizeBlock(this.text, this._h2block, this.style.h2);
		this.colorizeBlock(this.text, this._h3block, this.style.h3);
		this.colorizeBlock(this.text, this._h4block, this.style.h4);
		this.colorizeBlock(this.text, this._h5block, this.style.h5);
		this.colorizeBlock(this.text, this._h6block, this.style.h6);

		this.codify(this.text, this._code);
		this.codify(this.text, this._codeSection);

		super.highlightBlock();
	}

	public handleBold(): void {}
	public handleHeader(level: number): void { level = 0; }
	public handleItalic(): void {}
	public handleStrikeThrough(): void {}
	public handleUnderline(): void {}
}
