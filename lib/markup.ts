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

import {line as getLine, Section} from 'util.section';
import {Quill} from './helpers';
import {BaseMarkupMode, Markdown, Text} from './modes';

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
	idleDelay?: number;
	mode?: MarkupMode;
}

require('./styles.css');

const debug = require('debug')('markup');
const fonts = require('./fonts/fonts.css');
const pkg = require('../package.json');
debug(`fonts: ${JSON.stringify(fonts)}`);

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
		'inconsolata',
		'firamono',
		'sourcecodepro'
	];
	private _line: Section = {
		start: 0,
		end: 0,
		text: ''
	};
	private _modes: Map<MarkupMode, any> = new Map<MarkupMode, any>();
	private _opts: MarkupOptions;
	private _paste: boolean = false;
	private _processor: BaseMarkupMode;
	private _quill: any;

	constructor(quill: any, opts: MarkupOptions) {
		debug('Initializing markup module');

		this._quill = quill;
		this._opts = Object.assign({
			content: '',
			custom: {},
			dirtyLimit: 20,
			fontName: 'inconsolata',
			fontSize: 13,
			idleDelay: 2000,
			mode: MarkupMode.text
		}, opts);

		this._editor = document.getElementById('editor');

		debug('quill (local): %o', quill);
		debug('Quill (global) %o', Quill);

		this._modes[MarkupMode.markdown] = new Markdown(quill);
		this._modes[MarkupMode.text] = new Text(quill);

		// bind all potential callbacks to the class.
		[
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
		window.addEventListener('load', this.resetInactivityTimer);
		document.addEventListener('mousemove', this.resetInactivityTimer);
		document.addEventListener('click', this.resetInactivityTimer);
		document.addEventListener('keydown', this.resetInactivityTimer);

		this.set(opts);
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

		this._opts = opts = Object.assign(this._opts, opts);
		debug('current markup options: %o', this._opts);
		this._processor = this._modes[opts.mode];

		this._dirtyLimit = this._opts.dirtyLimit;
		this._idleDelay = this._opts.idleDelay;

		this._processor.style = Object.assign(
			{
				foreground: 'black',
				background: 'white'
			},
			(opts.mode === MarkupMode.text) ? {} : require('./highlighting.json'),
			opts.custom
		);
		debug('current highlighting styles: %o', this._processor.style);

		if (opts.content) {

			// Temporary code below.  This is just conveniece code for
			// testing.
			if (pkg['debug']) {
				opts.content = '*Hello World* \n';
				for (let i = 0; i < 25; i++) {
					for (let j = 0; j < 40; j++) {
						opts.content += `${String.fromCharCode(i + 97)} `;
					}
					opts.content += '\n';
				}
			}

			this.setContent(opts.content);
		}

		this.setFont(opts.fontName);
		this.setFontSize(opts.fontSize);

		this._editor.style['color'] = this._processor.style.foreground;
		this._editor.style['background-color'] = this._processor.style.background;

		this._line = getLine(opts.content, 0);
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
		this._processor.text = content;
	}

	/**
	 * Changes the current overall font for the editor.  This control works with
	 * mono fonts, so this will set it for all text.  The fonts are all defined
	 * in `./lib/fonts`.
	 * @param fontName {string} the name of the font to set.
	 */
	public setFont(fontName: string) {

		fontName = fontName.toLowerCase();
		if (!this._fonts.includes(fontName)) {
			fontName = this._fonts[0];
		}

		debug('setting font: %s', fontName);

		for (const className of this._fonts) {
			this._editor.classList.remove(fonts[`font-${className}`]);
		}
		this._editor.classList.add(fonts[`font-${fontName}`]);
	}

	/**
	 * Changes the current overall size of the fonts within the editor.
	 * @param fontSize {number} the number of pixels in the font sizing.  This
	 * will resolve to `##px`.
	 */
	public setFontSize(fontSize: number) {
		debug('setting font size: %spx', fontSize);
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

				this._changing = false;
			}, this._delay);
		}
	}
}
