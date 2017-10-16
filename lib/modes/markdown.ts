'use strict';

import * as XRegExp from 'xregexp';
import {BaseMarkupMode} from './base';

const debug = require('debug')('Markdown');

export class Markdown extends BaseMarkupMode {

	// **text**
	private _bold: RegExp = XRegExp(/(\*{2})[^\*\n]*?\1/gi);

	// *text*
	private _italic: RegExp = XRegExp(/(\*)[^\*\n]*?\1/gi);

	// _text_
	private _underline: RegExp = XRegExp(/(\_{1}).+?\1/gi);

	// ~text~
	private _strikethrough: RegExp = XRegExp(/(\~{1}).+?\1/gi);

	// `text`
	private _mono: RegExp = XRegExp(/(`{1})(?!\`).+?\1/gi);

	// > text
	private _blockquote: RegExp = XRegExp(/^>\s.*/gmi);

	// [text]
	private _link1: RegExp = XRegExp(/(\[)([^\]]*)(\])(?![\[\(])/gi);

	// [text](link) or ![text](link)
	private _link2: RegExp = XRegExp(/(!?\[)([^\]^\]\[^\]\]]*)(\]\()([^\]\)]*)(\))/gi);

	// [text][id] or ![text][id]
	private _link3: RegExp = XRegExp(/(!?\[)([^\]^\]\[^\]\]]*)(\]\[)([^\]]*)(\])/gi);

	// [text]: [url] "title"
	private _link4: RegExp = XRegExp(/(\[)([^\]^\]\[^\]\]]*)(\]\:\s+)([^\s]+)(\s+)("[^"]*?"){0,1}/gi);

	// + {text}
	// - {text}
	// * {text}
	// ##. {text}
	private _list: RegExp = XRegExp(/^\s*(?=([\*\-\+]{1})+)\1*|^\s*(?=(\w+\.))\2*\s(?![ \t]+)/gmi);

	// # {text}
	private _h1: RegExp = XRegExp(/^#\s+.*/gmi);

	// ## {text}
	private _h2: RegExp = XRegExp(/^#{2}\s+.*/gmi);

	// ### {text}
	private _h3: RegExp = XRegExp(/^#{3}\s+.*/gmi);

	// #### {text}
	private _h4: RegExp = XRegExp(/^#{4}\s+.*/gmi);

	// ##### {text}
	private _h5: RegExp = XRegExp(/^#{5}\s+.*/gmi);

	// ###### {text}
	private _h6: RegExp = XRegExp(/^#{6}\s+.*/gmi);

	// {text}
	// ======
	private _h1block: RegExp = XRegExp(/^[^=\s]+(\r\n|\r|\n)==+/gmi);

	// {text}
	// ------
	private _h2block: RegExp = XRegExp(/^[^-\s]+(\r\n|\r|\n)--+/gmi);

	private _hr: RegExp = XRegExp(/^\-{3,}|^\*{3,}|^_{3,}/gmi);

	// ```{language}
	// {code}
	// ```
	protected _code: RegExp = XRegExp(/(^\n[ \t]*```)(.*\s)([^`]*?)(```.*\s)/gmi);

	// <!-- comment -->
	protected _comment: RegExp = XRegExp(/<!--[\S\s]*?-->/gmi);

	constructor(quill: any) {
		super(quill);
		debug('creating markdown mode %o', quill);
	}

	public highlightInline() {
		this.colorize(this.subText, this._blockquote, this.style.blockquote);
		this.colorize(this.subText, this._list, this.style.list);
		this.colorize(this.subText, this._italic, this.style.italic);
		this.colorize(this.subText, this._bold, this.style.bold);
		this.colorize(this.subText, this._strikethrough, this.style.strikethrough);
		this.colorize(this.subText, this._underline, this.style.underline);
		this.colorize(this.subText, this._hr, this.style.hr);
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

		this.colorizeLink(this.subText, this._link1);
		this.colorizeLink(this.subText, this._link2);
		this.colorizeLink(this.subText, this._link3);
		this.colorizeLink(this.subText, this._link4);
		this.colorize(this._subText, this._email, this.style.link);

		this.colorize(this.subText, this._mono, this.style.mono);

		super.highlightInline();
	}

	public highlightBlock() {
		this.colorizeBlock(this.text, this._comment, this.style.comment);

		this.colorizeBlock(this.text, this._h1block, this.style.h1);
		this.colorizeBlock(this.text, this._h2block, this.style.h2);
		this.codify(this.text, this._code);

		super.highlightBlock();
	}

	public handleBold() {
		this.annotateInline(this.selection, '**');
	}

	public handleHeader(level: number) {
		switch (level) {
			case 1: this.annotateLine(this.line, '#'); break;
			case 2: this.annotateLine(this.line, '##'); break;
			case 3: this.annotateLine(this.line, '###'); break;
			case 4: this.annotateLine(this.line, '####'); break;
			case 5: this.annotateLine(this.line, '#####'); break;
			case 6: this.annotateLine(this.line, '######'); break;

			case 0:
			default:
			break;
		}
	}

	public handleItalic() {
		this.annotateInline(this.selection, '*');
	}

	public handleMono() {
		if (this.selection.start === this.selection.end || this.selection.multiLine) {
			this.annotateBlock(this.selection, '```', '```');
		} else {
			this.annotateInline(this.selection, '`');
		}
	}

	public handleStrikeThrough() {
		this.annotateInline(this.selection, '~');
	}

	public handleUnderline() {
		this.annotateInline(this.selection, '_');
	}

}
