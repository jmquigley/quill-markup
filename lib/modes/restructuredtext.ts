'use strict';

import * as XRegExp from 'xregexp';
import {BaseMarkupMode} from './base';

const debug = require('debug')('RestructuredText');

export class RestructuredText extends BaseMarkupMode {

	// :text:
	private _attribute: RegExp = XRegExp(/:.+?:/gmi);

	// | text
	// | text
	private _blockquote: RegExp = XRegExp(/^\|.*/gmi);

	// **text**
	private _bold: RegExp = XRegExp(/(\*{2})[^\*\n]*?\1/gi);

	// ::
	// \n
	//     {code}
	// \n
	// \n
	private _code: RegExp = XRegExp(/(::)(\n *\n)([\S\s]*?)(^\n\n)/gmi);

	// *text*
	private _italic: RegExp = XRegExp(/(\*)[^\*\n]*?\1/gi);

	// text_
	// `text`_
	// |text|
	// [text]_
	private _link1: RegExp = XRegExp(/([\[_|`]*)(.*?)([_|`\]]+)/gmi);

	// _text
	private _link2: RegExp = XRegExp(/(_)(\w+)()/gmi);

	// .. [text] link/text
	// .. _text: link
	// .. image:: link
	// .. |text| text:: link
	private _link3: RegExp = XRegExp(/(\.\.[ ]+[\[_|]{0,1})(.+?)([\]:]+ *)(.*)/gmi);

	// `text <link>`_
	private _link4: RegExp = XRegExp(/( *`)(.+?)(<)(.+?)(>`_)/gmi);

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
	private _h1: RegExp = XRegExp(/(^={3,}(\r\n|\r|\n))(.*(\r\n|\r|\n))\1/gmi);
	// {text}

	// ======
	private _h2: RegExp = XRegExp(/^(\r\n|\r|\n)^[^=\s]+(\r\n|\r|\n)==+/gmi);

	// {text}
	// ------
	private _h3: RegExp = XRegExp(/^(\r\n|\r|\n)^[^-\s]+(\r\n|\r|\n)--+/gmi);

	// {text}
	// ******
	private _h4: RegExp = XRegExp(/^(\r\n|\r|\n)^[^\*\s]+(\r\n|\r|\n)\*\*+/gmi);

	// {text}
	// ~~~~~~
	private _h5: RegExp = XRegExp(/^(\r\n|\r|\n)^[^~\s]+(\r\n|\r|\n)~~+/gmi);

	// {text}
	// ^^^^^^
	private _h6: RegExp = XRegExp(/^(\r\n|\r|\n)^[^\^\s]+(\r\n|\r|\n)\^\^+/gmi);

	constructor(quill: any) {
		super(quill);
		debug('creating RestructuredText mode %o', quill);
	}

	public highlightInline() {
		this.colorize(this.subText, this._blockquote, this.style.blockquote);
		this.colorize(this.subText, this._attribute, this.style.attribute);
		this.colorize(this.subText, this._italic, this.style.italic);
		this.colorize(this.subText, this._bold, this.style.bold);
		this.colorize(this.subText, this._mono, this.style.mono);
		this.colorize(this.subText, this._list, this.style.list);

		this.colorizeLink(this._subText, this._url, {
			linkName: this.style.link,
			link: this.style.linkName
		});

		this.colorizeLink(this.subText, this._link1);
		this.colorizeLink(this.subText, this._link2);
		this.colorizeLink(this.subText, this._link3);
		this.colorizeLink(this.subText, this._link4);

		this.colorize(this._subText, this._email, this.style.link);

		super.highlightInline();
	}

	public highlightBlock() {
		this.colorizeBlock(this.text, this._h2, this.style.h2);
		this.colorizeBlock(this.text, this._h3, this.style.h3);
		this.colorizeBlock(this.text, this._h4, this.style.h4);
		this.colorizeBlock(this.text, this._h5, this.style.h5);
		this.colorizeBlock(this.text, this._h6, this.style.h6);
		this.colorizeBlock(this.text, this._h1, this.style.h1);
		this.codify(this.text, this._code);

		super.highlightBlock();
	}

	public handleBold() {
		this.annotateInline(this.selection, '**');
	}

	public handleHeader(level: number = 0) { level = level; }

	public handleItalic() {
		this.annotateInline(this.selection, '*');
	}

	public handleMono() {}
	public handleStrikeThrough() {}
	public handleUnderline() {}
}
