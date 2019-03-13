"use strict";

import * as fs from "fs-extra";
import * as path from "path";
import * as sinon from "sinon";
import {cleanup, Fixture} from "util.fixture";
import {join} from "util.join";

const debug = require("debug")("markup.test");

// can't use expect before the global require and jsdom initialization
import {Quill} from "../lib/helpers";
let quill: any = null;

import {Markup, MarkupMode} from "../index";

afterAll((done) => {
	cleanup({done, message: path.basename(__filename)});
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

test("Create Markup instance with Text mode", () => {
	const fixture = new Fixture("text");
	expect(fixture).toBeDefined();

	const md = fixture.read("file.txt");
	expect(md).toBeDefined();

	const markup = new Markup(quill, {
		content: md,
		mode: MarkupMode.text
	});

	expect(markup).toBeDefined();
	expect(markup.quill).toBeDefined();
	expect(markup.editor).toBeDefined();

	const delta = markup.quill.getContents();
	expect(delta).toBeDefined();
	debug("%j", delta);

	expect(delta).toMatchSnapshot();
});

test("Use markup set call to change the mode", () => {
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
		mode: MarkupMode.text
	});

	expect(markup.opts).toBeDefined();
	expect(markup.opts).toMatchSnapshot();
});

test("Use Markup bold call with Text", () => {
	const markup = new Markup(quill, {
		content: "test",
		mode: MarkupMode.text
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
	test(`Use Markup header ${level} call with Text`, () => {
		const markup = new Markup(quill, {
			content: "test",
			mode: MarkupMode.text
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

test("Use markup italic call with Text", () => {
	const markup = new Markup(quill, {
		content: "test",
		mode: MarkupMode.text
	});

	expect(markup).toBeDefined();
	expect(markup.quill).toBeDefined();
	expect(markup.editor).toBeDefined();

	markup.setItalic();

	const delta = markup.quill.getContents();
	expect(delta).toBeDefined();
	debug("%j", delta);

	expect(delta).toMatchSnapshot();
});

test("Use markup setMode call with Text", () => {
	const markup = new Markup(quill, {
		content: "test"
	});

	expect(markup).toBeDefined();
	expect(markup.quill).toBeDefined();
	expect(markup.editor).toBeDefined();

	markup.setMode("markdown");
	expect(markup.opts.mode).toBe(MarkupMode.markdown);
	markup.setMode("text");
	expect(markup.opts.mode).toBe(MarkupMode.text);

	const delta = markup.quill.getContents();
	expect(delta).toBeDefined();
	debug("%j", delta);

	expect(delta).toMatchSnapshot();
});

test("Use markup strikethrough call with Text", () => {
	const markup = new Markup(quill, {
		content: "test",
		mode: MarkupMode.text
	});

	expect(markup).toBeDefined();
	expect(markup.quill).toBeDefined();
	expect(markup.editor).toBeDefined();

	markup.setStrikeThrough();

	const delta = markup.quill.getContents();
	expect(delta).toBeDefined();
	debug("%j", delta);

	expect(delta).toMatchSnapshot();
});

test("Use markup underline call with Text", () => {
	const markup = new Markup(quill, {
		content: "test",
		mode: MarkupMode.text
	});

	expect(markup).toBeDefined();
	expect(markup.quill).toBeDefined();
	expect(markup.editor).toBeDefined();

	markup.setUnderline();

	const delta = markup.quill.getContents();
	expect(delta).toBeDefined();
	debug("%j", delta);

	expect(delta).toMatchSnapshot();
});

test("Click the editor and show that the handler is called", () => {
	const click = sinon.spy();
	const clickLink = sinon.spy();
	const link = "[name](link)";

	const markup = new Markup(quill, {
		content: link,
		followLinks: true,
		mode: MarkupMode.text,
		onClick: click,
		onClickLink: clickLink
	});

	expect(markup).toBeDefined();
	expect(markup.quill).toBeDefined();
	expect(markup.editor).toBeDefined();

	markup.editor.click();

	expect(click.calledOnce).toBe(true);
	expect(click.calledWith(0)).toBe(true);

	// There are no links in text mode, so expect should show no calls
	expect(clickLink.calledOnce).toBe(false);

	const delta = markup.quill.getContents();
	expect(delta).toBeDefined();
	debug("%j", delta);

	expect(delta).toMatchSnapshot();
});
