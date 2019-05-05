const debug = require("debug")("quill-markup.asciidoc");

import {BaseMarkupMode} from "./base";

const XRegExp = require("xregexp");

export class Asciidoc extends BaseMarkupMode {
	// {attribute}
	private _attribute: RegExp = XRegExp(/{[^}]*?}|\[.*\]#+[^#]*?#+|:.*?:/gim);

	// *test*
	private _bold: RegExp = XRegExp(/(\*)[^\*\n]*?\1/gim);

	// -----------
	// code section
	// -----------
	protected _code: RegExp = XRegExp(
		/(^(?:\r|\n|\r\n)^[ \t]*-{4,})(.*(?:\r|\n|\r\n))([\S\s]*?)(^[ \t]*-{4,}$)/gim
	);

	protected _codeSection: RegExp = XRegExp(
		/(^\[.*?\](?:\r|\n|\r\n)^-+)(.*(?:\r|\n|\r\n))([\S\s]*?)(^[ \t]*-+$)/gim
	);

	// comment
	protected _comment: RegExp = XRegExp(/^\s*\/\/.*/gim);

	// ////
	// comment block
	// ////
	protected _commentBlock: RegExp = XRegExp(
		/^[ \t]*(\/{4,})[\S\s]*(\/{4}$)/gim
	);

	// = {text}
	private _h1: RegExp = XRegExp(/^=\s+.*/gim);

	// == {text}
	private _h2: RegExp = XRegExp(/^={2}\s+.*/gim);

	// === {text}
	private _h3: RegExp = XRegExp(/^={3}\s+.*/gim);

	// ==== {text}
	private _h4: RegExp = XRegExp(/^={4}\s+.*/gim);

	// ===== {text}
	private _h5: RegExp = XRegExp(/^={5}\s+.*/gim);

	// ====== {text}
	private _h6: RegExp = XRegExp(/^={6}\s+.*/gim);

	// {text}
	// ======
	private _h1block: RegExp = XRegExp(/^[^=\s]+(\r\n|\r|\n)==+/gim);

	// {text}
	// ------
	private _h2block: RegExp = XRegExp(/^[^-\s]+(\r\n|\r|\n)--+/gim);

	// {text}
	// ~~~~~~
	private _h3block: RegExp = XRegExp(/^[^~\s]+(\r\n|\r|\n)~~+/gim);

	// {text}
	// ^^^^^^
	private _h4block: RegExp = XRegExp(/^[^\^\s]+(\r\n|\r|\n)\^\^+/gim);

	// {text}
	// ++++++
	private _h5block: RegExp = XRegExp(/^[^\+\s]+(\r\n|\r|\n)\+\++/gim);

	// {text}
	// ######
	private _h6block: RegExp = XRegExp(/^[^#\s]+(\r\n|\r|\n)##+/gim);

	// _test_
	private _italic: RegExp = XRegExp(/(\_)[^\_\n]*?\1/gim);

	// keywords for this mode
	private _keyword: RegExp = XRegExp(/\w+::/gim);

	// [text]
	private _link1: RegExp = XRegExp(/(\[)([^\]]*)(\])(?![\[\(])/gim);

	// . {text}
	// + {text}
	// - {text}
	// * {text}
	// ##. {text}
	private _list: RegExp = XRegExp(
		/^\s*(?=([\*\-\+\.])+)\1* |^\s*(?=(\w+\.))\2*\s(?![ \t]+)/gim
	);

	// +test+ or `test`
	private _mono: RegExp = XRegExp(/(\+)[^\+\n]*?\1|(`)[^`\n]*?\2/gim);

	// .text to end of line
	private _option: RegExp = XRegExp(/^[ \t]*\.(?![\s.]).+/gim);

	// [line-through]#test#
	private _strikethrough: RegExp = XRegExp(/\[line-through\]#[^#]*?#/gim);

	// [underline]#test#
	private _underline: RegExp = XRegExp(/\[underline\]#[^#]*?#/gim);

	constructor(quill: any) {
		super(quill);
		debug("creating asciidoc mode %o", quill);
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
		this.colorize(
			this.subText,
			this._strikethrough,
			this.style.strikethrough
		);
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
		this.annotateInline(this.selection, "*");
	}

	public handleHeader(level: number) {
		switch (level) {
			case 1:
				this.annotateLine(this.line, "=");
				break;
			case 2:
				this.annotateLine(this.line, "==");
				break;
			case 3:
				this.annotateLine(this.line, "===");
				break;
			case 4:
				this.annotateLine(this.line, "====");
				break;
			case 5:
				this.annotateLine(this.line, "=====");
				break;
			case 6:
				this.annotateLine(this.line, "======");
				break;

			case 0:
			default:
				break;
		}
	}

	public handleItalic() {
		this.annotateInline(this.selection, "_");
	}

	public handleMono() {
		if (
			this.selection.start === this.selection.end ||
			this.selection.multiLine
		) {
			this.annotateBlock(this.selection, "----", "----");
		} else {
			this.annotateInline(this.selection, "+");
		}
	}

	public handleStrikeThrough(): void {
		this.annotateLine(this.selection, "[line-through]#", "#", "");
	}

	public handleUnderline(): void {
		this.annotateLine(this.selection, "[underline]#", "#", "");
	}
}
