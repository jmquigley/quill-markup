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
	private _processor: BaseHighlightMode;
	private _quill: any;
	private _styles: Map<string, any> = new Map<string, any>();

	constructor(quill: any, opts: HighlightOptions) {
		debug('Initializing highlight module');

		this._quill = quill;

		this._styles[HighlightStyle.monokai] = require('./styles/monokai.json');
		this._modes[HighlightMode.markdown] = new Markdown(quill);
		this._modes[HighlightMode.text] = new Text(quill);
		this.handleChange = this.handleChange.bind(this);
		quill.on('text-change', this.handleChange);
		this.set(opts);
	}

	public set(opts: HighlightOptions) {

		this._opts = opts = Object.assign({
			mode: HighlightMode.text,
			styling: HighlightStyle.plain,
			custom: {},
			content: ''
		}, opts);

		this._processor = this._modes[opts.mode];
		this._processor.content = opts.content;
		this._processor.style = this._styles[opts.styling];

		debug(`initial content: ${opts.content}`);
		this._quill.setText(opts.content);
	}

	private handleChange(delta: any, old: any, source: string) {
		debug(`highlight change: %o, old: %o, source: %s`, delta, old, source);

		const text: string = this._quill.getText();
		this._processor.highlight(text, 0, text.length);
	}
}
