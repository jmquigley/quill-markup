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
 *         highlight: true
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

	private _editor: Element;
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
			fontSize: 12,
			mode: MarkupMode.text,
			styling: MarkupStyle.plain
		}, opts);

		this._editor = document.getElementById('editor');
		this._styles[MarkupStyle.monokai] = require('./styles/monokai.json');
		this._modes[MarkupMode.markdown] = new Markdown(quill);
		this._modes[MarkupMode.text] = new Text(quill);

		[
			'handleEditorChange',
			'handleSelection',
			'handleTextChange',
			'set',
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
		this._processor.content = opts.content;
		this._processor.style = this._styles[opts.styling];

		if (opts.content) {
			debug(`setting content: ${opts.content}`);
			this._quill.setText(opts.content);
		}

		this.setFont(opts.fontName);

		this._processor.markup(opts.content, 0, opts.content.length);
	}

	public setBold() {
		this._processor.handleBold();
	}

	public setFont(fontName: string) {
		// TODO: check for valid font name give, otherwise set default

		fontName = fontName.toLowerCase();
		debug('setting font: %s', fontName);

		for (const className of this._fonts) {
			this._editor.classList.remove(fonts[`font-${className}`]);
		}
		this._editor.classList.add(fonts[`font-${fontName}`]);
	}

	public setFontSize(fontSize: string) {
		debug('setting font size: %s', fontSize);
	}

	private handleEditorChange(eventName: string, ...args: any[]) {
		debug('handleEditorChange(%s), %o', eventName, args);
	}

	private handleSelection(range: any, oldRange: any, source: string) {
		debug('handleSelection -> range: %o, oldRange: %o, source: %s', range, oldRange, source);
		if (range) {
			this._pos = range.index;
			debug('position: %d', this.pos);
		}
	}

	private handleTextChange(delta: any, old: any, source: string) {
		debug('handleTextChange -> pos: %d, change: %o, old: %o, source: %s', this.pos, delta, old, source);

		const text: string = rstrip(this._quill.getText());
		this._processor.markup(text, 0, text.length);
	}
}
