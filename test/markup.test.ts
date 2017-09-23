'use strict';

require('mock-css-modules');

import test from 'ava';
import * as fs from 'fs-extra';
import * as path from 'path';
import {join} from 'util.join';
// import {Fixture} from 'util.fixture';
import {getQuill} from '../lib/helpers';
import {cleanup} from './helpers';

const debug = require('debug')('markup.test');
const data = fs.readFileSync(join(__dirname, 'fixtures', 'empty-html', 'index.html'));
debug('data: %s', data);

const domCleanup = require('jsdom-global')(data);
require('./helpers/MutationObserver')(global);
require('./helpers/getSelection')(global);

(global as any).Quill = require('quill');
const Quill = getQuill();
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

test('Test creation of the Markup instance', t => {
	const markup = new Markup(quill, {
		mode: MarkupMode.text
	});

	t.truthy(markup);
});
