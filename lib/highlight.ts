/**
 * A custom Quill highlighting module.  It manages multiple mode instances
 * that are used to apply text formatting to the contents of the control.
 *
 * The module is added to the component per the API instructions:
 * https://quilljs.com/guides/building-a-custom-module/
 *
 * Once the module is initialized the highlighting mode can be changed with
 * the `set` function.  This just changes what the reference internally to
 * another class that handles the formatting.
 *
 * #### Examples:
 *
 * ```javascript
 * import {EditorMode, EditorStyle, Highlight} from './modules';
 *
 * Quill.register('modules/highlight', Highlight);
 * const quill = new Quill('#editor', {
 *     formats: '',
 *     modules: {
 *         highlight: {
 *         }
 *     },
 *     theme: 'snow'
 * });
 * ...
 * const highlight = quill.getModule('highlight');
 * highlight.set({
 *     content: 'some value',
 *     mode: EditorMode.markdown,
 *     styling: EditorStyle.monokai
 * });
 * ```
 *
 * @module Highlight
 */

'use strict';

import {BaseHighlightMode, Markdown, Text} from './modes';

export enum HighlightMode {
	markdown,
	richedit,
	text
}

export enum HighlightStyle {
	custom = 'custom',
	plain = 'plain',
	monokai = 'monokai'
}

export interface HighlightOptions {
	content?: string;
	custom?: any;
	mode: HighlightMode;
	styling: HighlightStyle;
}

const debug = require('debug')('highlight');

export class Highlight {

	private _modes: Map<HighlightMode, any> = new Map<HighlightMode, any>();
	private _opts: HighlightOptions;
	private _pos: number = 0;
	private _processor: BaseHighlightMode;
	private _quill: any;
	private _styles: Map<string, any> = new Map<string, any>();

	constructor(quill: any, opts: HighlightOptions) {
		debug('Initializing highlight module');

		this._quill = quill;
		this._opts = Object.assign({
			mode: HighlightMode.text,
			styling: HighlightStyle.plain,
			custom: {},
			content: ''
		}, opts);

		this._styles[HighlightStyle.monokai] = require('./styles/monokai.json');
		this._modes[HighlightMode.markdown] = new Markdown(quill);
		this._modes[HighlightMode.text] = new Text(quill);

		this.handleEditorChange = this.handleEditorChange.bind(this);
		this.handleSelection = this.handleSelection.bind(this);
		this.handleTextChange = this.handleTextChange.bind(this);

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
	public set(opts: HighlightOptions) {

		this._opts = opts = Object.assign(this._opts, opts);
		debug('current highlight options: %o', this._opts);

		this._processor = this._modes[opts.mode];
		this._processor.content = opts.content;
		this._processor.style = this._styles[opts.styling];

		if (opts.content) {
			debug(`initial content: ${opts.content}`);
			this._quill.setText(opts.content);
		}
		this._processor.highlight(opts.content, 0, opts.content.length);
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

		const text: string = this._quill.getText();
		this._processor.highlight(text, 0, text.length);
	}
}
