'use strict';

import {getQuill} from '../helpers';

const Quill = getQuill();

export const Inline = Quill.import('blots/inline');
export const Parchment = Quill.import('parchment');

// const debug = require('debug')('SyntaxBlot');

export class SyntaxBlot extends Inline {
	public static readonly blotName = 'syntax';
	public static readonly tagName = 'code';
	public static readonly scope = Parchment.Scope.INLINE;
}
