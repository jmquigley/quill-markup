'use strict';

require('mock-css-modules');
require('browser-env')();
require('./helpers/MutationObserver')(global);
require('./helpers/getSelection')(global);

import test from 'ava';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as sinon from 'sinon';
import {Fixture} from 'util.fixture';
import {join} from 'util.join';
import {cleanup} from './helpers';

const debug = require('debug')('markup.test');
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

test('Create Markup instance with Markdown mode', t => {
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
	t.truthy(markup.editor);

	markup.refresh();

	const delta = markup.quill.getContents();
	t.truthy(delta);
	debug('%j', delta);

	t.snapshot(delta);
});

test('Use markup set call to change the mode', t => {
	const markup = new Markup(quill);

	t.truthy(markup);
	t.truthy(markup.quill);
	t.truthy(markup.editor);

	markup.set({
		content: 'test',
		custom: {
			background: 'red',
			foreground: 'yellow'
		},
		fontName: 'Consolas',
		fontSize: 14,
		mode: MarkupMode.markdown
	});

	t.truthy(markup.opts);
	t.snapshot(markup.opts);
});

test('Use markup bold call with Markdown', t => {
	const markup = new Markup(quill, {
		content: 'test',
		mode: MarkupMode.markdown
	});

	t.truthy(markup);
	t.truthy(markup.quill);
	t.truthy(markup.editor);

	markup.setBold();

	const delta = markup.quill.getContents();
	t.truthy(delta);
	debug('%j', delta);

	t.snapshot(delta);
});

for (const level of ['0', '1', '2', '3', '4', '5', '6']) {
	test(`Use markup header ${level} call with Markdown`, t => {
		const markup = new Markup(quill, {content: 'test', mode: MarkupMode.markdown});

		t.truthy(markup);
		t.truthy(markup.quill);
		t.truthy(markup.editor);

		markup.setHeader(level);

		const delta = markup.quill.getContents();
		t.truthy(delta);
		t.snapshot(delta);
	});
}

test('Use markup italic call with Markdown', t => {
	const markup = new Markup(quill, {
		content: 'test',
		mode: MarkupMode.markdown
	});

	t.truthy(markup);
	t.truthy(markup.quill);
	t.truthy(markup.editor);

	markup.setItalic();

	const delta = markup.quill.getContents();
	t.truthy(delta);
	debug('%j', delta);

	t.snapshot(delta);
});

test('Use markup setMode call with Markdown', t => {
	const markup = new Markup(quill, {
		content: 'test'
	});

	t.truthy(markup);
	t.truthy(markup.quill);
	t.truthy(markup.editor);

	t.is(markup.opts.mode, MarkupMode.text);
	markup.setMode('markdown');
	t.is(markup.opts.mode, MarkupMode.markdown);

	const delta = markup.quill.getContents();
	t.truthy(delta);
	debug('%j', delta);

	t.snapshot(delta);
});

test('Use markup strikethrough call with Markdown', t => {
	const markup = new Markup(quill, {
		content: 'test',
		mode: MarkupMode.markdown
	});

	t.truthy(markup);
	t.truthy(markup.quill);
	t.truthy(markup.editor);

	markup.setStrikeThrough();

	const delta = markup.quill.getContents();
	t.truthy(delta);
	debug('%j', delta);

	t.snapshot(delta);
});

test('Use markup underline call with Markdown', t => {
	const markup = new Markup(quill, {
		content: 'test',
		mode: MarkupMode.markdown
	});

	t.truthy(markup);
	t.truthy(markup.quill);
	t.truthy(markup.editor);

	markup.setUnderline();

	const delta = markup.quill.getContents();
	t.truthy(delta);
	debug('%j', delta);

	t.snapshot(delta);
});

test('Click the editor and show that the handler is called', t => {
	const click = sinon.spy();
	const clickLink = sinon.spy();
	const link = '[name](link)';

	const markup = new Markup(quill, {
		content: link,
		followLinks: true,
		mode: MarkupMode.markdown,
		onClick: click,
		onClickLink: clickLink
	});

	t.truthy(markup);
	t.truthy(markup.quill);
	t.truthy(markup.editor);

	markup.editor.click();

	t.true(click.calledOnce);
	t.true(click.calledWith(0));
	t.true(clickLink.calledOnce);
	t.is(clickLink.args[0][0].text, link);

	const delta = markup.quill.getContents();
	t.truthy(delta);
	debug('%j', delta);

	t.snapshot(delta);
});
