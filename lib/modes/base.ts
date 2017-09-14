'use strict';

export abstract class BaseHighlightMode {

	protected _content: string;
	protected _style: any;
	protected _quill: any;

	constructor(quill: any) {
		this._quill = quill;
	}

	get content() {
		return this._content;
	}

	set content(val: string) {
		this._content = val;
	}

	get quill() {
		return this._quill;
	}

	get style() {
		return this._style;
	}

	set style(val: any) {
		this._style = val;
	}

	public abstract highlight(text: string, start: number, end: number): void;
}
