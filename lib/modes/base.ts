'use strict';

export abstract class BaseMarkupMode {

	protected _content: string;
	protected _end: number;
	protected _quill: any;
	protected _start: number;
	protected _style: any;
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

	get quill() {
		return this._quill;
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

	get text() {
		return this._text;
	}

	public abstract handleBold(): void;

	public markup(text: string, start: number, end: number): void {
		this._text = text;
		this._start = start;
		this._end = end;

		this.quill.removeFormat(start, end, 'silent');
	}
}
