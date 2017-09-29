/**
 * A custom Quill highlighting module for markup modes/styles.  It manages
 * multiple mode instances  that are used to apply text formatting to the
 * contents of the control.
 *
 * The module is added to the component per the API instructions:
 * https://quilljs.com/guides/building-a-custom-module/
 *
 * Once the module is initialized the highlighting mode can be changed with
 * the `set` functions.  This just changes what the reference internally to
 * another class that handles the formatting.
 *
 * #### Examples:
 *
 * ```javascript
 * import {MarkupMode, Markup} from './lib/markup';
 *
 * Quill.register('modules/markup', Markup);
 * const quill = new Quill('#editor', {
 *     modules: {
 *         history: {
 *             delay: 2000,
 *             maxStack: 500,
 *             userOnly: true
 *         },
 *         markup: {
 *             mode: MarkupMode.text,
 *             custom: {
 *                 foreground: 'black',
 *                 background: 'white',
 *             }
 *         },
 *         toolbar: false
 *     },
 *     theme: 'snow'
 * });
 * ...
 * const hl = quill.getModule('highlight');
 * hl.set({
 *     content: 'some value',
 *     mode: MarkupMode.markdown
 * });
 * ```
 *
 * Note that initial content cannot be set in the contructor to the module.
 * it is overwritten with the contents of the `#editor` div as Qill is
 * instatiated.  It can be set after creation of the Quill instance using
 * the `.setContent('')` function.
 *
 * @module Markup
 */

'use strict';

import {union} from 'lodash';
import {getFontList} from 'util.fontlist';
import {line as getLine, Section} from 'util.section';
import {Quill} from './helpers';
import {BaseMarkupMode, Markdown, Text} from './modes';

export type EventCallback = (val: any) => void;

const nilEvent: EventCallback = (val: any): void => {
	val = null;
};

export enum MarkupMode {
	markdown,
	text
}

export interface MarkupOptions {
	content?: string;
	custom?: any;
	dirtyLimit?: number;
	fontName?: string;
	fontSize?: number;
	followLinks?: boolean;
	idleDelay?: number;
	mode?: MarkupMode;
	onChange?: EventCallback;
	onClick?: EventCallback;
	onClickLink?: EventCallback;
}

const defaultOptions: MarkupOptions = {
	content: '',
	custom: {},
	dirtyLimit: 20,
	fontName: 'Fira Code',
	fontSize: 12,
	followLinks: false,
	idleDelay: 2000,
	mode: MarkupMode.text,
	onChange: nilEvent,
	onClick: nilEvent,
	onClickLink: nilEvent
};

require('./styles.css');

const debug = require('debug')('markup');
const pkg = require('../package.json');

export class Markup {

	// As the document is modified the number of characters that are changed
	// is counted.  When a "dirty" limit is reached and the user is idle then
	// a full rescan of the document block elements will occur.  The smaller
	// the limit, the sooner this will occur when idle.
	private _dirtyIdle: boolean = false;
	private _dirtyInline: boolean = false;
	private _dirtyCount: number = 10;
	private _dirtyLimit: number;

	// The time between each incremental section scan
	private _delay: number = 250;
	private _changing: boolean = false;

	// The time before idle detection
	private _idle: boolean = true;
	private _idleDelay: number = 2000;
	private _idleTimer: any;

	// A reference to the DOM editor node
	private _editor: HTMLElement;

	private _fonts: string[] = [
		'Fira Code',
		'Inconsolata',
		'Source Code Pro'
	];
	private _line: Section = {
		start: 0,
		end: 0,
		text: ''
	};
	private _modes: any = {};
	private _opts: MarkupOptions;
	private _paste: boolean = false;
	private _processor: BaseMarkupMode;
	private _quill: any;

	constructor(quill: any, opts: MarkupOptions) {
		debug('Initializing markup module');

		this._quill = quill;
		this._opts = Object.assign({}, defaultOptions, opts);

		this._editor = document.getElementById('editor');

		debug('quill (local): %o', quill);
		debug('Quill (global) %o', Quill);

		this._modes[MarkupMode.markdown] = new Markdown(quill);
		this._modes[MarkupMode.text] = new Text(quill);

		debug('modes: %O', this._modes);

		this._fonts = union(this._fonts, getFontList());
		debug('available fonts: %O', this.fonts);

		// bind all potential callbacks to the class.
		[
			'handleClick',
			'handleEditorChange',
			'handlePaste',
			'handleTextChange',
			'resetInactivityTimer',
			'markIdle',
			'redo',
			'set',
			'setBold',
			'setContent',
			'setItalic',
			'setFont',
			'setFontSize',
			'setHeader',
			'setMode',
			'setStrikeThrough',
			'setUnderline',
			'undo'
		]
		.forEach((fn: string) => {
			this[fn] = this[fn].bind(this);
		});

		quill.on('editor-change', this.handleEditorChange);
		quill.on('text-change', this.handleTextChange);

		this._editor.addEventListener('paste', this.handlePaste);
		this._editor.addEventListener('click', this.handleClick);

		window.addEventListener('load', this.resetInactivityTimer);
		document.addEventListener('mousemove', this.resetInactivityTimer);
		document.addEventListener('click', this.resetInactivityTimer);
		document.addEventListener('keydown', this.resetInactivityTimer);

		this.set(opts);
	}

	get fonts() {
		return this._fonts;
	}

	/**
	 * Resets the idle timer when the user does something in the app.
	 */
	private resetInactivityTimer() {
		this._idle = false;
		clearTimeout(this._idleTimer);
		this._idleTimer = setTimeout(this.markIdle, this._idleDelay);
	}

	/**
	 * When the user is idle for N seconds this function is called by a global
	 * timer to set a flag and rescan the full document.  This can be an
	 * expensive operation and we need to find the tradeoff limit
	 */
	private markIdle() {
		this._idle = true;

		if (this._dirtyIdle) {
			this._dirtyIdle = false;
			this._dirtyCount = 0;
			this._processor.refreshBlock();
		}

		if (this._dirtyInline) {
			this._processor.refreshInline();
			this._dirtyInline = false;
		}
	}

	/**
	 * Calls the quill history redo function
	 */
	public redo() {
		if (this._quill.history) {
			this._quill.history.redo();
		}
	}

	/**
	 * Rescans the entire document for highlighting.  This is a wrapper around
	 * the processor's full refresh function.
	 */
	public refresh() {
		this._processor.refreshFull();
		this._dirtyIdle = false;
		this._dirtyCount = 0;
		this._dirtyInline = false;
	}

	/**
	 * Changes the current highlighting mode and display style.  It also sets
	 * the content within control.
	 * @param opts {HighlightOptions} configuration options.  `mode` sets the
	 * editing mode.  `styling` sets the current display theme.  `custom` is
	 * an object that contains custom format colors (for highlights).  The
	 * `content` resets the content within the control.  If this is null it
	 * is ignored.
	 */
	public set(opts: MarkupOptions) {

		debug('current options before set: %o', this._opts);
		this._opts = Object.assign({}, defaultOptions, this._opts, opts);
		debug('current options: %o, new options: %o', this._opts, opts);

		this._processor = this._modes[this._opts.mode];
		debug('using processor: %O', this._processor)

		this._dirtyLimit = this._opts.dirtyLimit;
		this._idleDelay = this._opts.idleDelay;

		this._processor.style = Object.assign(
			{
				foreground: 'black',
				background: 'white'
			},
			(this._opts.mode === MarkupMode.text) ? {} : require('./highlighting.json'),
			this._opts.custom
		);
		debug('current highlighting styles: %o', this._processor.style);


		this.setContent(this._opts.content);
		this.setFont(this._opts.fontName);
		this.setFontSize(this._opts.fontSize);

		this._editor.style['color'] = this._processor.style.foreground;
		this._editor.style['background-color'] = this._processor.style.background;

		this._line = getLine(this._opts.content, 0);
		this._processor.refreshFull();
	}

	/**
	 * Will call the current processor's bold function to make the current
	 * highlight or word bold.
	 */
	public setBold() {
		this._processor.handleBold();
	}

	/**
	 * Will update the current content of the control with the given
	 * @param content {string} the new content settting for the editor.
	 */
	public setContent(content: string) {

		if (!content && pkg['debug']) {
			// Temporary code below.  This is just convenience code for
			// testing.
			content = '*Hello World* \n';
			for (let i = 0; i < 25; i++) {
				for (let j = 0; j < 40; j++) {
					content += `${String.fromCharCode(i + 97)} `;
				}
				content += '\n';
			}
		}

		this._opts.content = content;
		this._processor.text = content;
	}

	/**
	 * Changes the current overall font for the editor.  This control works with
	 * mono fonts, so this will set it for all text.  The fonts are all defined
	 * in `./lib/fonts`.
	 * @param fontName {string} the name of the font to set.
	 */
	public setFont(fontName: string) {
		if (!this._fonts.includes(fontName)) {
			fontName = this._fonts[0];
		}

		debug('setting font: %s', fontName);
		this._opts.fontName = fontName;
		this._editor.style.fontFamily = fontName;
	}

	/**
	 * Changes the current overall size of the fonts within the editor.
	 * @param fontSize {number} the number of pixels in the font sizing.  This
	 * will resolve to `##px`.
	 */
	public setFontSize(fontSize: number) {
		debug('setting font size: %spx', fontSize);
		this._opts.fontSize = fontSize;
		this._editor.style['font-size'] = `${fontSize}px`;
	}

	/**
	 * Calls the processor's current header creation function
	 * @param level {string} the level selected by the user
	 */
	public setHeader(level: string) {
		this._processor.handleHeader(Number(level));
	}

	/**
	 * Calls the current processor's italic function to make the current
	 * highlight or word italic.
	 */
	public setItalic() {
		this._processor.handleItalic();
	}

	/**
	 * Changes the current display mode for the markup processor
	 * @param mode {string} the name of the mode to set
	 */
	public setMode(mode: string) {
		// TODO: add check on mode in enum

		debug('setting mode: %s', mode);

		this.set({
			content: this._processor.text,
			mode: MarkupMode[mode]
		});
	}

	/**
	 * Calls the current processor's strikthrogh function to highlight the
	 * current word/selection.
	 */
	public setStrikeThrough() {
		this._processor.handleStrikeThrough();
	}

	/**
	 * Calls the current processor's underline function to highlight the
	 * current word/selection.
	 */
	public setUnderline() {
		this._processor.handleUnderline();
	}

	/**
	 * Calls the quill history undo function
	 */
	public undo() {
		if (this._quill.history) {
			this._quill.history.undo();
		}
	}

	/**
	 * This event is invoked whenever the mouse is clicked within the editor.
	 * It will call the user give onClick handler and pass the position within
	 * the editor that was clicked.
	 *
	 * If the `followLinks` configuration option is given, then another handler
	 * is called that will check if the clicked position is a link.  If it is,
	 * then the regex match object that found this link is returned to the
	 * callback (giving the full text, start/end offsets, and groups).
	 */
	private handleClick() {
		this._opts.onClick(this._processor.pos);

		if (this._opts.followLinks) {
			const pos: number = this._processor.pos;
			for (const it of this._processor.links) {

				if (pos >= it.link.start && pos <= it.link.end) {
					this._opts.onClickLink(it.link);
					break;
				}
			}
		}
	}

	/**
	 * This event is invoked whenever a change occurs in the editor (any type).
	 * @param eventName {string} the name of the event that occurred.
	 * @param args {any[]} the dyanamic parameter list passed to this event.
	 */
	private handleEditorChange(eventName: string, ...args: any[]) {
		// debug('handleEditorChange: %s, %o', eventName, args);
		if (eventName === 'selection-change') {
			const range = args[0];
			if (range) {
				this._processor.range = range;
				this._processor.pos = range.index;
			}

			// Compute the line that will be involved in highlighting
			this._line = getLine(this._processor.text, this._processor.pos);
		}
	}

	/**
	 * When the user pastes information into the editor, this event is fired
	 */
	private handlePaste() {
		this._paste = true;
	}

	/**
	 * Invoked with each change of the content text.
	 *
	 * This will also hold a timer to peform a full scan after N seconds.
	 * Using "sections" to format has a trade off where a block format on
	 * a boundary of a section can lose formatting where the bottom of the
	 * block is seen by the section, but the top is not, so the regex string
	 * will not match within the section.  This timer will send a full
	 * range of the document to the processor after N seconds (5 seconds by
	 * default).  The timer will only occur when changes occur (so it is
	 * idle if the keyboard is idle)
	 */
	private handleTextChange(delta?: any, old?: any, source?: string) {
		delta = old = null;

		if (source === 'user' && this._dirtyCount++ > this._dirtyLimit) {
			this._dirtyIdle = true;
		}

		this._dirtyInline = true;

		if (!this._changing || this._paste) {
			this._changing = true;
			setTimeout(() => {
				if (this._paste) {
					this._processor.refreshFull();
					this._paste = false;
				} else {
					this._processor.handleChange(this._line.start, this._line.end);
				}

				this._opts.onChange(this._processor.text);

				this._changing = false;
			}, this._delay);
		}
	}
}
