'use strict';

import test from 'ava';
import * as fs from 'fs-extra';
import * as path from 'path';
import {join} from 'util.join';
// import {Fixture} from 'util.fixture';
import {Highlight, HighlightMode, HighlightStyle} from '../index';
import {cleanup} from './helpers';

const debug = require('debug')('highlight.test');
const data = fs.readFileSync(join(__dirname, 'fixtures', 'empty-html', 'index.html'));
debug('data: %s', data);

const domCleanup = require('jsdom-global')(data);
require('./helpers/MutationObserver')(global);
require('./helpers/getSelection')(global);

const Quill = require('quill');
let quill: any = null;

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

test('Test creation of the Highlight instance', t => {
	const highlight = new Highlight(quill, {
		mode: HighlightMode.text,
		styling: HighlightStyle.plain
	});

	t.truthy(highlight);
});
