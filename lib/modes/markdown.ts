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

	// TODO: FIXME:
	private _admonition: RegExp = XRegExp(/^(\s*)(TODO|FIXME|IMPORTANT|WARNING|TIP)(:\s+)/gmi);

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
	private _list: RegExp = XRegExp(/^\s*([\*\-\+]{1})[ \t]+|^\s*\w+\.[ \t]+/gmi);

	// # {text}
	private _h1: RegExp = XRegExp(/^# .*/gmi);

	// ## {text}
	private _h2: RegExp = XRegExp(/^## .*/gmi);

	// ### {text}
	private _h3: RegExp = XRegExp(/^### .*/gmi);

	// #### {text}
	private _h4: RegExp = XRegExp(/^#### .*/gmi);

	// ##### {text}
	private _h5: RegExp = XRegExp(/^##### .*/gmi);

	// ###### {text}
	private _h6: RegExp = XRegExp(/^###### .*/gmi);

	// {text}
	// ======
	private _h1block: RegExp = XRegExp(/.+(\r\n|\r|\n)==+/gi);

	// {text}
	// ------
	private _h2block: RegExp = XRegExp(/.+(\r\n|\r|\n)--+/gi);

	// ```{language}
	// {code}
	// ```
	private _code: RegExp = XRegExp(/(```)[^`]+?\1/gi);

	// ${formula}$
	// \({formula}\)
	// \[{formula}\]
	private _formulaInline: RegExp = XRegExp(/(\$(?!$))[^\$^\n]+\1|(\\\()[^(\\\)\n)]*?\\\)|(\\\[)[^(\\\]\n)]*?\\\]/gi);

	// $$
	// {formula}
	// $$
	//
	// \\(
	// {formula}
	// \\)
	//
	// \\[
	// {formula}
	// \\]
	private _formulaBlock: RegExp = XRegExp(/^(\${2})[^\1]*?\1|^(\\{2}\()[^(\\\))]*?\\{2}\)|^(\\{2}\[)[^(\\\])]*?\\{2}\]/gmi);

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

		this.colorizeGroup(this.subText, this._admonition, {
			color: this.style.admonition,
			background: this.style.admonitionBackground
		});

		this.colorize(this.subText, this._formulaInline, this.style.formula);
		this.colorize(this.subText, this._mono, this.style.mono);
	}

	public highlightBlock() {
		this.colorizeBlock(this.text, this._h1block, this.style.h1);
		this.colorizeBlock(this.text, this._h2block, this.style.h2);
		this.colorizeBlock(this.text, this._formulaBlock, this.style.formula);
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
