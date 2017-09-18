'use strict';

import test from 'ava';
import * as fs from 'fs-extra';
import * as path from 'path';
import {join} from 'util.join';
// import {Fixture} from 'util.fixture';
import {Markup, MarkupMode, MarkupStyle} from '../index';
import {cleanup} from './helpers';

const debug = require('debug')('markup.test');
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

test('Test creation of the Markup instance', t => {
	const markup = new Markup(quill, {
		mode: MarkupMode.text,
		styling: MarkupStyle.plain
	});

	t.truthy(markup);
});
