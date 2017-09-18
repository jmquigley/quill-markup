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
 * import {MarkupMode, MarkupStyle, Markup} from './lib/markup';
 *
 * Quill.register('modules/markup', Markup);
 * const quill = new Quill('#editor', {
 *     modules: {
 *         highlight: {
 *             mode: MarkupMode.text,
 *             styling: MarkupStyle.plain
 *         }
 *     },
 *     theme: 'snow'
 * });
 * ...
 * const hl = quill.getModule('highlight');
 * hl.set({
 *     content: 'some value',
 *     mode: MarkupMode.markdown,
 *     styling: MarkupStyle.monokai
 * });
 * ```
 *
 * Note that initial content cannot be set in the contructor to the module.
 * it is overwritten with the contents of the `#editor` div.  It can be set
 * after creation of the Quill instance.
 *
 * @module Markup
 */

'use strict';

import {rstrip} from 'util.rstrip';
import {BaseMarkupMode, Markdown, Text} from './modes';

export enum MarkupMode {
	markdown,
	richedit,
	text
}

export enum MarkupStyle {
	custom = 'custom',
	plain = 'plain',
	monokai = 'monokai'
}

export interface MarkupOptions {
	content?: string;
	custom?: any;
	fontName?: string;
	fontSize?: number;
	mode: MarkupMode;
	styling: MarkupStyle;
}

const styles = require('./styles.css');
const fonts = require('./fonts/fonts.css');
const debug = require('debug')('markup');

debug(`styles: ${JSON.stringify(styles)}`);
debug(`fonts: ${JSON.stringify(fonts)}`);

export class Markup {

	private _editor: HTMLElement;
	private _fonts: string[] = [
		'inconsolata',
		'firamono',
		'sourcecodepro'
	];
	private _modes: Map<MarkupMode, any> = new Map<MarkupMode, any>();
	private _opts: MarkupOptions;
	private _pos: number = 0;
	private _processor: BaseMarkupMode;
	private _quill: any;
	private _styles: Map<string, any> = new Map<string, any>();

	constructor(quill: any, opts: MarkupOptions) {
		debug('Initializing markup module');

		this._quill = quill;
		this._opts = Object.assign({
			content: '',
			custom: {},
			fontName: 'inconsolata',
			fontSize: 13,
			mode: MarkupMode.text,
			styling: MarkupStyle.plain
		}, opts);

		this._editor = document.getElementById('editor');
		this._styles[MarkupStyle.monokai] = require('./styles/monokai.json');
		this._modes[MarkupMode.markdown] = new Markdown(quill);
		this._modes[MarkupMode.text] = new Text(quill);

		// bind all potential callbacks to the class.
		[
			'handleEditorChange',
			'handleSelection',
			'handleTextChange',
			'set',
			'setBold',
			'setItalic',
			'setFont',
			'setFontSize'
		]
		.forEach((fn: string) => {
			this[fn] = this[fn].bind(this);
		});

		quill.on('editor-change', this.handleEditorChange);
		quill.on('selection-change', this.handleSelection);
		quill.on('text-change', this.handleTextChange);
	}

	/**
	 * @return {number} the current position within the buffer
	 */
	get pos(): number {
		return this._pos;
	}

	/**
	 * @return {Quill} the current Quill instance reference
	 */
	get quill(): any {
		return this._quill;
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
		this._processor.style = this._styles[opts.styling];

		if (opts.content) {
			debug(`setting content: ${opts.content}`);
			this.setContent(opts.content);
			this._quill.setText(opts.content);
		}

		this.setFont(opts.fontName);
		this.setFontSize(opts.fontSize);

		this._processor.markup(opts.content, 0, opts.content.length);
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
		this._processor.content = content;
	}

	/**
	 * Will call the current processor's italic function to make the current
	 * highlight or word italic.
	 */
	public setItalic() {
		this._processor.handleItalic();
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
	 * This event is invoked whenever a change occurs in the editor (any type).
	 * @param eventName {string} the name of the event that occurred.
	 * @param args {any[]} the dyanamic parameter list passed to this event.
	 */
	private handleEditorChange(eventName: string, ...args: any[]) {
		debug('handleEditorChange(%s), %o', eventName, args);
	}

	/**
	 * Whenver the user moves the cursor with the keyboad or clicks within the
	 * control with the mouse this event is invoked.  This will include single
	 * mouse or key clicks.
	 */
	private handleSelection(range: any, oldRange: any, source: string) {
		debug('handleSelection -> range: %o, oldRange: %o, source: %s', range, oldRange, source);
		if (range) {
			this._pos = range.index;
			debug('position: %d', this.pos);
		}
	}

	/**
	 * Invoked with each change of the content text.
	 */
	private handleTextChange(delta: any, old: any, source: string) {
		debug('handleTextChange -> pos: %d, change: %o, old: %o, source: %s', this.pos, delta, old, source);

		const text: string = rstrip(this._quill.getText());
		this._processor.markup(text, 0, text.length);
	}
}
