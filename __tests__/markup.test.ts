'use strict';

const mockCssModules = require('mock-css-modules');
mockCssModules.register(['.style', '.css']);

require('browser-env')();
require('./helpers/MutationObserver')(global);
require('./helpers/getSelection')(global);

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

afterAll((done) => {
	cleanup(path.basename(__filename), done);
});

beforeEach(() => {
	document.body.innerHTML = data;
	Quill.register('modules/markup', Markup);
	quill = new Quill('#editor', {
		theme: 'snow',
		modules: {
			markup: true
		}
	});

	expect(quill).toBeDefined();
});

test('Test adding the markup module to quill', () => {
	const markup = quill.getModule('markup');
	expect(markup).toBeDefined();
	expect(markup.editor).toBeDefined();
	expect(markup.editorKey).toBeDefined();
	expect(markup.modes).toEqual(['asciidoc', 'markdown', 'restructuredtext', 'text']);
});
