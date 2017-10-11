'use strict';

const mockCssModules = require('mock-css-modules');
mockCssModules.register(['.style', '.css']);

require('browser-env')();
require('./helpers/MutationObserver')(global);
require('./helpers/getSelection')(global);

import test from 'ava';
import * as fs from 'fs-extra';
import * as path from 'path';
import {join} from 'util.join';
import {cleanup} from './helpers';

// const debug = require('debug')('markup.test');
const data = fs.readFileSync(join(__dirname, 'fixtures', 'empty-html', 'index.html')).toString('utf8');

(global as any).Quill = require('quill');

// can't use this before the global require and jsdom initialization
import {Quill} from '../lib/helpers';
let quill: any = null;

import {Markup} from '../index';

test.after.always.cb(t => {
	cleanup(path.basename(__filename), t);
});

test.beforeEach(t => {
	document.body.innerHTML = data;
	Quill.register('modules/markup', Markup);
	quill = new Quill('#editor', {
		theme: 'snow',
		modules: {
			markup: true
		}
	});

	t.truthy(quill);
});

test('Test adding the markup module to quill', t => {
	const markup = quill.getModule('markup');
	t.truthy(markup);
	t.truthy(markup.editor);
	t.truthy(markup.editorKey);
	t.deepEqual(markup.modes, ['markdown', 'text']);
});
