'use strict';

require('mock-css-modules');

import test from 'ava';
import * as fs from 'fs-extra';
import * as path from 'path';
import {Fixture} from 'util.fixture';
import {join} from 'util.join';
import {cleanup} from './helpers';

const debug = require('debug')('markup.test');
const data = fs.readFileSync(join(__dirname, 'fixtures', 'empty-html', 'index.html'));

const domCleanup = require('jsdom-global')(data);
require('./helpers/MutationObserver')(global);
require('./helpers/getSelection')(global);

(global as any).Quill = require('quill');

// can't use this before the global require and jsdom global
// initialization
import {Quill} from '../lib/helpers';
let quill: any = null;

import {Markup, MarkupMode} from '../index';

test.before(t => {
	quill = new Quill('#editor', {
		theme: 'snow'
	});

	t.truthy(quill);
});

test.after('final cleanup', t => {
	if (domCleanup) {
		domCleanup();
	}

	t.pass();
});

test.after.always.cb(t => {
	cleanup(path.basename(__filename), t);
});

test.skip('Test creation of the Markup instance', t => {
	const markup = new Markup(quill, {
		mode: MarkupMode.text
	});

	t.truthy(markup);
	t.truthy(markup.quill);
});

test.skip('Test creation of the Markup instance with markdown', t => {
	const markup = new Markup(quill, {
		mode: MarkupMode.markdown
	});

	t.truthy(markup);
	t.truthy(markup.quill);
});

test.skip('Test markdown highlighting', t => {
	const fixture = new Fixture('markdown');
	t.truthy(fixture);

	const md = fixture.read('file.md');
	t.truthy(md);

	const markup = new Markup(quill, {
		content: md,
		mode: MarkupMode.markdown
	});

	t.truthy(markup);
	t.truthy(markup.quill);

	const delta = markup.quill.getContents();
	t.truthy(delta);
	debug('%j', delta);

	t.snapshot(delta);
});
