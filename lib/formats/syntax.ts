'use strict';

import Parchment from 'parchment';

const debug = require('debug')('SyntaxBlot');

export class SyntaxBlot extends Parchment.Inline {
	public static readonly blotName = 'syntax';
	public static readonly tagName = 'code';

	public static create(value: any): any {
		const node: any = super.create(value);
		// node.innerText = value;
		debug('node: %o', node);
		return node;
	}

	public static formats() {
		return true;
	}
}
