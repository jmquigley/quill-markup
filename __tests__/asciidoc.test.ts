"use strict";

import * as fs from "fs-extra";
import * as path from "path";
// import * as sinon from 'sinon';
import {Fixture} from "util.fixture";
import {join} from "util.join";
import {cleanup} from "./helpers";

const debug = require("debug")("asciidoc.test");

// can't use this before the global require and jsdom initialization
import {Quill} from "../lib/helpers";
let quill: any = null;

import {Markup, MarkupMode} from "../index";

afterAll((done) => {
	cleanup(path.basename(__filename), done);
});

beforeEach(() => {
	const data = fs
		.readFileSync(join(__dirname, "fixtures", "empty-html", "index.html"))
		.toString("utf8");

	document.body.innerHTML = data;
	quill = new Quill("#editor", {
		theme: "snow"
	});

	expect(quill).toBeDefined();
});

test("Create Markup instance with Asciidoc mode", () => {
	const fixture = new Fixture("asciidoc");
	expect(fixture).toBeDefined();

	const txt = fixture.read("file.txt");
	expect(txt).toBeDefined();

	const markup = new Markup(quill, {
		content: txt,
		mode: MarkupMode.asciidoc
	});

	expect(markup).toBeDefined();
	expect(markup.quill).toBeDefined();
	expect(markup.editor).toBeDefined();

	markup.refresh();

	const delta = markup.quill.getContents();
	expect(delta).toBeDefined();
	debug("%j", delta);

	expect(delta).toMatchSnapshot();
});

test("Use markup set call to change the mode to asciidoc", () => {
	const markup = new Markup(quill);

	expect(markup).toBeDefined();
	expect(markup.quill).toBeDefined();
	expect(markup.editor).toBeDefined();

	markup.set({
		content: "test",
		custom: {
			background: "red",
			foreground: "yellow"
		},
		fontName: "Consolas",
		fontSize: 14,
		mode: MarkupMode.asciidoc
	});

	expect(markup.opts).toBeDefined();
	expect(markup.opts).toMatchSnapshot();
});

test("Use markup bold call with Asciidoc", () => {
	const markup = new Markup(quill, {
		content: "test",
		mode: MarkupMode.asciidoc
	});

	expect(markup).toBeDefined();
	expect(markup.quill).toBeDefined();
	expect(markup.editor).toBeDefined();

	markup.setBold();

	const delta = markup.quill.getContents();
	expect(delta).toBeDefined();
	debug("%j", delta);

	expect(delta).toMatchSnapshot();
});

for (const level of ["0", "1", "2", "3", "4", "5", "6"]) {
	test(`Use markup header ${level} call with Asciidoc`, () => {
		const markup = new Markup(quill, {
			content: "test",
			mode: MarkupMode.asciidoc
		});

		expect(markup).toBeDefined();
		expect(markup.quill).toBeDefined();
		expect(markup.editor).toBeDefined();

		markup.setHeader(level);

		const delta = markup.quill.getContents();
		expect(delta).toBeDefined();
		expect(delta).toMatchSnapshot();
	});
}
