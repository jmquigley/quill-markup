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

	private _delay: number = 200;
	private _processing: boolean = false;

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

	/**
	 * @return {Section} the line at the current cursor.  It is given as a
	 * Section block.
	 */
	get line(): Section {
		return getLine(this.text, this.pos);
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
	 * @return {string} when the markup function is called it works with a
	 * substring.  This function returns the last substring given to markup
	 * This corresponds to the current setion.
	 */
	get subText() {
		return this._subText;
	}

	/**
	 * @return {string} the current text string of the editor buffer.
	 */
	get text() {
		return rstrip(this.quill.getText());
	}

	public abstract handleBold(): void;
	public abstract handleHeader(level: number): void;
	public abstract handleItalic(): void;
	public abstract handleStrikeThrough(): void;
	public abstract handleUnderline(): void;

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
	 * Applies a color format to th buffer based on the given regex string.
	 * It will search through the given buffer for strings to update.
	 * This uses the selected section from the main buffer to compute the
	 * start offset.  This doesn't search the whole buffer, but a "subText"
	 * region of the buffer.
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

	/**
	 * When the document changes this function is invoked to reapply the
	 * highlighting.  This is the base class function that saves the section
	 * range and removes the formatting from that range.  The mode is then
	 * responsible for reapplying the format to that range via callback.
	 *
	 * This function provides a callback that can be used by the implementing
	 * modes to use for colorization.  It's possible to apply coloring after
	 * each key stroke, but that results in a lot of wasted computing and
	 * severly degrades performance.  There is no reason to keep reapplying
	 * after each keystroke.  This callback is placed on a timer so when
	 * changes start the colorization will only occur after that delay has
	 * ended.  That means the highlighting will reprocess 3 times per second
	 * (if the document is dirty)
	 *
	 * The implementing node should use a super call to invoke this method.
	 *
	 * @param start {number} the starting location within the full document
	 * where markdown changes should be scanned.
	 * @param end {number} the ending location within the full document
	 * where markdown changes should be scanned
	 * @param [cb] {Function} a callback function that is invoked when a
	 * timer finishes.  The timer is set to 300ms.
	 */
	public markup(start: number, end: number, cb?: any): void {
		this._end = end;
		this._start = start;
		this._subText = this.text.substring(start, end);

		if (!this._processing && cb) {
			this._processing = true;
			setTimeout(() => {
				// Removes the markup around the document subsection before
				// reapplying the text to that region.
				this.quill.removeFormat(start, end - start, 'silent');

				cb();
				this._processing = false;
			}, this._delay);
		}
	}
}
