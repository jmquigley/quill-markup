'use strict';

const mockCssModules = require('mock-css-modules');
mockCssModules.register(['.style', '.css']);

require('browser-env')();
require('./helpers/MutationObserver')(global);
require('./helpers/getSelection')(global);

import test from 'ava';
import * as fs from 'fs-extra';
import * as path from 'path';
// import * as sinon from 'sinon';
import {Fixture} from 'util.fixture';
import {join} from 'util.join';
import {cleanup} from './helpers';

const debug = require('debug')('restructured.test');
const data = fs.readFileSync(join(__dirname, 'fixtures', 'empty-html', 'index.html')).toString('utf8');

(global as any).Quill = require('quill');

// can't use this before the global require and jsdom initialization
import {Quill} from '../lib/helpers';
let quill: any = null;

import {Markup, MarkupMode} from '../index';

test.after.always.cb(t => {
	cleanup(path.basename(__filename), t);
});

test.beforeEach(t => {
	document.body.innerHTML = data;
	quill = new Quill('#editor', {
		theme: 'snow'
	});

	t.truthy(quill);
});

test('Create Markup instance with RestructuredText mode', t => {
	const fixture = new Fixture('restructuredtext');
	t.truthy(fixture);

	const txt = fixture.read('file.rst');
	t.truthy(txt);

	const markup = new Markup(quill, {
		content: txt,
		mode: MarkupMode.restructuredtext
	});

	t.truthy(markup);
	t.truthy(markup.quill);
	t.truthy(markup.editor);

	markup.refresh();

	const delta = markup.quill.getContents();
	t.truthy(delta);
	debug('%j', delta);

	t.snapshot(delta);
});
