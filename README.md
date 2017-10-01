# quill-markup

> A markup highlighting module for the [Quill](https://quilljs.com/) text editor

[![Build Status](https://travis-ci.org/jmquigley/quill-markup.svg?branch=master)](https://travis-ci.org/jmquigley/quill-markup)
[![tslint code style](https://img.shields.io/badge/code_style-TSlint-5ed9c7.svg)](https://palantir.github.io/tslint/)
[![Test Runner](https://img.shields.io/badge/testing-ava-blue.svg)](https://github.com/avajs/ava)
[![NPM](https://img.shields.io/npm/v/quill-markup.svg)](https://www.npmjs.com/package/quill-markup)
[![Coverage Status](https://coveralls.io/repos/github/jmquigley/quill-markup/badge.svg?branch=master)](https://coveralls.io/github/jmquigley/quill-markup?branch=master)

## Requirements

- Quill v1.3.2
- Yarn 1.0.x


## Installation

This module uses [yarn](https://yarnpkg.com/en/) to manage dependencies and run scripts for development.

To install as an application dependency:
```
$ yarn add --dev quill-markup
```

To build the app and run all tests:
```
$ yarn run all
```

To start a web server and view a demo of this module use:
```
$ yarn start
```
This will start a local express web server @ http://localhost:4000

If developing the module use the webpack watcher to automatically build changes with:

```
$ yarn start watch
```
This will detect changes and rebuild the bundle for testing with the web server in the previous step.  Both should be running.


## Overview
This is a custom [Quill](https://quilljs.com/) module turns the WYSIWYG editor into a a fixed text markup editor (for modes like markdown, restructured text, etc).  It takes advantage of the underlying api for styling, undo/redo, keyboard handling, and syntax highlighting.


## Usage

```javascript
import {Markup, MarkupMode} from 'quill-markup';

let keybindings = {
	tab: {
    	key: 9,
    	handler: function(range) {
 			this.quill.insertText(range.index, '    ');
			return false;
    	}
  	},
	'indent code-block': null,
	'outdent code-block': null,
	'code exit': null,
	'embed left': null,
	'embed right': null,
	'embed left shift': null,
	'embed right shift': null,
	'list autofill': null
};

Quill.register('modules/markup', Markup);

let quill = new Quill('#editor', {
	clipboard: true,
	modules: {
		history: {
      		delay: 2000,
      		maxStack: 500,
      		userOnly: true
    	},
		keyboard: {
		    bindings: keybindings
		},
		markup: {
			followLinks: true,
			onChange: (text) => {
				// console.log(`Changing text: ${text}`);
			},
			onClick: (pos) => {
				console.log(`clicked pos: ${pos}`);
			},
			onClickLink: (link) => {
				console.log(`clicked link: ${link.text}`);
			}
		},
		syntax: {
			delay: 100
		},
		toolbar: null
	},
	theme: 'snow'
});

let markup = quill.getModule('markup');
markup.set({
	content: 'Hello World',
	custom: {
		background: 'black',
		foreground: 'white'
	},
	mode: MarkupMode.markdown
});
```

The code above registers a new module named `Markup' with Quill.  Once it is registered, and quill is instantiated, the reference to the module can be retrieved.  We use this reference and the api below to interact with the document (outside of normal editing).  This example creates a markdown editor instance.

![Markdown](markdown.png)


## API

#### attributes

#### methods

#### events

The mode exposes three events as part of the configuration:

- `onChange(text: string)` - Changes that are made to the editor are given as a parameter to this callback.  It is rate limited and will only call this handler every 250ms.
- `onClick(pos: number)` - When the editor is clicked this callback is invoked.  It is passed the location within the buffer where the click occurred.
- `onClickLink(link: string)` - A mode that contains links will invoke this callback when one of the links are clicked.  It is passed the string of the link that was pressed.


## Testing

Note that some of the testing is limited due to use of JSDOM.  This library, and Quill, rely on `getSelection` to deterime positions within the editor.  This function is not available in JSDOM and is a helper stub in this module (see `./test/helpers/getSelection.js`).  Right now I don't see a way to move around within the an instantiated editor within this DOM (to test things like inserting new characters randomly and testing undo/redo).  If any ever uses this and has suggestions on how to overcome this it would be most welcome.
