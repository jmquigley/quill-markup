'use strict';

const Quill = (window as any).Quill;
const Inline = Quill.import('blots/inline');
const Parchment = Quill.import('parchment');

// const debug = require('debug')('SyntaxBlot');

export class SyntaxBlot extends Inline {
	public static readonly blotName = 'syntax-block';
	public static readonly tagName = 'code';
	public static readonly scope = Parchment.Scope.INLINE;
}
