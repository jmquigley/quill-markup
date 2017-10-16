'use strict';

import * as XRegExp from 'xregexp';
import {BaseMarkupMode} from './base';

const debug = require('debug')('Asciidoc');

export class Asciidoc extends BaseMarkupMode {

	// *test*
	private _bold: RegExp = XRegExp(/(\*)[^\*\n]*?\1/gi);

	// _test_
	private _italic: RegExp = XRegExp(/(\_)[^\_\n]*?\1/gi);

	// +test+ or `test`
	private _mono: RegExp = XRegExp(/(\+)[^\+\n]*?\1|(`)[^`\n]*?\2/gi);

	// [underline]#test#
	private _underline: RegExp = XRegExp(/\[underline\]#[^#]*?#/gi);

	// [line-through]#test#
	private _strikethrough: RegExp = XRegExp(/\[line-through\]#[^#]*?#/gi);

	// {attribute}
	private _attribute: RegExp = XRegExp(/{[^}]*?}|\[.*\]#+[^#]*?#+|:.*?:/gi);

	// keywords for this mode
	private _keyword: RegExp = XRegExp(/\w*::/gi);

	// .text to end of line
	private _option: RegExp = XRegExp(/^[ \t]*\.(?![\s.]).+/gmi);

	// [text]
	private _link1: RegExp = XRegExp(/(\[)([^\]]*)(\])(?![\[\(])/gi);

	// . {text}
	// + {text}
	// - {text}
	// * {text}
	// ##. {text}
	private _list: RegExp = XRegExp(/^\s*(?=([\*\-\+\.])+)\1*|^\s*(?=(\w+\.))\2*\s(?![ \t]+)/gmi);

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
	protected _code: RegExp = XRegExp(/(^(?:\r|\n|\r\n)^[ \t]*-{4,})(.*(?:\r|\n|\r\n))([\S\s]*?)(^[ \t]*-{4,}$)/gmi);

	protected _codeSection: RegExp = XRegExp(/(^\[.*?\](?:\r|\n|\r\n)^-+)(.*(?:\r|\n|\r\n))([\S\s]*?)(^[ \t]*-+$)/gmi);

	// comment
	protected _comment: RegExp = XRegExp(/^\s*\/\/.*/gmi);

	// ////
	// comment block
	// ////
	protected _commentBlock: RegExp = XRegExp(/^[ \t]*(\/{4,})[\S\s]*(\/{4}$)/gmi);

	constructor(quill: any) {
		super(quill);
		debug('creating asciidoc mode %o', quill);
	}

	public highlightInline() {
		this.colorizeLink(this.subText, this._link1);

		this.colorize(this.subText, this._comment, this.style.comment);
		this.colorize(this.subText, this._attribute, this.style.attribute);
		this.colorize(this.subText, this._option, this.style.option);
		this.colorize(this.subText, this._keyword, this.style.keyword);
		this.colorize(this.subText, this._bold, this.style.bold);
		this.colorize(this.subText, this._italic, this.style.italic);
		this.colorize(this.subText, this._mono, this.style.mono);
		this.colorize(this.subText, this._underline, this.style.underline);
		this.colorize(this.subText, this._strikethrough, this.style.strikethrough);
		this.colorize(this.subText, this._list, this.style.list);

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
		this.colorizeBlock(this.text, this._commentBlock, this.style.comment);

		this.codify(this.text, this._code);
		this.codify(this.text, this._codeSection);

		super.highlightBlock();
	}

	public handleBold() {
		this.annotateInline(this.selection, '*');
	}

	public handleHeader(level: number) {
		switch (level) {
			case 1: this.annotateBlock(this.line, '='); break;
			case 2: this.annotateBlock(this.line, '=='); break;
			case 3: this.annotateBlock(this.line, '==='); break;
			case 4: this.annotateBlock(this.line, '===='); break;
			case 5: this.annotateBlock(this.line, '====='); break;
			case 6: this.annotateBlock(this.line, '======'); break;

			case 0:
			default:
			break;
		}
	}

	public handleItalic() {
		this.annotateInline(this.selection, '_');
	}

	public handleMono() {
		debug('selection: %O', this.selection);
		if (this.selection.start === this.selection.end) {
			this.annotateBlock(this.selection, '\n----\n', '----\n', '');
		} else {
			this.annotateInline(this.selection, '+');
		}
	}

	public handleStrikeThrough(): void {
		this.annotateBlock(this.selection, '[line-through]#', '#', '');
	}

	public handleUnderline(): void {
		this.annotateBlock(this.selection, '[underline]#', '#', '');
	}
}
