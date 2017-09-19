'use strict';

import {rstrip} from 'util.rstrip';
import {Section, word as getWord} from 'util.section';

export abstract class BaseMarkupMode {

	protected _content: string;
	protected _end: number;
	protected _pos: number = 0;
	protected _quill: any;
	protected _range: any;
	protected _start: number;
	protected _style: any;
	protected _subText: string;
	protected _text: string;

	constructor(quill: any) {
		this._quill = quill;
	}

	get content() {
		return this._content;
	}

	set content(val: string) {
		this._content = val;
	}

	get end() {
		return this._end;
	}

	get pos() {
		return this._pos;
	}

	set pos(val: number) {
		this._pos = val;
	}

	get quill() {
		return this._quill;
	}

	get range() {
		return this._range;
	}

	set range(val: any) {
		this._range = val;
	}

	get selection(): Section {
		let word: Section = null;
		if (this.range && this.range.length > 0) {
			word = {
				start: this.range.index,
				end: this.range.index + this.range.length - 1,
				text: this.text.substring(this.range.index, this.range.index + this.range.length)
			};
		} else {
			word = getWord(this.text, this.pos);
		}

		return word;
	}

	get start() {
		return this._start;
	}

	get style() {
		return this._style;
	}

	set style(val: any) {
		this._style = val;
	}

	/**
	 * @return {string} when the markup function is called it works with a
	 * substring.  This function returns the last substring given to markup
	 * This corresponds to the current setion.
	 */
	get subText() {
		return this._subText;
	}

	get text() {
		return rstrip(this.quill.getText());
	}

	public abstract handleBold(): void;
	public abstract handleItalic(): void;

	/**
	 * When the document changes this function is invoked to reapply the
	 * highlighting.  This is the base class function that saves the section
	 * range and removes the formatting from that range.  The mode is then
	 * responsible for reapplying the format to that range.
	 */
	public markup(start: number, end: number): void {
		this._end = end;
		this._start = start;
		this._subText = this.text.substring(start, end);

		// Removes the markup around the document subsection before
		// reapplying the text to that region.
		this.quill.removeFormat(start, end - start, 'silent');
	}
}
