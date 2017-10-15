'use strict';

import {BaseMarkupMode} from './base';

const debug = require('debug')('Asciidoc');

export class Asciidoc extends BaseMarkupMode {

	constructor(quill: any) {
		super(quill);
		debug('creating asciidoc mode %o', quill);
	}

	public highlightInline() {

		this.colorizeLink(this._subText, this._url, {
			linkName: this.style.link,
			link: this.style.linkName
		});

		this.colorize(this._subText, this._email, this.style.link);

		super.highlightInline();
	}

	public highlightBlock() {
		super.highlightBlock();
	}

	public handleBold(): void {}
	public handleHeader(level: number): void { level = 0; }
	public handleItalic(): void {}
	public handleStrikeThrough(): void {}
	public handleUnderline(): void {}
}
