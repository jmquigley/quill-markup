'use strict';

import {BinaryTree, Comparator, SortedList} from 'util.ds';
import {Match, matches} from 'util.matches';
import {rstrip} from 'util.rstrip';
import {
	line as getLine,
	Section,
	section as getSection,
	word as getWord
} from 'util.section';
import * as XRegExp from 'xregexp';
import {Delta} from '../helpers';

const debug = require('debug')('base');
const hash = require('hash.js');

enum ParseType {
	BLOCK,
	INLINE
}

export interface MatchData {
	key: string;
	link?: Match;
}

const cmp: Comparator<MatchData> = (o1: MatchData, o2: MatchData): number => {
	if (o1.key === o2.key) {
		return 0;
	} else if (o1.key > o2.key) {
		return 1;
	}

	return -1;
};

export abstract class BaseMarkupMode {

	private static readonly INLINE_SIZE: 40;

	protected _blocksDirty: boolean = false;
	protected _blocks: SortedList<number> = new SortedList<number>();
	protected _blockID: BinaryTree<string> = new BinaryTree<string>();
	protected _delta: any = new Delta();
	protected _end: number;
	protected _links: BinaryTree<MatchData> = new BinaryTree<MatchData>(null, cmp);
	protected _pos: number = 0;
	protected _quill: any;
	protected _range: any;
	protected _start: number;
	protected _style: any;
	protected _subText: string;
	protected _text: string;

	// TODO: FIXME:
	protected _admonition: RegExp = XRegExp(/^(\s*)(TODO|FIXME|IMPORTANT|WARNING|TIP)(:\s+)/gmi);

	// ```{language}
	// {code}
	// ```
	protected _code: RegExp = XRegExp(/(```)[^`]+?\1/gi);

	// ${formula}$
	// \({formula}\)
	// \[{formula}\]
	protected _formulaInline: RegExp = XRegExp(/(\$(?!$))[^\$^\n]+\1|(\\\()[^(\\\)\n)]*?\\\)|(\\\[)[^(\\\]\n)]*?\\\]/gi);

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
	protected _formulaBlock: RegExp = XRegExp(/^(\${2})[^\1]*?\1|^(\\{2}\()[^(\\\))]*?\\{2}\)|^(\\{2}\[)[^(\\\])]*?\\{2}\]/gmi);

	// a valid URL
	protected _url: RegExp = XRegExp(/(\s*)([hflix][timr][tplnae][pekgf]?[se]?:.+?[]]\\|[hfli][tim][tplna][pekg]?[se]?:.+?)([\s])/gi);

	// [[{name}|{reference}]
	protected _wiki: RegExp = XRegExp(/(\[\[)([^|\]^\]]+)(\|{0,1})([^\]^\]]*){0,1}(\]\])/gi);

	constructor(quill: any) {
		this._quill = quill;

		[
			'annotateBlock',
			'annotateInline',
			'processBlockTokens',
			'processInlineTokens',
			'processLinkTokens',
			'processCodeTokens',
			'processInlineGroupTokens'
		]
		.forEach((fn: string) => {
			this[fn] = this[fn].bind(this);
		});
	}

	get end() {
		return this._end;
	}

	get areBlocksDirty(): boolean {
		return this._blocksDirty;
	}

	/**
	 * @return {Section} the line at the current cursor.  It is given as a
	 * Section block.
	 */
	get line(): Section {
		return getLine(this.text, this.pos);
	}

	get links(): BinaryTree<MatchData> {
		return this._links;
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

	/**
	 * @return {string} the current text string of the editor buffer.
	 */
	get text() {
		return rstrip(this.quill.getText());
	}

	/**
	 * Replaces the current text content in Quill with the given start
	 * @param val {string} the string used to replace current content in the editor
	 */
	set text(val: string) {
		this._quill.setText(val);
	}

	public abstract handleBold(): void;
	public abstract handleHeader(level: number): void;
	public abstract handleItalic(): void;
	public abstract handleStrikeThrough(): void;
	public abstract handleUnderline(): void;

	public highlightBlock() {
		this.colorizeBlock(this.text, this._formulaBlock, this.style.formula);
		this.codify(this.text, this._code);
	}

	public highlightInline() {
		this.colorizeLink(this._subText, this._url, {linkName: this.style.link});

		this.colorizeGroup(this.subText, this._wiki, {
			color: this.style.wiki,
			refColor: this.style.link
		});

		this.colorizeGroup(this.subText, this._admonition, {
			color: this.style.admonition,
			background: this.style.admonitionBackground
		});

		this.colorize(this.subText, this._formulaInline, this.style.formula);
	}

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
			this._delta.ops.length = 0;
			debug('annotating inline: "%o" with "%s", %O', selection, chevron, this);

			this._delta.retain(selection.start)
				.insert(chevron)
				.retain(selection.text.length)
				.insert(chevron);

			if (this._delta.ops.length > 0) {
				this.quill.setSelection(selection.end + 1);
				return this.quill.updateContents(this._delta);
			}
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
		let delta: any = null;

		if (selection && selection.text) {
			this._delta.ops.length = 0;
			debug('annotating block: "%o" with "%s":"%s"', selection, startChevron, endChevron);

			this._delta.retain(selection.start)
				.insert(`${startChevron} `)
				.retain(selection.text.length);

			let endWidth: number = 0;
			if (endChevron) {
				endWidth = endChevron.length;
				this._delta.insert(endChevron);
			}

			if (this._delta.ops.length > 0) {
				delta = this.quill.updateContents(this._delta);
				this.quill.setSelection(selection.end + startChevron.length + endWidth + 1);
			}
		}

		return delta;
	}

	/**
	 * Searches for a fenced code region and applies syntax highlighting to it.
	 * @param text {string} the text buffer where the regex will look for
	 * matches.
	 * @param re {RegExp} the regular expression used for the search
	 * @return {Delta} the Delta created by this change
	 */
	public codify(text: string, re: RegExp) {
		return this.processRegex(text, re, this.processCodeTokens, ParseType.BLOCK);
	}

	/**
	 * Applies a single color format to the given buffer based on the given regex
	 * string. This uses the selected section from the main buffer to compute the
	 * start offset.  This doesn't search the whole buffer, but a "subText"
	 * region of the buffer given to the function.
	 * @param text {string} the text buffer where the regex will look for
	 * matches.
	 * @param re {RegExp} the regular expression used for the search
	 * @param color {string} the color string (hex or named) used for the
	 * formatting of the color.
	 * @return {Delta} the Delta created by this change
	 */
	public colorize(text: string, re: RegExp, color: string) {
		return this.processRegex(text, re, this.processInlineTokens, ParseType.INLINE, {color: color});
	}

	/**
	 * An inline color processor that uses regex groups to color a 3 part token
	 * The regex for this should have three groups:
	 *
	 * 1. initial chevron (like parens, bracket)
	 * 2. token string
	 * 3. closing chevron
	 *
	 * The color for 1 & 3 are determined by the chevron style color.  The token
	 * colors are set using the styling parameter object passed to the function.  This
	 * object should have `color` and/or `background` set to change the colors for The
	 * matched string.
	 * @param re {RegExp} the regular expression used for the search
	 * @param color {string} the color string (hex or named) used for the
	 * formatting of the color.
	 * @return {Delta} the Delta created by this change
	 */
	public colorizeGroup(text: string, re: RegExp, styling: any) {
		return this.processRegex(text, re, this.processInlineGroupTokens, ParseType.INLINE, styling);
	}

	/**
	 * Applies a single color over a given buffer based on the given regex.
	 * This call can span multiple lines in the regex, where the regular
	 * colorize works on a single line.
	 * @param text {string} the text buffer where the regex will look for
	 * matches.
	 * @param re {RegExp} the regular expression used for the search
	 * @param color {string} the color string (hex or named) used for the
	 * formatting of the color.
	 * @return {Delta} the Delta created by this change
	 */
	public colorizeBlock(text: string, re: RegExp, color: string) {
		return this.processRegex(text, re, this.processBlockTokens, ParseType.BLOCK, {color: color});
	}

	/**
	 * Special colorization function that adds colors to embedded links.  The
	 * given regex values must break the the string into three matching parts:
	 *
	 * - match 1 - the link name
	 * - match 2 - the url link
	 * - match 3 - an optional title value
	 *
	 * The color values for the link constituent parts is located in
	 * highlights.json.  They are: linkName, link, linkTitle, and linkChevron
	 *
	 * @param text {string} the text buffer where the regex will look for
	 * matches.
	 * @param re {RegExp} the regular expression used for the search
	 * @return {Delta} the delta structure created
	 */
	public colorizeLink(text: string, re: RegExp, styling: any = {}) {
		return this.processRegex(text, re, this.processLinkTokens, ParseType.INLINE, styling);
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
		this.clearBlockDetails();
		this.highlightInline();
		this.highlightBlock();
	}

	/**
	 * Scans the known block elements within the document and reapplies the formatting.
	 */
	public refreshBlock() {
		debug('refreshBlock');

		if (this._blocks.length > 0 && this._blocksDirty) {
			const arr = this._blocks.array;

			for (let i = 0; i < arr.length; i += 2) {
				this._start = arr[i];
				this._end = arr[i + 1];

				this.quill.removeFormat(this._start, this._end - this._start, 'silent');
				this.highlightBlock();
			}

			this.clearBlockDetails();
		}
	}

	/**
	 * Scans the entire document to reapply hihglighting.  All formatting rules are
	 * removed and reapplied.  This is expensive and slow, so use with caution on
	 * large documents.  This function is exposed to the markup interface so that the
	 * user could create a refresh button.  It is usd with an initial document that
	 * is placed in the control, or when a paste occurs.
	 */
	public refreshFull() {
		debug('refreshFull');
		this._blockID.clear();
		this.handleChange(0, this.text.length);
	}

	/**
	 * Scans a section of the document and applies formatting to the inline sections
	 * only.  It will skip block sections and only attempt to process lines that
	 * are not part of a block.
	 */
	public refreshInline() {
		debug('refreshInline');

		const section: Section = getSection(this.text, this.pos, BaseMarkupMode.INLINE_SIZE);

		if (this._blocks.length > 0) {

			// This is the list of blocks that reside within the refresh region
			const arr = this.getBlocks(section.start, section.end);
			this._start = section.start;
			this._end = arr[0] - 1;

			if (this._end < this._start) {
				this._start = this._end;
			}

			for (let i = 1; i < arr.length; i += 2) {
				this._subText = this.text.substring(this._start, this._end);
				this.quill.removeFormat(this._start, this._end - this._start + 1, 'silent');
				this.highlightInline();
				this._start = arr[i] + 1;
				this._end = arr[i + 1] - 1;
			}
		} else {
			this.handleChange(section.start, section.end);
		}
	}

	/**
	 * Resets all block detail elements back to their starting point.
	 */
	private clearBlockDetails() {
		this._blocksDirty = false;
		this._blocks.clear();
	}

	/**
	 * Retrieves an array of blocks that would appear within an insline
	 * section of the document.  It searches for points where the Section
	 * may bisect the block element and fixes the start/end index of the
	 * block when that happens.  The returned blocks should always have
	 * an even number of members (each block must have a start/end)
	 * @param start {number} the starting position within the section where
	 * the block may be.
	 * @param end {number} the ending position within the section where
	 * the block may be
	 * @return {number[]} an array containing the start/end locations for
	 * blocks that reside within a region.
	 */
	private getBlocks(start: number, end: number): number[] {
		let bstart: number = 0;
		let bend: number = 0;
		const arr = this._blocks.array;

		for (const pos of arr) {
			if (pos < start) bstart++;

			if (pos < end) {
				bend++;
			} else {
				break; // short circuit searching for blocks out of range
			}
		}

		if (bstart % 2) bstart--;
		if (bend % 2) bend++;

		return arr.slice(bstart, bend + 1);
	}

	/* private moveToEndOfLine() {
	   const text: string = this.text;
	   let pos: number = this.pos;

	   while (text[pos++] !== nl) {};
	   this.quill.setSelection(pos - 1);
	   }*/

	private processBlockTokens(tokens: Match[], styling: any) {
		let offset: number = tokens[0].start;

		for (const match of tokens) {
			this.saveBlockDetails(match);

			this._delta.retain(match.start - offset)
				.retain(match.end - match.start + 1, {color: styling.color});
			offset = match.end + 1;
		}
	}

	private processCodeTokens(tokens: Match[]) {
		let offset: number = tokens[0].start;

		for (const match of tokens) {
			this.saveBlockDetails(match);

			const header = getLine(match.text, 0).text;

			// Size of the code section minus the header, end chevrons
			// and the final newline
			const len = match.end - match.start - (header.length + 3);

			this._delta.retain(match.start - offset)
				.retain(3, {color: this.style.fence})
				.retain(header.length - 3, {color: this.style.language})
				.retain(len + 1, {'code-block': true})
				.retain(3, {color: this.style.fence});

			offset = match.end + 1;
		}
	}

	private processInlineTokens(tokens: Match[], styling: any) {
		let offset: number = 0;

		for (const match of tokens) {
			this._delta.retain(match.start - offset)
				.retain(match.end - match.start + 1, {color: styling.color});
			offset = match.end + 1;
		}
	}

	private processInlineGroupTokens(tokens: Match[], styling: any) {
		let offset: number = 0;

		styling = Object.assign({
			color: this.style.foreground,
			background: this.style.background,
			refColor: this.style.foreground,
			refBackground: this.style.background
		}, styling);

		for (const match of tokens) {
			this._delta.retain(match.start - offset);

			// left chevron grouping
			if (match.result[1]) {
				this._delta.retain(match.result[1].length, {color: this.style.chevron});
			}

			// token name
			if (match.result[2]) {
				this._delta.retain(match.result[2].length, {
					background: styling.background,
					color: styling.color
				});
			}

			// center chevron grouping
			if (match.result[3]) {
				this._delta.retain(match.result[3].length, {color: this.style.chevron});
			}

			// reference name
			if (match.result[4]) {
				this._delta.retain(match.result[4].length, {
					background: styling.refBackground,
					color: styling.refColor
				});
			}

			// right chevron grouping
			if (match.result[5]) {
				this._delta.retain(match.result[5].length, {color: this.style.chevron});
			}

			offset = match.end + 1;
		}
	}

	private processLinkTokens(tokens: Match[], styling: any) {
		let offset: number = 0;

		styling = Object.assign({
			linkName: this.style.linkName,
			link: this.style.link,
			linkTitle: this.style.linkTitle
		}, styling);

		for (const match of tokens) {
			this._delta.retain(match.start - offset);

			if (this._links.contains({key: match.text})) {
				this._links.remove({key: match.text});
			}
			this._links.insert({key: match.text, link: match});

			// left paren/bracket
			if (match.result[1]) {
				this._delta.retain(match.result[1].length, {color: this.style.chevron});
			}

			// link name
			if (match.result[2]) {
				this._delta.retain(match.result[2].length, {color: styling.linkName});
			}

			// right paren/bracket group
			if (match.result[3]) {
				this._delta.retain(match.result[3].length, {color: this.style.chevron});
			}

			// link url/reference
			if (match.result[4]) {
				this._delta.retain(match.result[4].length, {color: styling.link});
			}

			// left paren/bracket group
			if (match.result[5]) {
				this._delta.retain(match.result[5].length, {color: this.style.chevron});
			}

			// optional title
			if (match.result[6]) {
				this._delta.retain(match.result[6].length, {color: styling.linkTitle});
			}

			offset = match.end + 1;
		}
	}

	/**
	 * Takes a string and a given regex, finds matches, and then loops through
	 * each match calling a handler function to process the matches.  The
	 * handler function is dynamic.  There are two start locations: INLINE and
	 * BLOCK.  The INLINE type computes a start location based on the current
	 * line position.  The BLOCK type uses the location of the first match
	 * in the regex within the full document.
	 * @param text {string} the data the regex will use to find matches.
	 * @param re {RegExp} the regular expression used to find matching tokens
	 * @param handler {Function} the function that will process all of the
	 * matches found by the regex matcher.
	 * @param styling {any} custom styling object used by the handler.  This
	 * is just passed through to the handler function.
	 * @return {Delta} the delta object generate from the regex matches.
	 */
	private processRegex(text: string, re: RegExp, fn: any, parseType: ParseType, styling?: any) {
		this._delta.ops.length = 0;
		const tokens = matches(text, re);

		if (tokens.length > 0) {
			if (parseType === ParseType.INLINE) {
				this._delta.retain(this.start);
			} else {
				this._delta.retain(tokens[0].start);
			}

			fn(tokens, styling);

			if (this._delta.ops.length > 0) {
				return this.quill.updateContents(this._delta, 'silent');
			}
		}

		return this._delta;
	}

	/**
	 * When a block structure is encountered its details like the start/end offset
	 * of the block are saved.  It also creates a hash of the block area text.  These
	 * details are used to determine when updates should occur to block sections.
	 *
	 * When `refreshBlocks` is called, the details of this function are used to
	 * determine if any of the current blocks were new (with `blocksDirty`).
	 *
	 * The `blocksDirty' is set to true when a block's hash is not found.
	 *
	 * When that is true, a new block was encountered, so refresh must occur for
	 * block elements.  When it is false, none of the blocks changed, so they do not
	 * need to have their formats removed and reparsed for highlights (which is more
	 * expensive and visually uglier than this code).
	 *
	 * @param match [Match] the section of the document that matached a regex for
	 * a block element.
	 */
	private saveBlockDetails(match: Match) {
		this._blocks.insert(match.start);
		this._blocks.insert(match.end + 1);

		const blockHash = hash.sha256().update(match.text).digest('hex');

		if (!this._blockID.contains(blockHash)) {
			this._blocksDirty = true;
			this._blockID.insert(blockHash);
		}
	}

}
