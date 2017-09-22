'use strict';

import {matches} from 'util.matches';
import {rstrip} from 'util.rstrip';
import {
	line as getLine,
	Section,
	word as getWord
} from 'util.section';

const debug = require('debug')('base');

export abstract class BaseMarkupMode {

	protected _end: number;
	protected _pos: number = 0;
	protected _quill: any;
	protected _range: any;
	protected _start: number;
	protected _style: any;
	protected _subText: string;
	protected _syntax: any;
	protected _text: string;

	constructor(quill: any) {
		this._quill = quill;
	}

	get end() {
		return this._end;
	}

	/**
	 * @return {Section} the line at the current cursor.  It is given as a
	 * Section block.
	 */
	get line(): Section {
		return getLine(this.text, this.pos);
	}

	/**
	 * @return the current position within the buffer
	 */
	get pos() {
		return this._pos;
	}

	set pos(val: number) {
		this._pos = val;
	}

	/**
	 * @return a reference to the Quill instance for this editor instance
	 */
	get quill() {
		return this._quill;
	}

	/**
	 * @return {any} the current range object of the user selection/cursor
	 */
	get range() {
		return this._range;
	}

	set range(val: any) {
		this._range = val;
	}

	/**
	 * @return {Section} the word at the current cursor or the user highlighted
	 * region.  It is contained within a Section block.
	 */
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
	 * @return {string} when the highlight function is called it works with a
	 * substring.  This function returns the last substring computed when
	 * a change is detected.
	 */
	get subText() {
		return this._subText;
	}

	get syntax() {
		return this._syntax;
	}

	/**
	 * @return {string} the current text string of the editor buffer.
	 */
	get text() {
		return rstrip(this.quill.getText());
	}

	set text(val: string) {
		this._quill.setText(val);
	}

	public abstract handleBold(): void;
	public abstract handleHeader(level: number): void;
	public abstract handleItalic(): void;
	public abstract handleStrikeThrough(): void;
	public abstract handleUnderline(): void;
	public abstract highlight(): void;

	/**
	 * Takes a selection area from a document and applies a markup annotation
	 * to the beginning and end of the selection area.  This only works on a
	 * single line (inline)
	 * @param selection {Section} the text/location where the annotation will
	 * be applied
	 * @param chevron {string} the character string that will surround the
	 * selection
	 */
	public annotateInline(selection: Section, chevron: string) {
		if (selection && selection.text) {
			debug('annotating inline: "%o" with "%s"', selection, chevron);

			this.quill.insertText(selection.end + 1, chevron);
			this.quill.insertText(selection.start, chevron);
		}
	}

	/**
	 * Takes a selection area from the document and applies a surrounding block
	 * markup annotation (such as header).  This version allows the caller to
	 * set a start/end chevron value to surround the block.
	 * @param selection {Section} the text/location where the annotation will
	 * be applied.
	 * @param startChevron {string} the string that will be placed on the front
	 * of the block.
	 * @param [endChevron] {string} the string that will be placed on the end
	 * of the block.
	 */
	public annotateBlock(selection: Section, startChevron: string, endChevron?: string) {
		if (selection && selection.text) {
			debug('annotating block: "%o" with "%s":"%s"', selection, startChevron, endChevron);

			this.quill.insertText(selection.start, `${startChevron} `);

			let endWidth: number = 0;
			if (endChevron) {
				endWidth = endChevron.length;
				this.quill.insertText(selection.end + 2, endChevron);
			}

			this.quill.setSelection(selection.end + startChevron.length + endWidth + 1);
		}
	}

	/**
	 * Applies a color format to the given buffer based on the given regex string.
	 * This uses the selected section from the main buffer to compute the
	 * start offset.  This doesn't search the whole buffer, but a "subText"
	 * region of the buffer given to the function.
	 * @param text {string} the text buffer where the regex will look for
	 * matches.
	 * @param re {RegExp} the regular expression used for the search
	 * @param color {string} the color string (hex or named) used for the
	 * formatting of the color.
	 */
	public colorize(text: string, re: RegExp, color: string) {
		for (const match of matches(text, re)) {
			// debug('colorize match (%s): %o', match.text, match);

			const start = match.start + this.start;
			const len = match.end - match.start;

			this.quill.formatText(start, len, {
				color: color
			}, 'silent');
		}
	}

	public codify(text: string, re: RegExp) {

		for (const match of matches(text, re)) {
			// debug('colorize match (%s): %o', match.text, match);

			const header = getLine(match.text, 0).text;
			const start = match.start + header.length;
			const len = match.end - match.start - (header.length + 3);
			const code = match.text.slice(header.length, match.text.length - 4);

			debug('match: %o, start', match);
			debug('code: %s', code);

			this.quill.formatText(start, len, 'syntax', code, 'silent');
		}
	}

	/**
	 * When the document changes this function is invoked to reapply the
	 * highlighting.  This is the base class function that saves the section
	 * range and removes the formatting from that range.  The mode is then
	 * responsible for reapplying the format to that range via callback.
	 * @param start {number} the starting location within the full document
	 * where markdown changes should be scanned.
	 * @param end {number} the ending location within the full document
	 * where markdown changes should be scanned
	 */
	public handleChange(start: number, end: number): void {
		this._end = end;
		this._start = start;
		this._subText = this.text.substring(start, end);
		this.quill.removeFormat(start, end - start, 'silent');
		this.highlight();
	}
}
